#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');
const { parseLiquidAst, walk } = require('./lib/liquid-ast');

const ROOT = process.cwd();

const LIQUID_GLOBS = ['layout/**/*.liquid', 'sections/**/*.liquid', 'snippets/**/*.liquid'];
const SECTION_GLOBS = ['sections/**/*.liquid'];
const SNIPPET_GLOBS = ['snippets/**/*.liquid'];
const SCHEMA_GLOBS = ['sections/**/*.liquid', 'blocks/**/*.liquid', 'config/settings_schema.json'];
const ASSET_JS_GLOBS = ['assets/**/*.js'];

const DOM_REPLACEMENT_ALLOWLIST = new Set(['assets/https.js']);

const GLOBAL_OBJECTS = new Set([
    'all_products',
    'article',
    'blog',
    'block',
    'cart',
    'collection',
    'collections',
    'customer',
    'localization',
    'page',
    'pages',
    'product',
    'request',
    'routes',
    'section',
    'settings',
    'shop',
    'template',
]);

const GENERIC_CLASS_NAMES = new Set([
    'active',
    'button',
    'card',
    'content',
    'drawer',
    'grid',
    'header',
    'image',
    'item',
    'link',
    'list',
    'media',
    'menu',
    'modal',
    'overlay',
    'title',
]);

const failures = [];

function report(file, line, message) {
    failures.push({ file, line, message });
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

async function readText(file) {
    return fs.readFile(path.join(ROOT, file), 'utf8');
}

async function getFiles(globs) {
    return (await fg(globs, { cwd: ROOT, dot: false, onlyFiles: true })).map(formatPath);
}

function walkJson(node, onProperty) {
    if (!node) return;

    if (node.type === 'object') {
        for (const propertyNode of node.children ?? []) {
            const keyNode = propertyNode.children?.[0];
            const valueNode = propertyNode.children?.[1];
            const key = getNodeValue(keyNode);

            if (typeof key === 'string' && valueNode) {
                onProperty(key, valueNode);
                walkJson(valueNode, onProperty);
            }
        }
    }

    if (node.type === 'array') {
        for (const child of node.children ?? []) {
            walkJson(child, onProperty);
        }
    }
}

function getSchemaBlocks(text) {
    const blocks = [];
    const re = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/g;

    for (const match of text.matchAll(re)) {
        blocks.push({
            json: match[1],
            offset: (match.index ?? 0) + match[0].indexOf(match[1]),
        });
    }

    return blocks;
}

async function checkSchemaIds() {
    for (const file of await getFiles(SCHEMA_GLOBS)) {
        const text = await readText(file);
        const blocks =
            file === 'config/settings_schema.json'
                ? [{ json: text, offset: 0 }]
                : getSchemaBlocks(text);

        for (const block of blocks) {
            const tree = parseTree(block.json);
            if (!tree) continue;

            const idsByScope = new Map();

            walkJson(tree, (key, valueNode) => {
                if (key !== 'id') return;

                const value = getNodeValue(valueNode);
                if (typeof value !== 'string') return;

                const line = lineAt(text, block.offset + valueNode.offset);

                if (!/^[a-z][a-z0-9_]*$/.test(value)) {
                    report(file, line, `Schema id "${value}" should be snake_case.`);
                }

                const seen = idsByScope.get(value);
                if (seen) {
                    report(
                        file,
                        line,
                        `Duplicate schema id "${value}" also appears on line ${seen}.`,
                    );
                } else {
                    idsByScope.set(value, line);
                }
            });
        }
    }
}

const XDATA_COMPLEX_PATTERNS = [
    /Array\.isArray/,
    /\$el\.dataset/,
    /\bfunction\s*\(/,
    /\?\s*[^:]+:/, // ternary
    /\[[^\]]*\]/, // array literal
    /\{[^}]*\{/, // nested object
    /\b\w+\s*\([^)]*\)\s*\{/, // method shorthand
];

const XDATA_MAX_PROPS = 1;
const XDATA_MAX_LENGTH = 120;

function isSimplePrimitiveObject(rawValue) {
    if (rawValue === '{}') return true;
    if (rawValue.length > XDATA_MAX_LENGTH) return false;

    // Match { key: val, key: val, ... } with only primitive values
    const match = rawValue.match(/^\{([\s\S]*)\}$/);
    if (!match) return false;

    const inner = match[1].trim();
    if (!inner) return true;

    // Split by top-level commas (not inside strings)
    const parts = inner.split(',');
    for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) return false;
        // Each part must be: identifier : primitive
        if (
            !/^\w+\s*:\s*(?:true|false|null|undefined|\d+(?:\.\d+)?|'[^']*'|"[^"]*"|`[^`]*`)$/.test(
                trimmed,
            )
        ) {
            return false;
        }
    }
    return true;
}

