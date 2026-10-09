/**
 * Raw colours (6-C4): colour flows scheme role → step → role token (tailwind/tailwind.input.css).
 * Markup and CSS use the role tokens only: no opacity modifiers, black/white literals, colour mixes,
 * literal colours, direct step variables, or shadows outside the three elevation roles.
 * See docs/references/style-system/css-architecture.md (Colour layers).
 */

const { pushFailure } = require('./lint-allow');
const { classCandidateTokens, maskNonMarkup, splitVariants } = require('./migration-lint');

const CHECK_ID = 'raw-colour';

/** Token files define the roles; the gift card page keeps its own fixed palette (recorded for 6-C9). */
const EXEMPT_FILES = new Set(['tailwind/tailwind.input.css', 'assets/gift-card.css']);

const COLOUR_PREFIX =
    '(?:text|bg|border(?:-[xytrblse])?|divide|ring|ring-offset|outline|from|via|to|fill|stroke|decoration|placeholder|caret|accent|shadow|inset-shadow|drop-shadow)';
// The class tokenizer stops at parentheses, so `text-x/(--a)` arrives as `text-x/`: a bare trailing slash counts.
const OPACITY_MODIFIER_UTILITY = new RegExp(
    `^${COLOUR_PREFIX}-[a-z][a-z0-9-]*\/(?:\d+(?:\.\d+)?|\[[^\]]+\]|\([^)]+\))?$`,
);
const BLACK_WHITE_UTILITY = new RegExp(`^${COLOUR_PREFIX}-(?:black|white)$`);
const SHADOW_UTILITY = /^(?:inset-|drop-)?shadow(?:-.+)?$/;
const ALLOWED_SHADOW_UTILITIES = new Set(['shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-none']);

const HINT = 'Use a colour role or shadow-sm / -md / -lg (css-architecture.md, Colour layers).';

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

/** Returns a short reason when a utility token bypasses the colour roles, else null. */
function rawColourUtilityReason(token) {
    const { utility } = splitVariants(token);
    if (OPACITY_MODIFIER_UTILITY.test(utility)) return `opacity modifier ${utility}`;
    if (BLACK_WHITE_UTILITY.test(utility)) return `black/white utility ${utility}`;
    if (SHADOW_UTILITY.test(utility) && !ALLOWED_SHADOW_UTILITIES.has(utility)) return `shadow utility ${utility}`;
    return null;
}

const STYLE_ATTRIBUTE_RE = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

function collectMarkupRawColourFailures(text, file, failures, allowsByLine) {
    if (EXEMPT_FILES.has(file)) return;
    for (const { value, line } of classCandidateTokens(text)) {
        const reason = rawColourUtilityReason(value);
        if (!reason) continue;
        pushFailure(failures, allowsByLine, file, line, CHECK_ID, `Raw colour: ${reason}. ${HINT}`);
    }
    // Inline style attributes are CSS too.
    const masked = maskNonMarkup(text);
    for (const match of masked.matchAll(STYLE_ATTRIBUTE_RE)) {
        const css = match[1] ?? match[2] ?? '';
        const offset = match.index + match[0].indexOf(css);
        collectCssRawColourFailures(css, file, failures, allowsByLine, { baseOffset: offset, lineText: text });
    }
}

