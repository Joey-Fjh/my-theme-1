/**
 * Stylesheet ownership lints (6-C6): no @layer in {% stylesheet %}, font-size ratchet, mixed-element ratchet.
 */

const fs = require('node:fs');
const path = require('node:path');
const { splitVariants, maskNonMarkup } = require('./migration-lint');

const BASELINE_RELATIVE_PATH =
    '.agents/skills/check-theme-architecture/scripts/stylesheet-ownership-baseline.json';
const TAILWIND_OUTPUT = 'assets/tailwind.output.css';

const RULE = {
    STYLESHEET_LAYER: 'stylesheet-layer',
    STYLESHEET_FONT_SIZE: 'stylesheet-font-size',
    MIXED_ELEMENT: 'mixed-element',
};

const MARKUP_DIRS = ['layout', 'sections', 'snippets'];

/** Utility names per built stylesheet path, so fixtures with different roots never share a set. */
const utilityNameCache = new Map();

function listMarkupFiles(root) {
    const files = [];
    for (const dir of MARKUP_DIRS) {
        const abs = path.join(root, dir);
        if (!fs.existsSync(abs)) continue;
        for (const name of fs.readdirSync(abs).sort()) {
            if (name.endsWith('.liquid')) files.push(`${dir}/${name}`);
        }
    }
    return files;
}

