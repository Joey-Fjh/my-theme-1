/**
 * Migration lints: count legacy patterns in Liquid markup per file and compare the counts
 * with a baseline that may only fall (ratchet). See docs/references/style-system/css-architecture.md.
 */

const fs = require('node:fs');
const path = require('node:path');

const BASELINE_RELATIVE_PATH = '.agents/skills/check-theme-architecture/scripts/migration-baseline.json';
const TYPOGRAPHY_SOURCE = 'tailwind/tailwind.typography.css';
const MARKUP_DIRS = ['layout', 'sections', 'snippets'];

const RULE = {
    TYPE_TIER: 'legacy-type-tier',
    RAW_SPACING: 'raw-spacing',
    BREAKPOINT: 'legacy-breakpoint',
};

const RULE_HINT = {
    [RULE.TYPE_TIER]: 'use the type scale aliases once 6-C8 lands; until then reuse an existing tier only where the file already does',
    [RULE.RAW_SPACING]: 'use a spacing token alias (for example gap-related) instead of a numeric scale value',
    [RULE.BREAKPOINT]: 'use the tokenized breakpoint variants once 6-C2 lands; do not add new pc:/fw: usage',
};

const BREAKPOINT_VARIANTS = new Set(['pc', 'max-pc', 'fw', 'max-fw']);

const SPACING_UTILITY_RE =
    /^-?(gap|gap-x|gap-y|p|pt|pb|pl|pr|px|py|ps|pe|m|mt|mb|ml|mr|mx|my|ms|me|space-x|space-y)-((?!0$)\d+(?:\.\d+)?|\[[^\]]+\])$/;

/** Blank a block while keeping offsets and line breaks. */
function blank(match) {
    return match.replace(/[^\n\r]/g, ' ');
}