const VALUE_PATTERNS = [
    // Any alpha that is not a var(): numbers, calc(), percentages. Setting-driven alphas are var(--…).
    {
        re: /rgba?\(\s*var\(\s*--color-[a-z0-9-]+\s*\)\s*,\s*(?!\s|var\()/i,
        reason: 'scheme colour with a non-variable alpha',
    },
    { re: /color-mix\(/i, reason: 'color-mix()' },
    { re: /#[0-9a-f]{3,8}\b/i, reason: 'hex colour' },
    { re: /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(\s*[\d.]/i, reason: 'literal colour function' },
    { re: /\bcolor\(\s*[a-z-]+\s/i, reason: 'color() function' },
    { re: /var\(\s*--alpha-(?:5|10|20|35|50|72|80|shadow-(?:sm|md|lg))\s*[,)]/, reason: 'direct colour step' },
    {
        re: /var\(\s*--color-(?:theme-[a-z]+|field(?:-[a-z]+)?|primary|secondary|badge(?:-[a-z]+)?|success|warning|error(?:-text)?|info)\s*[,)]/,
        reason: 'Tailwind bridge token in CSS (resolves at :root; use rgb(var(--color-<scheme triplet>)) or a role)',
    },
];

// CSS named colours (CSS Color 4), checked only in colour-bearing properties so words in other values pass.
const NAMED_COLOURS = new Set(
    (
        'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
        'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
        'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid ' +
        'darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet ' +
        'deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
        'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki ' +
        'lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow ' +
        'lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
        'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine ' +
        'mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen ' +
        'mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace ' +
        'olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred ' +
        'papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
        'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey ' +
        'snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow ' +
        'yellowgreen'
    ).split(' '),
);
const COLOUR_PROPERTY_RE =
    /(?:^|-)(?:color|colour|background|border|outline|fill|stroke|shadow|decoration|caret|accent|rule|scrollbar)(?:-|$)/i;
const WORD_RE = /(?:^|[\s,(])([a-z]+)(?=$|[\s,)])/gi;

const SHADOW_PROPERTIES = new Set(['box-shadow', 'text-shadow', '-webkit-box-shadow']);

/** Reason a declaration value bypasses the roles, else null. url(...) and quoted strings are not colours. */
function rawColourValueReason(property, value) {
    const checked = value.replace(/url\([^)]*\)/gi, 'url()').replace(/"[^"]*"|'[^']*'/g, '""');
    const found = VALUE_PATTERNS.find(({ re }) => re.test(checked));
    if (found) return found.reason;
    const prop = property.toLowerCase();
    if (SHADOW_PROPERTIES.has(prop) && /currentcolor/i.test(checked)) return 'currentColor shadow';
    if (prop.startsWith('--') && NAMED_COLOURS.has(checked.trim().toLowerCase())) return `named colour ${checked.trim()}`;
    if (COLOUR_PROPERTY_RE.test(prop)) {
        for (const match of checked.matchAll(WORD_RE)) {
            const word = match[1].toLowerCase();
            if (NAMED_COLOURS.has(word)) return `named colour ${word}`;
        }
    }
    return null;
}

function maskComments(cssText) {
    return cssText.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n\r]/g, ' '));
}

function collectCssRawColourFailures(cssText, file, failures, allowsByLine, options = {}) {
    if (EXEMPT_FILES.has(file)) return;
    const { baseOffset = 0, lineText = cssText } = options;
    const stripped = maskComments(cssText);

    // Declarations, including custom properties; values stop at `;`, `{` or `}`.
    for (const match of stripped.matchAll(/(^|[;{\s])(-{0,2}[a-z][a-z0-9-]*)\s*:\s*([^;{}]+)/gi)) {
        const property = match[2];
        const value = match[3];
        if (property.startsWith('@')) continue;
        const reason = rawColourValueReason(property, value);
        if (!reason) continue;
        const offset = match.index + match[0].indexOf(value);
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + offset),
            CHECK_ID,
            `Raw colour: ${reason} in ${property}. ${HINT}`,
        );
    }

    for (const match of stripped.matchAll(/@apply\s+([^;]+);/g)) {
        const reasons = match[1]
            .split(/\s+/)
            .map(rawColourUtilityReason)
            .filter(Boolean);
        if (!reasons.length) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + match.index),
            CHECK_ID,
            `Raw colour: ${reasons.join(', ')} in @apply. ${HINT}`,
        );
    }
}

/**
 * colour-role-sync: a custom property resolves where it is declared, so the scheme-dependent roles in
 * tailwind.input.css are re-declared per scheme in css-variables.liquid: once each, unconditionally, with the same value.
 */