function stripCssComments(css) {
    return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

/** Remove balanced (...) groups, so classes inside :where() / :is() / :not() are ignored. */
function stripParenGroups(selector) {
    let out = '';
    let depth = 0;
    for (let i = 0; i < selector.length; i++) {
        const ch = selector[i];
        if (ch === '\\') {
            if (!depth) out += selector.slice(i, i + 2);
            i++;
        } else if (ch === '(') depth++;
        else if (ch === ')') depth = Math.max(0, depth - 1);
        else if (!depth) out += ch;
    }
    return out;
}

/** First top-level class of a selector, unescaped (".w-1\/2" -> "w-1/2", ".desktop\:mt-4" -> "desktop:mt-4"). */
function subjectUtilityClass(selector) {
    const match = stripParenGroups(selector).match(/\.((?:\\.|[^\s.:,>+~[\]#\\])+)/);
    return match ? match[1].replace(/\\(.)/g, '$1') : null;
}

/** Selectors of every rule, at any nesting depth, inside an "@layer utilities" block. */
function utilityLayerSelectors(css) {
    const selectors = [];
    const stack = [];
    let buf = '';
    for (let i = 0; i < css.length; i++) {
        const ch = css[i];
        if (ch === '\\') {
            buf += css.slice(i, i + 2);
            i++;
        } else if (ch === '{') {
            const head = buf.trim();
            const inUtilities = stack.some((h) => /^@layer\s+utilities$/.test(h));
            if (inUtilities && head && !head.startsWith('@')) {
                for (const part of head.split(/,(?![^(]*\))/)) selectors.push(part.trim());
            }
            stack.push(head);
            buf = '';
        } else if (ch === '}') {
            stack.pop();
            buf = '';
        } else if (ch === ';') buf = '';
        else buf += ch;
    }
    return selectors;
}

/** Class names of the rules in "@layer utilities" of the built stylesheet. */
function readUtilityClassNames(root) {
    const file = path.join(root, TAILWIND_OUTPUT);
    if (utilityNameCache.has(file)) return utilityNameCache.get(file);
    const names = new Set();
    if (fs.existsSync(file)) {
        for (const selector of utilityLayerSelectors(stripCssComments(fs.readFileSync(file, 'utf8')))) {
            const name = subjectUtilityClass(selector);
            if (name) names.add(name);
        }
    }
    utilityNameCache.set(file, names);
    return names;
}

function extractStylesheetBlocks(text) {
    const blocks = [];
    const pattern = /{%-?\s*stylesheet\s*-?%}([\s\S]*?){%-?\s*endstylesheet\s*-?%}/g;
    for (const match of text.matchAll(pattern)) {
        blocks.push(match[1]);
    }
    return blocks;
}

function styledClassesFromStylesheet(css) {
    const classes = new Set();
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of stripped.matchAll(/\.([a-zA-Z_][\w-]*)/g)) {
        classes.add(match[1]);
    }
    return classes;
}

const TYPE_STEP_VAR_RE = /var\(\s*--type-step-[\w-]+\s*\)/gi;
const MULTIPLIER_VAR_RE = /var\(\s*--[\w-]+-(?:scale|ratio)\s*\)/gi;
const RELATIVE_NUMBER_RE = /(?:\d*\.)?\d+(?:em|%)/gi;

/**
 * Allowed: inherit / initial / unset; var(--type-step-*); an em or % value; or a calc() / clamp() / min() / max()
 * built only from numbers, em / %, var(--type-step-*) and unitless var(--*-scale) / var(--*-ratio) multipliers,
 * with at least one em, % or type step so the result is a length. Anything else counts.
 */
function isAllowedStylesheetFontSize(value) {
    const v = value.trim().replace(/\s*!important$/i, '');
    if (/^(inherit|initial|unset)$/i.test(v)) return true;
    if (/^var\(\s*--type-step-[\w-]+\s*\)$/i.test(v)) return true;
    if (/^(?:\d*\.)?\d+(?:em|%)$/i.test(v)) return true;
    if (!/^(?:calc|clamp|min|max)\(/i.test(v)) return false;
    const hasLength = /var\(\s*--type-step-/i.test(v) || /\d(?:em|%)/i.test(v);
    const rest = v
        .replace(TYPE_STEP_VAR_RE, ' ')
        .replace(MULTIPLIER_VAR_RE, ' ')
        .replace(RELATIVE_NUMBER_RE, ' ')
        .replace(/\b(?:calc|clamp|min|max)\(/gi, '(')
        .replace(/(?:\d*\.)?\d+/g, ' ');
    return hasLength && /^[\s()+\-*/,]*$/.test(rest);
}

function countFontSizeViolations(css) {
    let count = 0;
    const stripped = stripCssComments(css);
    for (const match of stripped.matchAll(/(?<![\w-])font-size\s*:\s*([^;{}]+)/gi)) {
        const value = match[1].trim();
        if (!isAllowedStylesheetFontSize(value)) count++;
    }
    return count;
}

function countLayerViolations(css) {
    return [...stripCssComments(css).matchAll(/@layer(?![\w-])/gi)].length;
}

function isUtilityToken(token, utilityNames) {
    const { variants, utility } = splitVariants(token);
    if (utilityNames.has(utility)) return true;
    const withVariants = variants.length ? `${variants.join(':')}:${utility}` : utility;
    if (utilityNames.has(withVariants)) return true;
    for (const v of variants) {
        if (utilityNames.has(`${v}:${utility}`)) return true;
    }
    return false;
}

/**
 * Project vocabulary: `@utility <name>` in `tailwind/*.css`, read from source the way `readTypeTiers`
 * reads the typography source. A token is vocabulary when its utility part (after `splitVariants`) is one of these names.
 */
function readProjectVocabulary(root) {
    const names = new Set();
    const dir = path.join(root, 'tailwind');
    if (!fs.existsSync(dir)) return names;
    for (const fileName of fs.readdirSync(dir).sort()) {
        if (!fileName.endsWith('.css')) continue;
        const css = fs.readFileSync(path.join(dir, fileName), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
        for (const match of css.matchAll(/@utility\s+([a-zA-Z0-9_-]+\*?)/g)) names.add(match[1]);
    }
    return names;
}

function isProjectVocabulary(token, vocabulary) {
    return vocabulary.has(splitVariants(token).utility);
}

const OUTPUT_MARK = '\u0000';

const COMPARISON_BEFORE_RE = /(==|!=|<>|<=|>=|<|>|\bcontains)\s*$/i;
const COMPARISON_AFTER_RE = /^\s*(==|!=|<>|<=|>=|<|>|contains\b)/i;

/**
 * String literals of a Liquid tag that can be class names. A literal is a comparison operand, and is dropped, when
 * the text right before or after it (spaces optional) is a comparison operator (`==`, `!=`, `<>`, `<`, `>`, `<=`,
 * `>=`, `contains`); every value of a `when` tag (`when 'a', 'b' or 'c'`) is one too. Each literal is judged against
 * the original tag, so both operands of `'a'=='b'` are dropped.
 */
function classLiteralsOfLiquidTag(tag) {
    if (/^{%-?\s*when\b/i.test(tag)) return [];
    const literals = [];
    for (const m of tag.matchAll(/"([^"]*)"|'([^']*)'/g)) {
        const before = tag.slice(0, m.index);
        const after = tag.slice(m.index + m[0].length);
        if (COMPARISON_BEFORE_RE.test(before) || COMPARISON_AFTER_RE.test(after)) continue;
        literals.push(m[1] ?? m[2]);
    }
    return literals;
}

/**
 * Static class tokens of a class list. {{ … }} output is unresolvable: it is replaced by a mark, and any token that
 * touches it (for example "color-{{ scheme }}") is dropped, while the static tokens around it still count.
 * {% … %} tags are removed but their string literals count, except comparison operands.
 */
function staticClassTokens(raw) {
    const text = raw
        .replace(/{{[\s\S]*?}}/g, OUTPUT_MARK)
        .replace(/{%[\s\S]*?%}/g, (tag) => ` ${classLiteralsOfLiquidTag(tag).join(' ')} `);
    return text.split(/\s+/).filter((t) => t && !t.includes(OUTPUT_MARK));
}

const ACCESSIBILITY_UTILITY_NAMES = new Set(['sr-only', 'not-sr-only']);

function countsAsMixedUtilityToken(token, utilityNames, vocabulary) {
    const { utility } = splitVariants(token);
    if (ACCESSIBILITY_UTILITY_NAMES.has(utility)) return false;
    if (isProjectVocabulary(token, vocabulary)) return false;
    return isUtilityToken(token, utilityNames);
}

/**
 * Static tokens of a class list plus, recursively, those of every class capture it outputs
 * (a capture may output another capture). `seen` holds the captures on the current path, so a cycle stops.
 */
function expandClassList(raw, captures, seen) {
    const tokens = staticClassTokens(raw);
    for (const out of raw.matchAll(/{{-?\s*([\w-]+)\s*-?}}/g)) {
        const name = out[1];
        if (!captures.has(name) || seen.has(name)) continue;
        seen.add(name);
        tokens.push(...expandClassList(captures.get(name), captures, seen));
        seen.delete(name);
    }
    return tokens;
}

/**
 * One entry per class attribute (one element). The body of a {% capture *class* %} counts as part of every
 * class attribute that outputs it, so a mixed capture rendered on two elements counts twice.
 */
function elementClassLists(text) {
    const masked = maskNonMarkup(text);
    const captures = new Map();
    const CLASS_CAPTURE_RE = /{%-?\s*capture\s+([\w-]*class[\w-]*)\s*-?%}([\s\S]*?){%-?\s*endcapture\s*-?%}/gi;
    for (const match of masked.matchAll(CLASS_CAPTURE_RE)) captures.set(match[1], match[2]);

    // "(?<![\w-])" keeps data-class= and similar attributes out.
    const CLASS_ATTR_RE = /(?<![\w-])class\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    const elements = [];
    for (const match of masked.matchAll(CLASS_ATTR_RE)) {
        const tokens = expandClassList(match[1] ?? match[2] ?? '', captures, new Set());
        if (tokens.length) elements.push(tokens);
    }
    return elements;
}

function countMixedElements(text, styledClasses, utilityNames, vocabulary) {
    if (!styledClasses.size) return 0;
    let count = 0;
    for (const tokens of elementClassLists(text)) {
        const own = tokens.some((t) => styledClasses.has(splitVariants(t).utility));
        if (own && tokens.some((t) => countsAsMixedUtilityToken(t, utilityNames, vocabulary))) count += 1;
    }
    return count;
}

function collectStylesheetOwnershipCounts(root) {
    const utilityNames = readUtilityClassNames(root);
    const vocabulary = readProjectVocabulary(root);
    const counts = { [RULE.STYLESHEET_LAYER]: {}, [RULE.STYLESHEET_FONT_SIZE]: {}, [RULE.MIXED_ELEMENT]: {} };

    for (const file of listMarkupFiles(root)) {
        const text = fs.readFileSync(path.join(root, file), 'utf8');
        const blocks = extractStylesheetBlocks(text);
        if (!blocks.length) continue;

        let layerHits = 0;
        let fontHits = 0;
        const styledClasses = new Set();
        for (const block of blocks) {
            layerHits += countLayerViolations(block);
            fontHits += countFontSizeViolations(block);
            for (const c of styledClassesFromStylesheet(block)) styledClasses.add(c);
        }
        if (layerHits) counts[RULE.STYLESHEET_LAYER][file] = { count: layerHits, lines: [1] };
        if (fontHits) counts[RULE.STYLESHEET_FONT_SIZE][file] = { count: fontHits, lines: [1] };

        const mixed = countMixedElements(text, styledClasses, utilityNames, vocabulary);
        if (mixed) counts[RULE.MIXED_ELEMENT][file] = { count: mixed, lines: [1] };
    }
    return counts;
}

function toBaseline(counts) {
    const baseline = {};
    for (const rule of Object.values(RULE).sort()) {
        if (rule === RULE.STYLESHEET_LAYER || rule === RULE.MIXED_ELEMENT) continue;
        baseline[rule] = {};
        for (const file of Object.keys(counts[rule]).sort()) {
            baseline[rule][file] = counts[rule][file].count;
        }
    }
    return baseline;
}

function baselinePath(root) {
    return path.join(root, BASELINE_RELATIVE_PATH);
}

function readBaseline(root) {
    const file = baselinePath(root);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeBaselineFile(root, baseline) {
    fs.mkdirSync(path.dirname(baselinePath(root)), { recursive: true });
    fs.writeFileSync(baselinePath(root), `${JSON.stringify(baseline, null, 4)}\n`, 'utf8');
}

function compareWithBaseline(counts, baseline) {
    const failures = [];
    const drops = [];
    for (const rule of [RULE.STYLESHEET_FONT_SIZE, RULE.MIXED_ELEMENT]) {
        // mixed-element is strict (6-R4): no baseline allowance is read, whatever the file holds.
        const known = rule === RULE.MIXED_ELEMENT ? {} : (baseline[rule] ?? {});
        for (const [file, { count, lines }] of Object.entries(counts[rule])) {
            const allowed = known[file] ?? 0;
            if (count > allowed) {
                failures.push({
                    file,
                    line: lines[0],
                    message: `[${rule}] ${count} use(s), baseline ${allowed}; follow css-architecture.md rule B / font-size policy.`,
                });
            }
        }
        for (const [file, allowed] of Object.entries(known)) {
            const count = counts[rule][file]?.count ?? 0;
            if (count < allowed) drops.push({ rule, file, from: allowed, to: count });
        }
    }
    return { failures, drops };
}

function collectStylesheetOwnershipFailures(root, failures, notes = []) {
    utilityNameCache.clear();
    const counts = collectStylesheetOwnershipCounts(root);

    for (const [file, { count }] of Object.entries(counts[RULE.STYLESHEET_LAYER])) {
        failures.push({
            file,
            line: 1,
            message: `[${RULE.STYLESHEET_LAYER}] ${count} @layer wrapper(s) in {% stylesheet %}; owner styles must be unlayered.`,
        });
    }

    const baseline = readBaseline(root);
    const isTheme = fs.existsSync(path.join(root, 'tailwind/tailwind.typography.css'));
    if (!baseline) {
        if (isTheme) {
            failures.push({
                file: BASELINE_RELATIVE_PATH,
                line: 1,
                message:
                    'Stylesheet ownership baseline is missing. Create it with --write-stylesheet-ownership-baseline.',
            });
        }
        return;
    }

    const result = compareWithBaseline(counts, baseline);
    failures.push(...result.failures);
    if (result.drops.length) {
        notes.push(
            `Stylesheet ownership counts fell in ${result.drops.length} place(s); run lint-theme.js --shrink-stylesheet-ownership-baseline to lock them in.`,
        );
    }
}

function shrinkBaseline(baseline, counts) {
    const next = {};
    for (const rule of Object.keys(baseline).sort()) {
        next[rule] = {};
        for (const file of Object.keys(baseline[rule]).sort()) {
            const count = Math.min(baseline[rule][file], counts[rule]?.[file]?.count ?? 0);
            if (count > 0) next[rule][file] = count;
        }
    }
    return next;
}

module.exports = {
    BASELINE_RELATIVE_PATH,
    RULE,
    baselinePath,
    collectStylesheetOwnershipCounts,
    collectStylesheetOwnershipFailures,
    isAllowedStylesheetFontSize,
    readProjectVocabulary,
    readUtilityClassNames,
    readBaseline,
    shrinkBaseline,
    toBaseline,
    writeBaselineFile,
};
