const path = require('node:path');
const { pushFailure } = require('./lint-allow');

const CHECK = {
    PAGE_TOKEN_SCOPE: 'page-token-scope',
    SCREEN_HEIGHT_LITERAL: 'screen-height-literal',
    FRAME_FULL_ALLOWLIST: 'frame-full-allowlist',
};

const LIQUID_ROOTS = ['layout/', 'sections/', 'snippets/', 'blocks/', 'templates/'];
const PAGE_TOKEN_ROOTS = ['sections/', 'snippets/'];

const PAGE_TOKEN_RE = /var\(\s*--page-(?:width|margin)\b/g;
const PAGE_WIDTH_ONLY_RE = /var\(\s*--page-width\b/g;
const SCREEN_HEIGHT_LITERAL_RE = /\b100(?:s|l|d)?vh\b/g;

// The one named exception: the header menu cap below the announcement bar and header.
const HEADER_MENU_CAP_FILE = 'sections/header.liquid';
const HEADER_MENU_CAP_RE =
    /max-height:\s*calc\(\s*100dvh\s*-\s*var\(\s*--announcement-bar-height\s*\)\s*-\s*var\(\s*--header-height\s*\)\s*\)/g;

const FRAME_FULL_ALLOWLIST = new Set([
    'slides-show',
    'routine-showcase',
    'article',
    'blog',
    'main-page-about',
    'ritual-steps',
    'promo-bannder',
    'google-map',
]);

const FRAME_RENDER_RE = /\brender\s+(['"])section-frame\1/g;
// One `name: value` argument. A quoted value is consumed whole, so text inside it is never read as an argument.
const RENDER_ARG_RE = /([a-z_][\w-]*)\s*:\s*('[^']*'|"[^"]*"|[^,'"]+)/gi;

const PAGE_TOKEN_SCOPE_MESSAGE =
    'Page frame tokens: sections and snippets must not read --page-width or --page-margin; use --page-inset for custom insets.';
const PAGE_WIDTH_COMPONENTS_MESSAGE =
    'Page frame tokens: tailwind/tailwind.components.css must not read --page-width (--page-margin remains allowed).';
const SCREEN_HEIGHT_LITERAL_MESSAGE =
    'One-screen height must use var(--screen-height), not a literal 100svh, 100vh, 100lvh, or 100dvh (only the header menu cap is excepted).';
const FRAME_FULL_ALLOWLIST_MESSAGE =
    "section-frame width: 'full' is allowlisted only for the sections documented in css-architecture.md.";

function lineAt(text, offset) {
    return (text.slice(0, offset).match(/\r\n|\r|\n/g) || []).length + 1;
}

function blank(match) {
    return match.replace(/[^\r\n]/g, ' ');
}

// Liquid comments are removed on the server before any HTML or CSS exists, so they never read a token.
// CSS and HTML comments are not masked: a quoted `/*` or `<!--` would hide live code, so a mention there fails closed.
function maskLiquidComments(text) {
    return text
        .replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, blank)
        .replace(/{%-?\s*#[\s\S]*?-?%}/g, blank)
        .replace(/{%-?\s*liquid\b[\s\S]*?-?%}/g, (tag) => tag.replace(/^[ \t]*#.*$/gm, blank));
}

function inRoots(file, roots) {
    return roots.some((root) => file.startsWith(root));
}

function rangesOf(text, re) {
    return Array.from(text.matchAll(re), (match) => [match.index, match.index + match[0].length]);
}

function scanPageTokenScope(masked, file, failures, allowsByLine) {
    for (const match of masked.matchAll(PAGE_TOKEN_RE)) {
        pushFailure(failures, allowsByLine, file, lineAt(masked, match.index), CHECK.PAGE_TOKEN_SCOPE, PAGE_TOKEN_SCOPE_MESSAGE);
    }
}

function scanScreenHeightLiterals(masked, file, failures, allowsByLine) {
    const excepted = file === HEADER_MENU_CAP_FILE ? rangesOf(masked, HEADER_MENU_CAP_RE) : [];
    for (const match of masked.matchAll(SCREEN_HEIGHT_LITERAL_RE)) {
        if (excepted.some(([start, end]) => match.index >= start && match.index < end)) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(masked, match.index),
            CHECK.SCREEN_HEIGHT_LITERAL,
            SCREEN_HEIGHT_LITERAL_MESSAGE,
        );
    }
}

// Arguments of one `render 'section-frame'`: up to `%}` in tag form, up to the line end inside `{% liquid %}`.
function frameRenderArgs(masked, match) {
    const start = match.index + match[0].length;
    const tagForm = /{%-?$/.test(masked.slice(0, match.index).trimEnd());
    const end = tagForm ? masked.indexOf('%}', start) : masked.slice(start).search(/\r|\n/) + start;
    return { start, args: masked.slice(start, end < start ? masked.length : end) };
}

function scanFrameFullAllowlist(masked, file, failures, allowsByLine) {
    const isSection = file.startsWith('sections/');
    if (isSection && FRAME_FULL_ALLOWLIST.has(path.basename(file, '.liquid'))) return;

    for (const match of masked.matchAll(FRAME_RENDER_RE)) {
        const { start, args } = frameRenderArgs(masked, match);
        const full = Array.from(args.matchAll(RENDER_ARG_RE)).find(
            ([, name, value]) => name === 'width' && /^(['"])full\1$/.test(value),
        );
        if (!full) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(masked, start + full.index),
            CHECK.FRAME_FULL_ALLOWLIST,
            FRAME_FULL_ALLOWLIST_MESSAGE,
        );
    }
}

function collectPageFrameLiquidFailures(text, file, failures, allowsByLine) {
    if (!inRoots(file, LIQUID_ROOTS)) return;
    const masked = maskLiquidComments(text);
    if (inRoots(file, PAGE_TOKEN_ROOTS)) scanPageTokenScope(masked, file, failures, allowsByLine);
    scanScreenHeightLiterals(masked, file, failures, allowsByLine);
    scanFrameFullAllowlist(masked, file, failures, allowsByLine);
}

function collectPageFrameCssFailures(text, file, failures, allowsByLine) {
    if (file !== 'tailwind/tailwind.components.css') return;
    for (const match of text.matchAll(PAGE_WIDTH_ONLY_RE)) {
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(text, match.index),
            CHECK.PAGE_TOKEN_SCOPE,
            PAGE_WIDTH_COMPONENTS_MESSAGE,
        );
    }
}

module.exports = {
    CHECK,
    FRAME_FULL_ALLOWLIST,
    collectPageFrameLiquidFailures,
    collectPageFrameCssFailures,
};