const SYNC_CHECK_ID = 'colour-role-sync';
const ROLE_SOURCE = 'tailwind/tailwind.input.css';
const ROLE_RUNTIME = 'snippets/css-variables.liquid';
const ROLE_DECLARATION_RE = /^[ \t]*(--(?:color|shadow)-[a-z0-9-]+)\s*:\s*([^;]+);/gm;
// Layer 2 roles sit on a step; layer 0 bridge tokens are utility-only (raw-colour rejects var() on them in CSS).
const SCHEME_DEPENDENT_RE = /var\(--(?:color-(?:foreground|border|background)|alpha-shadow-[a-z]+)\)/;
const ROLE_STEP_RE = /var\(--alpha-/;

function roleDeclarations(text, onlySchemeDependent) {
    const roles = new Map();
    for (const match of text.matchAll(ROLE_DECLARATION_RE)) {
        const value = match[2].replace(/\s+/g, ' ').trim();
        // Layer 0 triplets from settings are not roles.
        if (value.includes('{{')) continue;
        if (onlySchemeDependent && !(SCHEME_DEPENDENT_RE.test(value) && ROLE_STEP_RE.test(value))) continue;
        const offset = match.index + match[0].indexOf(match[1]);
        roles.set(match[1], { value, line: lineAt(text, offset), offset, count: (roles.get(match[1])?.count ?? 0) + 1 });
    }
    return roles;
}

function collectColourRoleSyncFailures(root, failures) {
    const fs = require('node:fs');
    const path = require('node:path');
    const sourcePath = path.join(root, ROLE_SOURCE);
    const runtimePath = path.join(root, ROLE_RUNTIME);
    if (!fs.existsSync(sourcePath) || !fs.existsSync(runtimePath)) return;
    const source = roleDeclarations(fs.readFileSync(sourcePath, 'utf8'), true);
    const runtimeText = fs.readFileSync(runtimePath, 'utf8');
    const loop = runtimeText.match(/{%-?\s*for scheme in settings\.color_schemes\s*-?%}[\s\S]*?{%-?\s*endfor\s*-?%}/);
    const runtime = roleDeclarations(loop ? loop[0] : '', false);
    const loopOffsetLine = loop ? lineAt(runtimeText, loop.index) - 1 : 0;

    // Every scheme must get every role: no declaration inside {% if %} / {% unless %} / {% case %}, no repeats.
    const loopText = loop ? loop[0] : '';
    const conditionDepthAt = (offset) => {
        let depth = 0;
        for (const tag of loopText.slice(0, offset).matchAll(/{%-?\s*(if|unless|case|endif|endunless|endcase)\b/g)) {
            depth += tag[1].startsWith('end') ? -1 : 1;
        }
        return depth;
    };
    for (const [name, { line, offset, count }] of runtime) {
        if (conditionDepthAt(offset) > 0) {
            failures.push({
                file: ROLE_RUNTIME,
                line: loopOffsetLine + line,
                checkId: SYNC_CHECK_ID,
                message: `${name} is declared inside a Liquid condition; every scheme must get it unconditionally.`,
            });
        }
        if (count > 1) {
            failures.push({
                file: ROLE_RUNTIME,
                line: loopOffsetLine + line,
                checkId: SYNC_CHECK_ID,
                message: `${name} is declared ${count} times in the scheme loop; declare it once.`,
            });
        }
    }

    for (const [name, { value, line }] of source) {
        const copy = runtime.get(name);
        if (!copy) {
            failures.push({
                file: ROLE_SOURCE,
                line,
                checkId: SYNC_CHECK_ID,
                message: `${name} depends on the scheme but is not re-declared in the ${ROLE_RUNTIME} scheme loop.`,
            });
        } else if (copy.value !== value) {
            failures.push({
                file: ROLE_RUNTIME,
                line: loopOffsetLine + copy.line,
                checkId: SYNC_CHECK_ID,
                message: `${name} differs from ${ROLE_SOURCE}: "${copy.value}" vs "${value}".`,
            });
        }
    }
    for (const [name, { line }] of runtime) {
        if (source.has(name)) continue;
        failures.push({
            file: ROLE_RUNTIME,
            line: loopOffsetLine + line,
            checkId: SYNC_CHECK_ID,
            message: `${name} is re-declared per scheme but is not a scheme-dependent role in ${ROLE_SOURCE}.`,
        });
    }
}

module.exports = {
    CHECK_ID,
    SYNC_CHECK_ID,
    collectColourRoleSyncFailures,
    collectCssRawColourFailures,
    collectMarkupRawColourFailures,
    rawColourUtilityReason,
};
