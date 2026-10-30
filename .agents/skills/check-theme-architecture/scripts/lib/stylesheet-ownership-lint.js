/**
 * Stylesheet ownership lints (6-C6, H7): no @layer in {% stylesheet %}, font-size ratchet,
 * spacing ratchet, mixed-element ratchet.
 */

const fs = require('node:fs');
const path = require('node:path');
const { tokenize, TokenType } = require('@csstools/css-tokenizer');
const { splitVariants, maskNonMarkup } = require('./migration-lint');

const BASELINE_RELATIVE_PATH =
    '.agents/skills/check-theme-architecture/scripts/stylesheet-ownership-baseline.json';
const TAILWIND_OUTPUT = 'assets/tailwind.output.css';

const RULE = {
    STYLESHEET_LAYER: 'stylesheet-layer',
    STYLESHEET_FONT_SIZE: 'stylesheet-font-size',
    STYLESHEET_SPACING: 'stylesheet-spacing',
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

const SPACING_LONGHANDS = ['top', 'right', 'bottom', 'left', 'block-start', 'block-end', 'inline-start', 'inline-end', 'block', 'inline'];
const SPACING_PROPERTIES = new Set([
    'padding',
    'margin',
    'gap',
    'row-gap',
    'column-gap',
    ...SPACING_LONGHANDS.flatMap((side) => [`padding-${side}`, `margin-${side}`]),
]);

const BLOCK_CLOSER = {
    [TokenType.OpenCurly]: TokenType.CloseCurly,
    [TokenType.OpenParen]: TokenType.CloseParen,
    [TokenType.OpenSquare]: TokenType.CloseSquare,
    [TokenType.Function]: TokenType.CloseParen,
};

function isWhitespaceOrComment(token) {
    return token[0] === TokenType.Whitespace || token[0] === TokenType.Comment;
}

/** Index just past the component value at `i`: a single token, or a {} / () / [] / function block up to its closer or EOF. */
function skipComponentValue(tokens, i) {
    const closer = BLOCK_CLOSER[tokens[i][0]];
    if (closer === undefined) return i + 1;
    let j = i + 1;
    while (tokens[j][0] !== TokenType.EOF) {
        if (tokens[j][0] === closer) return j + 1;
        j = skipComponentValue(tokens, j);
    }
    return j;
}

/** True when the last two significant tokens are `!` and the ident `important` (any case, escapes decoded). */
function isImportantEnd(tokens) {
    const [bang, ident] = tokens.slice(-2);
    return (
        tokens.length >= 2 &&
        bang[0] === TokenType.Delim &&
        bang[4].value === '!' &&
        ident[0] === TokenType.Ident &&
        ident[4].value.toLowerCase() === 'important'
    );
}

/**
 * Declaration at `i` (CSS Syntax 3 "consume a declaration"): an ident, a colon, then component values up to a
 * top-level `;`, `}` or EOF. Returns the end index, or -1 when the tokens are not a declaration (the caller
 * then reads them as a nested rule). A non-custom value holding a top-level {} block next to anything else
 * (a trailing `!important` aside) is not a declaration; a {} block that is the whole value is one.
 */
function consumeDeclaration(tokens, i, values) {
    if (tokens[i][0] !== TokenType.Ident) return -1;
    let j = i + 1;
    while (isWhitespaceOrComment(tokens[j])) j++;
    if (tokens[j][0] !== TokenType.Colon) return -1;
    const valueStart = j + 1;
    const parts = [];
    j = valueStart;
    while (![TokenType.EOF, TokenType.Semicolon, TokenType.CloseCurly].includes(tokens[j][0])) {
        if (!isWhitespaceOrComment(tokens[j])) parts.push(tokens[j]);
        j = skipComponentValue(tokens, j);
    }
    const name = tokens[i][4].value;
    if (name.startsWith('--')) return j;
    if (isImportantEnd(parts)) parts.splice(-2, 2);
    if (parts.length > 1 && parts.some((token) => token[0] === TokenType.OpenCurly)) return -1;
    const property = name.toLowerCase();
    if (SPACING_PROPERTIES.has(property)) {
        values.push({
            property,
            value: tokens
                .slice(valueStart, j)
                .map((token) => (token[0] === TokenType.Comment ? ' ' : token[1]))
                .join('')
                .trim(),
        });
    }
    return j;
}

/** At-rule at `i`: prelude up to `;` (statement) or a {} block (read as block contents). */
function consumeAtRule(tokens, i, values, nested) {
    let j = i + 1;
    while (tokens[j][0] !== TokenType.EOF) {
        const type = tokens[j][0];
        if (type === TokenType.Semicolon) return j + 1;
        if (type === TokenType.OpenCurly) return consumeBlockContents(tokens, j + 1, values);
        if (type === TokenType.CloseCurly && nested) return j;
        j = skipComponentValue(tokens, j);
    }
    return j;
}

/** True when the prelude from `i` starts with an ident beginning `--` followed by a colon. */
function startsLikeCustomProperty(tokens, i) {
    let j = i;
    while (isWhitespaceOrComment(tokens[j])) j++;
    if (tokens[j][0] !== TokenType.Ident || !tokens[j][4].value.startsWith('--')) return false;
    j++;
    while (isWhitespaceOrComment(tokens[j])) j++;
    return tokens[j][0] === TokenType.Colon;
}

/**
 * Qualified rule at `i`: prelude up to a {} block. Nested, a `;` or `}` ends an invalid rule instead. A
 * top-level prelude that starts like a custom property (`--foo:hover {…}`) is dropped with its block unread.
 */
function consumeQualifiedRule(tokens, i, values, nested) {
    let j = i;
    while (tokens[j][0] !== TokenType.EOF) {
        const type = tokens[j][0];
        if (type === TokenType.OpenCurly) {
            if (!nested && startsLikeCustomProperty(tokens, i)) return skipComponentValue(tokens, j);
            return consumeBlockContents(tokens, j + 1, values);
        }
        if (nested && (type === TokenType.Semicolon || type === TokenType.CloseCurly)) return j;
        j = skipComponentValue(tokens, j);
    }
    return j;
}

/** Contents of a {} block from `i`: declarations, nested rules and at-rules up to the closing `}` or EOF. */
function consumeBlockContents(tokens, i, values) {
    let j = i;
    while (tokens[j][0] !== TokenType.EOF) {
        const type = tokens[j][0];
        if (type === TokenType.CloseCurly) return j + 1;
        if (type === TokenType.Semicolon || isWhitespaceOrComment(tokens[j])) {
            j++;
        } else if (type === TokenType.AtKeyword) {
            j = consumeAtRule(tokens, j, values, true);
        } else {
            const end = consumeDeclaration(tokens, j, values);
            j = end === -1 ? consumeQualifiedRule(tokens, j, values, true) : end;
        }
    }
    return j;
}

/**
 * Values of the spacing declarations in a stylesheet, parsed per CSS Syntax Level 3 with nesting from
 * `@csstools/css-tokenizer` tokens, so the declarations counted are the ones a browser reads. Top-level text,
 * selectors and at-rule preludes, comments, strings, url() tokens, custom-property values and any {} / () / []
 * block inside a value never count; escaped property names are read unescaped.
 */
function spacingDeclarationValues(css) {
    // CSS Syntax 3 input preprocessing: CR LF, CR and FF become LF before tokenizing.
    const tokens = tokenize({ css: css.replace(/\r\n?|\f/g, '\n') });
    const values = [];
    let i = 0;
    while (tokens[i][0] !== TokenType.EOF) {
        const type = tokens[i][0];
        if (isWhitespaceOrComment(tokens[i]) || type === TokenType.CDO || type === TokenType.CDC) {
            i++;
        } else if (type === TokenType.AtKeyword) {
            i = consumeAtRule(tokens, i, values, false);
        } else {
            i = consumeQualifiedRule(tokens, i, values, false);
        }
    }
    return values;
}

/** Component values from `i` up to `closer` (or EOF): plain tokens, and blocks with their children and whether they closed. */
function componentValues(tokens, i, closer) {
    const nodes = [];
    let j = i;
    while (tokens[j][0] !== TokenType.EOF) {
        if (tokens[j][0] === closer) return { nodes, end: j + 1, closed: true };
        const blockCloser = BLOCK_CLOSER[tokens[j][0]];
        if (blockCloser === undefined) {
            nodes.push({ token: tokens[j] });
            j++;
        } else {
            const inner = componentValues(tokens, j + 1, blockCloser);
            nodes.push({ token: tokens[j], children: inner.nodes, closed: inner.closed });
            j = inner.end;
        }
    }
    return { nodes, end: j, closed: closer === undefined };
}

function significant(nodes) {
    return nodes.filter((node) => !isWhitespaceOrComment(node.token));
}

const SPACING_KEYWORDS = new Set(['auto', 'inherit', 'initial', 'unset']);
const MATH_FUNCTIONS = new Set(['calc', 'clamp', 'min', 'max']);
const MATH_OPERATORS = new Set(['+', '-', '*', '/']);
// Custom-property names are case-sensitive, so the prefixes are matched exactly.
// The suffix is any decoded ident text, non-ASCII included.
const SPACING_TOKEN_NAME_RE = /^--(?:spacing|page|section-frame)-./su;

function isZeroNumber(token) {
    return token[0] === TokenType.Number && token[4].value === 0;
}

function isRelativeLength(token) {
    return (
        token[0] === TokenType.Percentage ||
        (token[0] === TokenType.Dimension && token[4].unit.toLowerCase() === 'em')
    );
}

/** var() of a spacing, page or section-frame token, optionally with a 0 fallback. */
function isAllowedSpacingVar(node) {
    const args = significant(node.children);
    if (args[0]?.token[0] !== TokenType.Ident || !SPACING_TOKEN_NAME_RE.test(args[0].token[4].value)) return false;
    if (args.length === 1) return true;
    return args.length === 3 && args[1].token[0] === TokenType.Comma && isZeroNumber(args[2].token);
}

/** Inside calc() / clamp() / min() / max(): numbers, em and % lengths, allowed var()s, operators, commas, nested groups. */
function isAllowedMathContent(nodes) {
    return nodes.every(({ token, children, closed }) => {
        const type = token[0];
        if (isWhitespaceOrComment(token) || type === TokenType.Number || type === TokenType.Comma) return true;
        if (isRelativeLength(token)) return true;
        if (type === TokenType.Delim) return MATH_OPERATORS.has(token[4].value);
        if (!closed) return false;
        if (type === TokenType.OpenParen) return isAllowedMathContent(children);
        if (type !== TokenType.Function) return false;
        const name = token[4].value.toLowerCase();
        if (name === 'var') return isAllowedSpacingVar({ children });
        return MATH_FUNCTIONS.has(name) && isAllowedMathContent(children);
    });
}

/**
 * One top-level component value. Allowed: 0, auto, inherit, initial, unset; var(--spacing-*) / var(--page-*) /
 * var(--section-frame-*), optionally with a 0 fallback; an em or % length; or calc() / clamp() / min() / max()
 * built only from those plus unitless numbers. Read from decoded tokens, so escapes, signs and exponents are
 * judged by their value. A negative token is written calc(-1 * var(--spacing-related)).
 */
function isAllowedSpacingPart({ token, children, closed }) {
    const type = token[0];
    if (type === TokenType.Ident) return SPACING_KEYWORDS.has(token[4].value.toLowerCase());
    if (isZeroNumber(token) || isRelativeLength(token)) return true;
    if (type !== TokenType.Function || !closed) return false;
    const name = token[4].value.toLowerCase();
    if (name === 'var') return isAllowedSpacingVar({ children });
    return MATH_FUNCTIONS.has(name) && isAllowedMathContent(children);
}

/** Most top-level component values a property takes: four for the box shorthands, two for gap and block/inline pairs. */
function maxSpacingParts(property) {
    if (property === undefined || property === 'padding' || property === 'margin') return 4;
    if (property === 'gap' || /^(?:padding|margin)-(?:block|inline)$/.test(property)) return 2;
    return 1;
}

/**
 * A spacing value: after a trailing `!important` is removed, one to `maxSpacingParts(property)` top-level
 * component values, each allowed. Without a property the four-value limit applies.
 */
function isAllowedStylesheetSpacing(value, property) {
    const tokens = tokenize({ css: value.replace(/\r\n?|\f/g, '\n') });
    const parts = significant(componentValues(tokens, 0).nodes);
    if (isImportantEnd(parts.map((node) => node.token))) parts.splice(-2, 2);
    return parts.length > 0 && parts.length <= maxSpacingParts(property) && parts.every(isAllowedSpacingPart);
}

function disallowedStylesheetSpacingValues(css) {
    const values = [];
    // The tokenizer reads comments and strings, so a `/*` inside a string is not taken for a comment.
    for (const { property, value } of spacingDeclarationValues(css)) {
        if (!isAllowedStylesheetSpacing(value, property)) values.push(value.trim());
    }
    return values;
}

function countSpacingViolations(css) {
    return disallowedStylesheetSpacingValues(css).length;
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
    const counts = {
        [RULE.STYLESHEET_LAYER]: {},
        [RULE.STYLESHEET_FONT_SIZE]: {},
        [RULE.STYLESHEET_SPACING]: {},
        [RULE.MIXED_ELEMENT]: {},
    };

    for (const file of listMarkupFiles(root)) {
        const text = fs.readFileSync(path.join(root, file), 'utf8');
        const blocks = extractStylesheetBlocks(text);
        if (!blocks.length) continue;

        let layerHits = 0;
        let fontHits = 0;
        let spacingHits = 0;
        const styledClasses = new Set();
        for (const block of blocks) {
            layerHits += countLayerViolations(block);
            fontHits += countFontSizeViolations(block);
            spacingHits += countSpacingViolations(block);
            for (const c of styledClassesFromStylesheet(block)) styledClasses.add(c);
        }
        if (layerHits) counts[RULE.STYLESHEET_LAYER][file] = { count: layerHits, lines: [1] };
        if (fontHits) counts[RULE.STYLESHEET_FONT_SIZE][file] = { count: fontHits, lines: [1] };
        if (spacingHits) counts[RULE.STYLESHEET_SPACING][file] = { count: spacingHits, lines: [1] };

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

function ownershipFailureSuffix(rule) {
    if (rule === RULE.STYLESHEET_SPACING) return 'follow css-architecture.md stylesheet spacing.';
    return 'follow css-architecture.md rule B / font-size policy.';
}

function compareWithBaseline(counts, baseline) {
    const failures = [];
    const drops = [];
    for (const rule of [RULE.STYLESHEET_FONT_SIZE, RULE.STYLESHEET_SPACING, RULE.MIXED_ELEMENT]) {
        // mixed-element is strict (6-R4): no baseline allowance is read, whatever the file holds.
        const known = rule === RULE.MIXED_ELEMENT ? {} : (baseline[rule] ?? {});
        for (const [file, { count, lines }] of Object.entries(counts[rule])) {
            const allowed = known[file] ?? 0;
            if (count > allowed) {
                failures.push({
                    file,
                    line: lines[0],
                    message: `[${rule}] ${count} use(s), baseline ${allowed}; ${ownershipFailureSuffix(rule)}`,
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
    disallowedStylesheetSpacingValues,
    isAllowedStylesheetFontSize,
    isAllowedStylesheetSpacing,
    readProjectVocabulary,
    readUtilityClassNames,
    readBaseline,
    shrinkBaseline,
    toBaseline,
    writeBaselineFile,
};