/** Markup only: schema, stylesheet, javascript, comments and doc blocks are not class usage. */
function maskNonMarkup(text) {
    let masked = text;
    for (const tag of ['schema', 'stylesheet', 'javascript', 'comment', 'doc']) {
        const re = new RegExp(`{%-?\\s*${tag}\\s*-?%}[\\s\\S]*?{%-?\\s*end${tag}\\s*-?%}`, 'gi');
        masked = masked.replace(re, blank);
    }
    masked = masked.replace(/{%-?\s*#[\s\S]*?-?%}/g, blank);
    masked = masked.replace(/<!--[\s\S]*?-->/g, blank);
    // `# ...` comment lines inside {% liquid %} tags.
    masked = masked.replace(/{%-?\s*liquid\b[\s\S]*?-?%}/g, (tag) => tag.replace(/^([ \t]*)#.*$/gm, blank));
    return masked;
}

const QUOTED_RE = /"([^"]*)"|'([^']*)'/g;
const LIQUID_REGION_RE = /{{[\s\S]*?}}|{%[\s\S]*?%}/g;
// A tag ends at the first `>` outside quotes: attribute values may contain `>` (titles, Alpine ternaries).
const HTML_TAG_RE = /<[a-zA-Z](?:[^>"']|"[^"]*"|'[^']*')*>/g;
const ATTRIBUTE_VALUE_RE = /=\s*(?:"([^"]*)"|'([^']*)')/g;
const CLASS_CAPTURE_RE = /{%-?\s*capture\s+([\w-]*class[\w-]*)\s*-?%}([\s\S]*?){%-?\s*endcapture\s*-?%}/gi;
const TOKEN_RE = /[^\s"'`{},()]+/g;

function pushQuotedContents(text, baseOffset, regex, regions) {
    for (const match of text.matchAll(regex)) {
        const group = match[1] !== undefined ? 1 : 2;
        const content = match[group];
        if (!content) continue;
        regions.push({ content, offset: baseOffset + match.index + match[0].indexOf(content) });
    }
}

/**
 * Class candidates: tokens inside string literals of Liquid tags/outputs and inside quoted HTML
 * attribute values. Text content, comments and non-markup blocks are not class usage.
 */
function classCandidateTokens(text) {
    const masked = maskNonMarkup(text);
    const regions = [];
    for (const match of masked.matchAll(LIQUID_REGION_RE)) {
        pushQuotedContents(match[0], match.index, QUOTED_RE, regions);
    }
    const htmlOnly = masked.replace(LIQUID_REGION_RE, blank);
    for (const tag of htmlOnly.matchAll(HTML_TAG_RE)) {
        pushQuotedContents(tag[0], tag.index, ATTRIBUTE_VALUE_RE, regions);
    }
    // Class lists built in `{% capture *class* %}` blocks are class usage too.
    for (const match of masked.matchAll(CLASS_CAPTURE_RE)) {
        const bodyStart = match.index + match[0].indexOf(match[2]);
        regions.push({ content: match[2].replace(LIQUID_REGION_RE, blank), offset: bodyStart });
    }
    const tokens = [];
    for (const { content, offset } of regions) {
        for (const match of content.matchAll(TOKEN_RE)) {
            if (match[0].includes('{') || match[0].includes('%')) continue;
            tokens.push({ value: match[0], offset: offset + match.index, line: lineAt(masked, offset + match.index) });
        }
    }
    return tokens;
}

/** Tier utility names defined in the typography source; `*-base` mixins are not tiers. */
function readTypeTiers(root) {
    const file = path.join(root, TYPOGRAPHY_SOURCE);
    if (!fs.existsSync(file)) return null;
    const css = fs.readFileSync(file, 'utf8');
    const tiers = new Set();
    for (const match of css.matchAll(/@utility\s+((?:heading|body)-[a-z0-9-]+)\s*{/g)) {
        if (!match[1].endsWith('-base')) tiers.add(match[1]);
    }
    return tiers;
}

function splitVariants(token) {
    const parts = token.split(':');
    // Tailwind's important modifier: leading `!` (v3 style) or trailing `!` (v4).
    const utility = parts.pop().replace(/^!|!$/g, '');
    return { variants: parts, utility };
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function countMigrationHits(text, typeTiers) {
    const hits = { [RULE.TYPE_TIER]: [], [RULE.RAW_SPACING]: [], [RULE.BREAKPOINT]: [] };

    for (const { value, line } of classCandidateTokens(text)) {
        const { variants, utility } = splitVariants(value);

        if (typeTiers && typeTiers.has(utility)) hits[RULE.TYPE_TIER].push(line);
        if (SPACING_UTILITY_RE.test(utility)) hits[RULE.RAW_SPACING].push(line);
        if (variants.some((v) => BREAKPOINT_VARIANTS.has(v))) hits[RULE.BREAKPOINT].push(line);
    }
    return hits;
}

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

/** { rule: { file: { count, lines } } } for files with at least one hit. */
function collectMigrationCounts(root) {
    const typeTiers = readTypeTiers(root);
    const counts = { [RULE.TYPE_TIER]: {}, [RULE.RAW_SPACING]: {}, [RULE.BREAKPOINT]: {} };
    for (const file of listMarkupFiles(root)) {
        const text = fs.readFileSync(path.join(root, file), 'utf8');
        const hits = countMigrationHits(text, typeTiers);
        for (const rule of Object.values(RULE)) {
            if (hits[rule].length) counts[rule][file] = { count: hits[rule].length, lines: hits[rule] };
        }
    }
    return counts;
}

function toBaseline(counts) {
    const baseline = {};
    for (const rule of Object.values(RULE).sort()) {
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

/** Rises and new files fail; drops only produce a hint. */
function compareWithBaseline(counts, baseline) {
    const failures = [];
    const drops = [];
    for (const rule of Object.values(RULE)) {
        const known = baseline[rule] ?? {};
        for (const [file, { count, lines }] of Object.entries(counts[rule])) {
            const allowed = known[file] ?? 0;
            if (count > allowed) {
                const shown = lines.slice(0, 8).join(', ');
                failures.push({
                    file,
                    line: lines[0],
                    message:
                        `[${rule}] ${count} use(s), baseline ${allowed}; ${RULE_HINT[rule]}. ` +
                        `Lines: ${shown}${lines.length > 8 ? ', …' : ''}.`,
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

/** Lower entries to the current counts and drop zeros; never raises or adds. */
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

/**
 * Lint entry. Applies when the root has the typography source (the real theme); test roots
 * without it are skipped unless they carry a baseline.
 */
function collectMigrationFailures(root, failures, notes = []) {
    const baseline = readBaseline(root);
    const isTheme = fs.existsSync(path.join(root, TYPOGRAPHY_SOURCE));
    if (!baseline) {
        if (isTheme) {
            failures.push({
                file: BASELINE_RELATIVE_PATH,
                line: 1,
                message: 'Migration baseline is missing. It may only be created once, with --write-migration-baseline.',
            });
        }
        return;
    }
    const counts = collectMigrationCounts(root);
    const result = compareWithBaseline(counts, baseline);
    failures.push(...result.failures);
    if (result.drops.length) {
        notes.push(
            `Migration counts fell in ${result.drops.length} place(s); run lint-theme.js --shrink-migration-baseline to lock them in.`,
        );
    }
}

module.exports = {
    BASELINE_RELATIVE_PATH,
    RULE,
    classCandidateTokens,
    splitVariants,
    baselinePath,
    collectMigrationCounts,
    collectMigrationFailures,
    compareWithBaseline,
    countMigrationHits,
    maskNonMarkup,
    readBaseline,
    readTypeTiers,
    shrinkBaseline,
    toBaseline,
    writeBaselineFile,
};