function isSimpleObjectCall(rawValue) {
    // Match: functionName({ key: val, ... }) with brace counting for nested braces
    const openParen = rawValue.indexOf('(');
    if (openParen < 1) return false;
    if (!/^[a-zA-Z_]\w*$/.test(rawValue.slice(0, openParen))) return false;
    if (!rawValue.endsWith(')')) return false;

    const inner = rawValue.slice(openParen + 1, -1).trim();
    if (!inner.startsWith('{')) return false;

    // Brace counting to find matching close brace
    let depth = 0;
    let closeBrace = -1;
    for (let i = 0; i < inner.length; i++) {
        if (inner[i] === '{') depth++;
        if (inner[i] === '}') {
            depth--;
            if (depth === 0) {
                closeBrace = i;
                break;
            }
        }
    }
    if (closeBrace !== inner.length - 1) return false;

    const objContent = inner.slice(1, closeBrace).trim();
    const propCount = objContent ? objContent.split(',').filter((p) => p.trim()).length : 0;

    return propCount <= XDATA_MAX_PROPS && rawValue.length <= XDATA_MAX_LENGTH;
}

function checkXDataComplexity(file, text, attr, rawValue) {
    // Reject Liquid output {{ ... }}
    const hasLiquidOutput = attr.value?.some((v) => v.type === 'LiquidVariableOutput');
    if (hasLiquidOutput) {
        report(
            file,
            lineAt(text, attr.position.start),
            'Complex x-data should move configuration to data-* attributes or component init().',
        );
        return;
    }

    // Reject Liquid tags {% ... %}
    const hasLiquidTag = attr.value?.some((v) => v.type === 'LiquidTag');
    if (hasLiquidTag) {
        report(
            file,
            lineAt(text, attr.position.start),
            'Complex x-data should move configuration to data-* attributes or component init().',
        );
        return;
    }

    // Allow simple local state: x-data="{}" or x-data="{ key: primitive, ... }"
    if (isSimplePrimitiveObject(rawValue)) return;

    // Allow bare component name (no parens or empty parens)
    if (/^[a-zA-Z_]\w*(?:\(\s*\))?$/.test(rawValue)) return;

    // Allow short, stable call with simple object arg (brace-counted)
    // e.g. dragScroll({ axis: 'x' })
    if (isSimpleObjectCall(rawValue) && !XDATA_COMPLEX_PATTERNS.some((re) => re.test(rawValue))) {
        return;
    }

    // Everything else — check for complexity
    const propCount = (rawValue.match(/,/g) || []).length + 1;
    const isComplex =
        propCount > XDATA_MAX_PROPS ||
        rawValue.length > XDATA_MAX_LENGTH ||
        XDATA_COMPLEX_PATTERNS.some((re) => re.test(rawValue));

    if (isComplex) {
        report(
            file,
            lineAt(text, attr.position.start),
            'Complex x-data should move configuration to data-* attributes or component init().',
        );
    }
}

async function checkLiquidArchitecture() {
    const assignRe = /{%-?\s*(assign|capture)\s+([a-zA-Z_][\w]*)\b/g;
    const domListenerRe = /\b(?:document|window)\.addEventListener\s*\(/g;
    const hardcodedColorUtilityRe = /\b(?:text|bg|border)-\[(?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\]/g;
    const headingTextSizeRe =
        /<h[1-6]\b[^>]*class=["'][^"']*\b(?:pc:|max-pc:)?text-(?:xs|sm|base|lg|xl|[2-9]xl)\b/gi;
    const nonHeadingHeadingClassRe =
        /<(?!h[1-6]\b)([a-z][\w:-]*)\b[^>]*class=["'][^"']*\bheading-h[1-6]\b/gi;
    const oldTypographyTokenRe =
        /\b(?:class|_class)\s*[:=]\s*["'][^"']*(?<![-])(?:hxxxl|hxxl|hxl|h0|h[1-6])\b(?![a-zA-Z0-9-])[^"']*["']/gi;
    const genericCssSelectorRe = /^\s*\.([a-z][\w-]*)\s*[{,.#:[>+~]/gm;

    for (const file of await getFiles(LIQUID_GLOBS)) {
        const text = await readText(file);

        for (const match of text.matchAll(assignRe)) {
            const name = match[2];
            if (GLOBAL_OBJECTS.has(name)) {
                report(
                    file,
                    lineAt(text, match.index ?? 0),
                    `Do not ${match[1]} over global object "${name}".`,
                );
            }
        }

        // --- AST-based checks ---
        const { ast, error: parseError } = parseLiquidAst(text);

        if (parseError) {
            report(file, 1, `Liquid parse error: ${parseError.message}`);
        } else {
            walk(ast, (node) => {
                // Inline <script> check
                if (node.type === 'HtmlRawNode' && node.name === 'script') {
                    const attrs = node.attributes || [];
                    const hasSrc = attrs.some((a) => a.name?.some((n) => n.value === 'src'));
                    const typeAttr = attrs.find((a) => a.name?.some((n) => n.value === 'type'));
                    const typeVal = typeAttr?.value
                        ?.map((v) => v.value || '')
                        .join('')
                        .trim();
                    const isJsonType =
                        typeVal === 'application/ld+json' || typeVal === 'application/json';

                    if (!hasSrc && !isJsonType) {
                        report(
                            file,
                            lineAt(text, node.position.start),
                            'Use {% javascript %} with Components.register(), not inline <script>.',
                        );
                    }
                }

                // <style> check
                if (node.type === 'HtmlRawNode' && node.name === 'style') {
                    report(
                        file,
                        lineAt(text, node.position.start),
                        'Do not use <style> tags in Liquid templates.',
                    );
                }

                // x-data complexity check
                if (node.attributes) {
                    for (const attr of node.attributes) {
                        if (!Array.isArray(attr.name)) continue;
                        const attrName = attr.name?.map((n) => n.value || '').join('');
                        if (attrName !== 'x-data') continue;

                        const rawValue = attr.value
                            ?.map((v) => v.value || '')
                            .join('')
                            .trim();
                        if (!rawValue) continue;

                        checkXDataComplexity(file, text, attr, rawValue);
                    }
                }
            });
        }

        for (const match of text.matchAll(domListenerRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'Global listeners should be scoped through Components.register() cleanup.',
            );
        }

        for (const match of text.matchAll(hardcodedColorUtilityRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                `Use theme tokens instead of "${match[0]}".`,
            );
        }

        for (const match of text.matchAll(headingTextSizeRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'Heading elements must use heading tiers, not Tailwind text sizes.',
            );
        }

        for (const match of text.matchAll(nonHeadingHeadingClassRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                `Do not apply semantic heading tier heading-h* to <${match[1]}>; use a heading element or a display tier (heading-4xl–heading-xl).`,
            );
        }

        for (const match of text.matchAll(oldTypographyTokenRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                `Old typography token "${match[0].match(/\b(?:hxxxl|hxxl|hxl|h0|h[1-6])\b/)?.[0] ?? match[0]}" removed from generated CSS; use heading-* or body-* tiers.`,
            );
        }

        for (const match of text.matchAll(genericCssSelectorRe)) {
            const className = match[1];
            if (GENERIC_CLASS_NAMES.has(className)) {
                report(
                    file,
                    lineAt(text, match.index ?? 0),
                    `CSS class ".${className}" is too generic; use a component prefix.`,
                );
            }
        }
    }
}

// --- DOM replacement guard ---

const DOM_REPLACEMENT_PATTERNS = [
    {
        re: /\.innerHTML\s*=/g,
        message: 'Shopify section HTML replacement must use ShopifySectionRefresher.render().',
    },
    {
        re: /\.outerHTML\s*=/g,
        message: 'Shopify section HTML replacement must use ShopifySectionRefresher.render().',
    },
    {
        re: /\.replaceWith\s*\(/g,
        message: 'Shopify section HTML replacement must use ShopifySectionRefresher.render().',
    },
];

const LIQUID_SCRIPT_RE = /{%-?\s*javascript\s*-?%}([\s\S]*?){%-?\s*endjavascript\s*-?%}/g;

function stripCommentsMapped(source) {
    const commentRe = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
    const deletedRanges = [];
    for (const m of source.matchAll(commentRe)) {
        deletedRanges.push([m.index, m.index + m[0].length]);
    }

    const cleaned = source.replace(commentRe, '');

    if (deletedRanges.length === 0) return { cleaned, toOriginal: (i) => i };

    const map = new Int32Array(source.length);
    let ci = 0;
    let gapIdx = 0;
    for (let oi = 0; oi < source.length; oi++) {
        if (gapIdx < deletedRanges.length && oi === deletedRanges[gapIdx][0]) {
            oi = deletedRanges[gapIdx][1] - 1;
            gapIdx++;
        } else {
            map[ci++] = oi;
        }
    }

    return {
        cleaned,
        toOriginal: (i) => (i < ci ? map[i] : map[ci - 1]),
    };
}

function checkJsLikePatterns(file, text, patterns, baseLineOffset = 0) {
    const { cleaned, toOriginal } = stripCommentsMapped(text);

    for (const { re, message } of patterns) {
        for (const match of cleaned.matchAll(re)) {
            const ci = match.index ?? 0;
            report(file, baseLineOffset + lineAt(text, toOriginal(ci)), message);
        }
    }
}

function checkDomPatterns(file, text, baseLineOffset = 0) {
    checkJsLikePatterns(file, text, DOM_REPLACEMENT_PATTERNS, baseLineOffset);
}

const ALPINE_COMPONENT_GROUP_FILE_RE = /^assets\/alpine\.components\.[^.]+\.js$/;
const BARE_ALPINE_COMPONENTS_RE = /(?:^|[^\w$.])AlpineComponents\s*\./g;

async function checkAlpineComponentGroupReferences() {
    for (const file of await getFiles(ASSET_JS_GLOBS)) {
        if (!ALPINE_COMPONENT_GROUP_FILE_RE.test(file)) continue;

        const text = await readText(file);
        const { cleaned, toOriginal } = stripCommentsMapped(text);

        for (const match of cleaned.matchAll(BARE_ALPINE_COMPONENTS_RE)) {
            const prefixLength = match[0].indexOf('AlpineComponents');
            const offset = toOriginal((match.index ?? 0) + prefixLength);
            report(
                file,
                lineAt(text, offset),
                'Use ComponentGroups.<group>.<component>() inside Alpine component group files, not bare AlpineComponents.',
            );
        }
    }
}

// --- HTTP / Cart guard ---

const HTTP_CART_PATTERNS = [
    {
        re: /\bfetch\s*\(/g,
        message:
            'Application HTTP requests must use window.ShopifyHttp; raw fetch() is only allowed in assets/https.js or vendor files.',
    },
    {
        re: /\/cart(?:\.js|\/(?:add|change|clear|update)\.js)/g,
        message:
            'Cart requests must go through $store.cart; direct cart endpoints are only allowed in the cart store implementation.',
    },
];

const HTTP_FETCH_ALLOWLIST = new Set(['assets/https.js']);
const CART_ENDPOINT_ALLOWLIST = new Set(['assets/https.js', 'assets/alpine.store.cart.js']);

async function checkHttpCartGuard() {
    for (const file of await getFiles(LIQUID_GLOBS)) {
        const text = await readText(file);

        for (const match of text.matchAll(LIQUID_SCRIPT_RE)) {
            const baseLineOffset = lineAt(text, match.index ?? 0) - 1;
            checkJsLikePatterns(file, match[1], HTTP_CART_PATTERNS, baseLineOffset);
        }
    }

    for (const file of await getFiles(ASSET_JS_GLOBS)) {
        if (/\/vendor-/.test(file) || /\.min\.js$/.test(file)) continue;

        const text = await readText(file);

        if (!HTTP_FETCH_ALLOWLIST.has(file)) {
            checkJsLikePatterns(file, text, [HTTP_CART_PATTERNS[0]]);
        }

        if (!CART_ENDPOINT_ALLOWLIST.has(file)) {
            checkJsLikePatterns(file, text, [HTTP_CART_PATTERNS[1]]);
        }
    }
}

// --- Surface consumption protocol ---

const BG_SCHEME_SURFACE_RE = /\bbg-scheme-surface\b/g;
const TEXT_THEME_FG_RE = /\btext-theme-fg\b/g;
const LIQUID_COLOR_SCHEME_RE = /color-\{\{/;
const CLASS_ATTR_RE = /\bclass\s*=\s*(["'])([\s\S]*?)\1/gi;
const ASSIGN_QUOTED_VALUE_RE = /\{%-?\s*assign\s+[\w-]+\s*=[\s\S]*?['"]([^'"]*)['"]/g;

function hasPlainBgThemeBg(value) {
    return /\bbg-theme-bg(?![/\d])/.test(value);
}

function checkOverlaySurfaceClassString(file, text, classValue, offset) {
    if (!LIQUID_COLOR_SCHEME_RE.test(classValue)) return;
    if (!hasPlainBgThemeBg(classValue)) return;
    if (!/\btext-theme-text\b/.test(classValue)) return;

    report(
        file,
        lineAt(text, offset),
        'Overlay surfaces with color-{{ ... }} should use surface-component instead of bg-theme-bg text-theme-text.',
    );
}

// --- Typography consumption protocol ---

const HEADING_BASE_RE = /\bheading-base\b/g;
const BODY_BASE_RE = /\bbody-base\b/g;

async function checkTypographyProtocol() {
    for (const file of await getFiles(LIQUID_GLOBS)) {
        const text = await readText(file);

        for (const match of text.matchAll(HEADING_BASE_RE)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'heading-base is a foundation utility for CSS only; use heading-* tiers or native headings.',
            );
        }

        for (const match of text.matchAll(BODY_BASE_RE)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'body-base is a foundation utility for CSS only; use body-* tiers or inherit body.',
            );
        }
    }
}

async function checkSurfaceProtocol() {
    for (const file of await getFiles(SECTION_GLOBS)) {
        const text = await readText(file);

        for (const match of text.matchAll(BG_SCHEME_SURFACE_RE)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'Section gradient roots should use surface-section instead of bg-scheme-surface.',
            );
        }
    }

    for (const file of await getFiles(SNIPPET_GLOBS)) {
        const text = await readText(file);

        for (const match of text.matchAll(CLASS_ATTR_RE)) {
            checkOverlaySurfaceClassString(file, text, match[2], match.index ?? 0);
        }

        for (const match of text.matchAll(ASSIGN_QUOTED_VALUE_RE)) {
            checkOverlaySurfaceClassString(file, text, match[1], match.index ?? 0);
        }
    }

    for (const file of await getFiles(LIQUID_GLOBS)) {
        const text = await readText(file);

        for (const match of text.matchAll(TEXT_THEME_FG_RE)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'text-theme-fg is not a defined utility; use text-theme-text.',
            );
        }
    }
}

async function checkDomReplacement() {
    // Liquid files: extract JS blocks only
    for (const file of await getFiles(LIQUID_GLOBS)) {
        const text = await readText(file);

        for (const match of text.matchAll(LIQUID_SCRIPT_RE)) {
            const baseLineOffset = lineAt(text, match.index ?? 0) - 1;
            checkDomPatterns(file, match[1], baseLineOffset);
        }
    }

    // Asset JS files: skip allowlist and vendor/generated
    for (const file of await getFiles(ASSET_JS_GLOBS)) {
        if (DOM_REPLACEMENT_ALLOWLIST.has(file)) continue;
        if (/\/vendor-/.test(file) || /\.min\.js$/.test(file)) continue;

        const text = await readText(file);
        checkDomPatterns(file, text);
    }
}

async function main() {
    await Promise.all([
        checkSchemaIds(),
        checkLiquidArchitecture(),
        checkTypographyProtocol(),
        checkSurfaceProtocol(),
        checkAlpineComponentGroupReferences(),
        checkDomReplacement(),
        checkHttpCartGuard(),
    ]);

    if (failures.length === 0) {
        console.log('theme architecture lint passed.');
        return;
    }

    console.error(`theme architecture lint found ${failures.length} issue(s):`);
    for (const failure of failures) {
        console.error(`${failure.file}:${failure.line}: ${failure.message}`);
    }

    process.exitCode = 1;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
