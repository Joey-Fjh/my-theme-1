const fs = require('node:fs/promises');
const path = require('node:path');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');
const { parseLiquidAst, walk } = require('./liquid-ast');
const { parseLineAllows, pushFailure } = require('./lint-allow');

const CHECK = {
    SETTINGS_CHAIN_LIQUID: 'settings-chain-liquid',
    SETTINGS_CHAIN_CSS_TYPOGRAPHY: 'settings-chain-css-typography',
    SETTINGS_CHAIN_CSS_COLOR: 'settings-chain-css-color',
    TYPOGRAPHY_TIER_HEADING: 'typography-tier-heading',
    TYPOGRAPHY_TIER_BODY_ON_HEADING: 'typography-tier-body-on-heading',
    STYLESHEET_DIRECTIVE: 'stylesheet-directive',
    LIQUID_STYLE_TAG: 'liquid-style-tag',
    EXECUTABLE_INLINE_SCRIPT: 'executable-inline-script',
    RAW_SVG: 'raw-svg',
    BARE_IMG: 'bare-img',
    X_TRANSITION: 'x-transition',
    JS_ALPINE_OUTLET: 'js-alpine-outlet',
    JS_FETCH_OUTLET: 'js-fetch-outlet',
    JS_CART_ROUTE_OUTLET: 'js-cart-route-outlet',
    JS_DOCUMENT_OUTLET: 'js-document-outlet',
    JS_USER_VISIBLE_COPY: 'js-user-visible-copy',
    MODULE_DATA_MODULE_ID: 'module-data-module-id',
    MODULE_IMPORT_MAP: 'module-import-map',
    MODULE_IMPORT_MAP_UNUSED: 'module-import-map-unused',
    SECTION_COLOR_SCHEME: 'section-color-scheme',
    VENDOR_NOTICES: 'vendor-notices',
    LINT_ALLOW_REASON: 'lint-allow-reason',
};

const DEFAULT_TEXT_SIZES = new Set([
    'xs',
    'sm',
    'base',
    'lg',
    'xl',
    '2xl',
    '3xl',
    '4xl',
    '5xl',
    '6xl',
    '7xl',
    '8xl',
    '9xl',
]);

const DEFAULT_FONT_WEIGHTS = new Set([
    'thin',
    'extralight',
    'light',
    'normal',
    'medium',
    'semibold',
    'bold',
    'extrabold',
    'black',
]);

const DEFAULT_FONT_FAMILIES = new Set(['sans', 'serif', 'mono']);

const DEFAULT_PALETTE = new Set([
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone',
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
    'black',
    'white',
]);

const PROJECT_COLOR_SUFFIXES = new Set([
    'transparent',
    'current',
    'inherit',
    'theme-bg',
    'theme-text',
    'theme-border',
    'success',
    'success-text',
    'error',
    'error-text',
]);

const COLOR_UTILITY_PREFIXES = [
    'text',
    'bg',
    'border',
    'fill',
    'stroke',
    'outline',
    'ring',
    'decoration',
    'accent',
    'caret',
    'shadow',
    'from',
    'via',
    'to',
];

const TYPOGRAPHY_UTILITY_PREFIXES = ['leading', 'tracking'];

const JS_OUTLET_FILES = {
    alpine: new Set(['assets/alpine.adapter.js']),
    fetch: new Set(['assets/https.js']),
    cart: new Set(['assets/cart.contract.js']),
    document: new Set([
        'assets/base.js',
        'assets/events.js',
        'assets/https.js',
        'assets/utils.js',
        'assets/alpine.adapter.js',
    ]),
};

const JS_LINT_SKIP = new Set(['assets/gift-card.js']);

const UNICODE_LETTER_RE = /\p{L}/u;

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function splitClassTokens(value) {
    return value
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);
}

function getStaticClassValues(attributes) {
    const values = [];

    for (const attr of attributes ?? []) {
        if (!Array.isArray(attr.name)) continue;

        const attrName = attr.name.map((part) => part.value || '').join('');
        if (attrName !== 'class') continue;

        const literal = (attr.value ?? [])
            .map((part) => (part.type === 'TextNode' ? part.value || '' : ''))
            .join('')
            .trim();

        if (literal) values.push(literal);
    }

    return values;
}

function isSettingsChainLiquidViolation(token) {
    if (!token || token.includes('{{') || token.includes('{%')) return false;

    if (/^(text|font|leading|tracking|bg|border|fill|stroke|outline|ring|decoration|accent|caret|shadow|from|via|to)-\[[^\]]+\]/.test(token)) {
        return true;
    }

    if (/^text-/.test(token)) {
        const suffix = token.slice(5);
        if (DEFAULT_TEXT_SIZES.has(suffix)) return true;
        if (DEFAULT_PALETTE.has(suffix.split('-')[0])) return true;
    }

    if (/^font-/.test(token)) {
        const suffix = token.slice(5);
        if (DEFAULT_FONT_WEIGHTS.has(suffix)) return true;
        if (DEFAULT_FONT_FAMILIES.has(suffix)) return true;
    }

    for (const prefix of TYPOGRAPHY_UTILITY_PREFIXES) {
        if (token === prefix || token.startsWith(`${prefix}-`)) return true;
    }

    for (const colorPrefix of COLOR_UTILITY_PREFIXES) {
        if (!token.startsWith(`${colorPrefix}-`)) continue;
        const suffix = token.slice(colorPrefix.length + 1);
        if (PROJECT_COLOR_SUFFIXES.has(suffix)) continue;
        if (DEFAULT_PALETTE.has(suffix.split('-')[0])) return true;
    }

    return false;
}

function collectSettingsChainLiquidFailures(ast, text, file, failures, allowsByLine) {
    walk(ast, (node) => {
        if (!node.attributes) return;

        for (const classValue of getStaticClassValues(node.attributes)) {
            for (const token of splitClassTokens(classValue)) {
                if (!isSettingsChainLiquidViolation(token)) continue;

                const line = lineAt(text, node.position?.start ?? 0);
                pushFailure(
                    failures,
                    allowsByLine,
                    file,
                    line,
                    CHECK.SETTINGS_CHAIN_LIQUID,
                    `Class "${token}" bypasses the settings typography/color chain; use tier, scheme, or token utilities instead.`,
                );
            }
        }
    });
}

function isTypographyProperty(property) {
    return ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing'].includes(
        property,
    );
}

function isColorProperty(property) {
    return [
        'color',
        'background',
        'background-color',
        'border-color',
        'outline-color',
        'fill',
        'stroke',
        'caret-color',
        'text-decoration-color',
        'column-rule-color',
    ].includes(property);
}

function isAllowedTypographyValue(value) {
    const trimmed = value.trim();
    if (!trimmed) return true;
    // Derived from the settings chain: a --font-* token, alone or inside calc()/max()/min()/clamp().
    if (/^var\(--font-/.test(trimmed)) return true;
    if (/^(calc|max|min|clamp)\(/i.test(trimmed) && /var\(--font-/.test(trimmed)) return true;
    // Relative to the inherited, already-derived value.
    if (/^(inherit|unset|bolder|lighter)$/i.test(trimmed)) return true;
    if (/^[\d.]+(em|%)$/.test(trimmed)) return true;
    return false;
}

function isAllowedColorValue(value) {
    const trimmed = value.trim();
    if (!trimmed) return true;
    if (/^(transparent|currentColor|inherit)$/i.test(trimmed)) return true;
    if (/^var\(--color-/.test(trimmed)) return true;
    if (/^rgb\(var\(--color-/.test(trimmed)) return true;
    if (/^rgba\(var\(--color-/.test(trimmed)) return true;
    if (/^color-mix\(/.test(trimmed) && /var\(--color-/.test(trimmed)) return true;
    return false;
}

function isForbiddenColorValue(value) {
    const trimmed = value.trim();
    if (isAllowedColorValue(trimmed)) return false;
    if (/#[0-9a-f]{3,8}/i.test(trimmed)) return true;
    if (/^rgb(a)?\(\s*[\d.]/.test(trimmed)) return true;
    if (/^hsl(a)?\(/i.test(trimmed)) return true;
    if (/^(white|black|red|blue|green|gray|grey|silver|navy|teal|aqua|fuchsia|lime|maroon|olive|purple|yellow)$/i.test(trimmed)) {
        return true;
    }
    return false;
}

function collectSettingsChainCssFailures(cssText, file, failures, allowsByLine, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;
    const lines = cssText.split('\n');
    let offset = 0;

    for (const line of lines) {
        const lineNumber = lineAt(lineText, baseOffset + offset);
        // Every declaration on the line, including single-line rules and a last declaration without ";".
        for (const declMatch of line.matchAll(/(?:^|[{;])\s*([a-z-]+)\s*:\s*([^;{}]+?)\s*(?=;|}|$)/gi)) {
            const property = declMatch[1].toLowerCase();
            const value = declMatch[2];

            if (isTypographyProperty(property) && !isAllowedTypographyValue(value)) {
                pushFailure(
                    failures,
                    allowsByLine,
                    file,
                    lineNumber,
                    CHECK.SETTINGS_CHAIN_CSS_TYPOGRAPHY,
                    `Typography property "${property}" must derive from var(--font-*) or inherit; do not use literal "${value.trim()}".`,
                );
            }

            if (isColorProperty(property) && isForbiddenColorValue(value)) {
                pushFailure(
                    failures,
                    allowsByLine,
                    file,
                    lineNumber,
                    CHECK.SETTINGS_CHAIN_CSS_COLOR,
                    `Color property "${property}" must use scheme tokens (var(--color-*) / rgb(var(--color-*))); do not use literal "${value.trim()}".`,
                );
            }
        }

        offset += line.length + 1;
    }
}

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function getTagName(node) {
    if (typeof node.name === 'string') return node.name.toLowerCase();
    if (Array.isArray(node.name)) {
        return node.name.map((part) => part.value || '').join('').toLowerCase();
    }
    return '';
}

function collectTypographyTierFailures(ast, text, file, failures, allowsByLine) {
    walk(ast, (node) => {
        if (node.type !== 'HtmlElement' && node.type !== 'HtmlVoidElement') return;
        if (!node.attributes) return;

        const tagName = getTagName(node);
        if (!tagName) return;

        const classValues = getStaticClassValues(node.attributes).join(' ');
        const line = lineAt(text, node.position?.start ?? 0);

        if (!HEADING_TAGS.has(tagName)) {
            if (/\bheading-h[1-6]\b/.test(classValues)) {
                pushFailure(
                    failures,
                    allowsByLine,
                    file,
                    line,
                    CHECK.TYPOGRAPHY_TIER_HEADING,
                    `heading-h* tiers belong on h1–h6 elements, not <${tagName}>.`,
                );
            }
        }

        if (HEADING_TAGS.has(tagName) && /\bbody-[\w-]+\b/.test(classValues)) {
            pushFailure(
                failures,
                allowsByLine,
                file,
                line,
                CHECK.TYPOGRAPHY_TIER_BODY_ON_HEADING,
                'body-* tiers belong on non-heading elements, not on headings.',
            );
        }
    });
}

function collectStylesheetPlacementFailures(ast, text, file, failures, allowsByLine, options = {}) {
    const { file: logicalFile = file } = options;

    walk(ast, (node) => {
        if (!node.attributes) return;

        for (const attr of node.attributes) {
            if (!Array.isArray(attr.name)) continue;
            const attrName = attr.name.map((part) => part.value || '').join('');

            if (attrName.startsWith('x-transition')) {
                pushFailure(
                    failures,
                    allowsByLine,
                    file,
                    lineAt(text, attr.position?.start ?? node.position?.start ?? 0),
                    CHECK.X_TRANSITION,
                    'Do not use x-transition for ordinary state motion; use CSS capability classes instead.',
                );
            }
        }
    });

    if (/<style\b/i.test(text)) {
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(text, text.search(/<style\b/i)),
            CHECK.LIQUID_STYLE_TAG,
            'Do not use ad-hoc <style> elements in Liquid; use {% stylesheet %} or the Tailwind build.',
        );
    }

    const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    for (const match of text.matchAll(scriptRe)) {
        const attrs = match[1] || '';
        const body = (match[2] || '').trim();
        if (!body) continue;
        if (/type\s*=\s*['"]application\/ld\+json['"]/i.test(attrs)) continue;
        if (/type\s*=\s*['"]importmap['"]/i.test(attrs)) continue;

        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(text, match.index ?? 0),
            CHECK.EXECUTABLE_INLINE_SCRIPT,
            'Do not use executable inline <script> tags; load modules through the import map.',
        );
    }

    if (logicalFile !== 'snippets/icons.liquid' && /<svg\b/i.test(text)) {
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(text, text.search(/<svg\b/i)),
            CHECK.RAW_SVG,
            'Do not paste raw SVG into Liquid; render icons through the icons snippet.',
        );
    }

    if (logicalFile !== 'snippets/image.liquid' && logicalFile !== 'templates/gift_card.liquid') {
        const imgRe = /<img\b/gi;
        for (const match of text.matchAll(imgRe)) {
            pushFailure(
                failures,
                allowsByLine,
                file,
                lineAt(text, match.index ?? 0),
                CHECK.BARE_IMG,
                'Do not output bare <img> tags; use snippets/image.liquid.',
            );
        }
    }
}

function collectStylesheetDirectiveFailures(cssText, file, failures, allowsByLine, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;
    const lines = cssText.split('\n');
    let offset = 0;

    for (const line of lines) {
        if (/@(apply|utility|variant)\b/.test(line)) {
            pushFailure(
                failures,
                allowsByLine,
                file,
                lineAt(lineText, baseOffset + offset),
                CHECK.STYLESHEET_DIRECTIVE,
                '{% stylesheet %} blocks accept plain CSS only; do not use @apply, @utility, or @variant.',
            );
        }
        offset += line.length + 1;
    }
}

function collectJsOutletFailures(root, failures) {
    const files = fg.sync('assets/*.js', { cwd: root, onlyFiles: true }).map(formatPath);

    for (const file of files) {
        if (/^assets\/vendor-/.test(file) || file.endsWith('.min.js') || JS_LINT_SKIP.has(file)) {
            continue;
        }

        const source = require('node:fs').readFileSync(path.join(root, file), 'utf8');
        const lines = source.split(/\r\n|\r|\n/);

        lines.forEach((line, index) => {
            const lineNumber = index + 1;

            if (/\bwindow\.Alpine\b/.test(line) || /\bAlpine\./.test(line)) {
                if (!JS_OUTLET_FILES.alpine.has(file)) {
                    failures.push({
                        file,
                        line: lineNumber,
                        checkId: CHECK.JS_ALPINE_OUTLET,
                        message: 'Alpine APIs belong in alpine.adapter.js only.',
                    });
                }
            }

            if (/\bfetch\s*\(/.test(line) || /\bXMLHttpRequest\b/.test(line)) {
                if (!JS_OUTLET_FILES.fetch.has(file)) {
                    failures.push({
                        file,
                        line: lineNumber,
                        checkId: CHECK.JS_FETCH_OUTLET,
                        message: 'HTTP requests belong in https.js only.',
                    });
                }
            }

            if (/\/cart\//.test(line) || /\broutes\.cart_/.test(line)) {
                if (!JS_OUTLET_FILES.cart.has(file)) {
                    failures.push({
                        file,
                        line: lineNumber,
                        checkId: CHECK.JS_CART_ROUTE_OUTLET,
                        message: 'Cart routes belong in cart.contract.js only.',
                    });
                }
            }

            if (/\b(?:document|window)\.addEventListener\b/.test(line)) {
                if (!JS_OUTLET_FILES.document.has(file)) {
                    failures.push({
                        file,
                        line: lineNumber,
                        checkId: CHECK.JS_DOCUMENT_OUTLET,
                        message:
                            'Global document/window listeners belong in base.js, events.js, https.js, utils.js, or alpine.adapter.js.',
                    });
                }
            }
        });
    }
}

function collectJsCopyChainFailures(root, failures) {
    const files = fg.sync('assets/*.js', { cwd: root, onlyFiles: true }).map(formatPath);

    for (const file of files) {
        if (/^assets\/vendor-/.test(file) || file.endsWith('.min.js') || JS_LINT_SKIP.has(file)) {
            continue;
        }

        const source = require('node:fs').readFileSync(path.join(root, file), 'utf8');
        const lines = source.split(/\r\n|\r|\n/);

        lines.forEach((line, index) => {
            const lineNumber = index + 1;

            const patterns = [
                {
                    re: /\.(textContent|innerText|innerHTML)\s*=\s*['"`]([^'"`]+)['"`]/,
                    label: 'assignment',
                },
                {
                    re: /\.setAttribute\s*\(\s*['"`](aria-label|title|placeholder|alt)['"`]\s*,\s*['"`]([^'"`]+)['"`]/,
                    label: 'setAttribute',
                },
                { re: /\balert\s*\(\s*['"`]([^'"`]+)['"`]/, label: 'alert' },
            ];

            for (const { re } of patterns) {
                const match = line.match(re);
                if (!match) continue;
                const literal = match[match.length - 1];
                if (!literal || !UNICODE_LETTER_RE.test(literal)) continue;

                failures.push({
                    file,
                    line: lineNumber,
                    checkId: CHECK.JS_USER_VISIBLE_COPY,
                    message: `Hardcoded user-visible copy in assets must come from Liquid data-* attributes, not "${literal}".`,
                });
            }
        });
    }
}

// Returns null when the text holds no import map or its JSON does not parse.
function parseImportMapEntries(liquid) {
    const match = liquid.match(/<script\s+type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return null;

    try {
        const json = JSON.parse(match[1]);
        return new Map(Object.entries(json.imports ?? {}));
    } catch {
        return null;
    }
}

function importMapAssetFile(target) {
    const match = String(target).match(/\{\{-?\s*['"]([^'"]+)['"]\s*\|\s*asset_url\s*-?\}\}/);
    return match ? `assets/${match[1]}` : null;
}

// Returns the full opening tag that contains `index`, skipping quoted values and Liquid delimiters.
function openingTagAt(text, index) {
    const start = text.lastIndexOf('<', index);
    if (start === -1) return '';

    let quote = null;
    for (let i = start + 1; i < text.length; i += 1) {
        const char = text[i];
        if (quote) {
            if (char === quote) quote = null;
            continue;
        }
        if (char === '"' || char === "'") {
            quote = char;
            continue;
        }
        if (char === '{' && (text[i + 1] === '{' || text[i + 1] === '%')) {
            const close = text.indexOf(text[i + 1] === '{' ? '}}' : '%}', i + 2);
            if (close === -1) return text.slice(start);
            i = close + 1;
            continue;
        }
        if (char === '>') return text.slice(start, i + 1);
    }
    return text.slice(start);
}

const ENTRY_SCRIPTS_SNIPPET = 'snippets/scripts.liquid';

function collectModuleRegistrationFailures(root, failures) {
    const fsSync = require('node:fs');
    const themeLiquid = fsSync.readFileSync(path.join(root, 'layout/theme.liquid'), 'utf8');
    if (!/\{%-?\s*render\s+['"]scripts['"]\s*-?%\}/.test(themeLiquid)) {
        failures.push({
            file: 'layout/theme.liquid',
            line: 1,
            checkId: CHECK.MODULE_IMPORT_MAP,
            message: `layout/theme.liquid must render 'scripts' (${ENTRY_SCRIPTS_SNIPPET}), which holds the import map and entry scripts.`,
        });
    }

    const snippetFile = path.join(root, ENTRY_SCRIPTS_SNIPPET);
    const scriptsLiquid = fsSync.existsSync(snippetFile) ? fsSync.readFileSync(snippetFile, 'utf8') : '';
    const parsedImportMap = parseImportMapEntries(scriptsLiquid);
    if (!parsedImportMap) {
        failures.push({
            file: ENTRY_SCRIPTS_SNIPPET,
            line: 1,
            checkId: CHECK.MODULE_IMPORT_MAP,
            message: `${ENTRY_SCRIPTS_SNIPPET} must exist and hold one parsable <script type="importmap">.`,
        });
    }

    const importMapEntries = parsedImportMap ?? new Map();
    const importMapKeys = new Set(importMapEntries.keys());

    for (const [key, target] of importMapEntries) {
        const assetFile = importMapAssetFile(target);
        if (!assetFile || !require('node:fs').existsSync(path.join(root, assetFile))) {
            failures.push({
                file: ENTRY_SCRIPTS_SNIPPET,
                line: 1,
                checkId: CHECK.MODULE_IMPORT_MAP,
                message: `Import map entry "${key}" must map to an existing asset through asset_url.`,
            });
        }
    }
    const liquidFiles = fg
        .sync(['layout/**/*.liquid', 'sections/**/*.liquid', 'snippets/**/*.liquid', 'blocks/**/*.liquid'], {
            cwd: root,
            onlyFiles: true,
        })
        .map(formatPath);

    const moduleIds = new Set();

    for (const file of liquidFiles) {
        const text = require('node:fs').readFileSync(path.join(root, file), 'utf8');

        const xDataRe = /x-data\s*=\s*["'][^"']+["']/g;
        for (const match of text.matchAll(xDataRe)) {
            const line = lineAt(text, match.index ?? 0);
            const hasModuleId = /\sdata-module-id\s*=/.test(openingTagAt(text, match.index ?? 0));
            if (!hasModuleId) {
                failures.push({
                    file,
                    line,
                    checkId: CHECK.MODULE_DATA_MODULE_ID,
                    message: 'Every x-data root must declare data-module-id.',
                });
            }
        }

        const moduleIdRe = /data-module-id\s*=\s*["']([^"']+)["']/g;
        for (const match of text.matchAll(moduleIdRe)) {
            moduleIds.add(match[1]);
        }
    }

    for (const moduleId of moduleIds) {
        if (!importMapKeys.has(moduleId)) {
            failures.push({
                file: ENTRY_SCRIPTS_SNIPPET,
                line: 1,
                checkId: CHECK.MODULE_IMPORT_MAP,
                message: `data-module-id "${moduleId}" is missing from the import map.`,
            });
        }

        const expectedFile = `assets/${moduleId}.js`;
        if (importMapKeys.has(moduleId) && importMapAssetFile(importMapEntries.get(moduleId)) !== expectedFile) {
            failures.push({
                file: ENTRY_SCRIPTS_SNIPPET,
                line: 1,
                checkId: CHECK.MODULE_IMPORT_MAP,
                message: `Import map entry "${moduleId}" must map to ${expectedFile}.`,
            });
        }
    }

    const jsSources = fg
        .sync('assets/*.js', { cwd: root, onlyFiles: true })
        .map((file) => formatPath(file))
        .filter((file) => !/^assets\/vendor-/.test(file) && !file.endsWith('.min.js') && !JS_LINT_SKIP.has(file))
        .map((file) => require('node:fs').readFileSync(path.join(root, file), 'utf8'))
        .join('\n');

    for (const key of importMapKeys) {
        const usedByModuleId = moduleIds.has(key);
        const usedByImport = new RegExp(`from\\s+['"]${key}['"]`).test(jsSources);
        if (!usedByModuleId && !usedByImport) {
            failures.push({
                file: ENTRY_SCRIPTS_SNIPPET,
                line: 1,
                checkId: CHECK.MODULE_IMPORT_MAP_UNUSED,
                message: `Import map entry "${key}" is unused by data-module-id or assets/*.js imports.`,
            });
        }
    }
}

function sectionHasColorSchemeSetting(schemaText) {
    return /"type"\s*:\s*"color_scheme"/.test(schemaText);
}

function stripLiquidAndHtmlComments(text) {
    return text
        .replace(/{%-?\s*comment\s*-?%}[\s\S]*?{%-?\s*endcomment\s*-?%}/g, '')
        .replace(/<!--[\s\S]*?-->/g, '');
}

// snippets/section-frame.liquid writes `color-{{ section.settings.color_scheme }}` literally in
// a class attribute, so a section that renders it with `section: section` applies the scheme on
// its frame. The frame check is as strict as the inline one, plus: outside comments and inside
// `class="…"`. Like the inline check, it proves the markup carries the class, not the rendered DOM.
function sectionFrameAppliesColorScheme(root) {
    const framePath = path.join(root, 'snippets/section-frame.liquid');
    if (!require('node:fs').existsSync(framePath)) return false;
    const text = stripLiquidAndHtmlComments(require('node:fs').readFileSync(framePath, 'utf8'));
    return /class="[^"]*color-\{\{\s*section\.settings\.color_scheme\s*\}\}[^"]*"/.test(text);
}

// Checks the value the snippet receives as `section`, read from Shopify's Liquid parser rather
// than from text, so whitespace, quoting, comments, and `{% liquid %}` blocks resolve as Liquid
// resolves them. Liquid keeps the last named argument per key and applies a `with`/`for … as
// <alias>` binding after named arguments, so a render tag passes only with exactly one `section:`
// argument that is the bare `section` variable (no lookups) and no alias named `section`.
function isSectionFrameRenderWithSection(node) {
    if (node.type !== 'LiquidTag' || node.name !== 'render') return false;
    const markup = node.markup;
    if (!markup || typeof markup !== 'object' || markup.snippet?.value !== 'section-frame') return false;
    // A `with`/`for … as <alias>` binding is applied after named arguments, so it can override either.
    if (markup.alias?.value === 'section' || markup.alias?.value === 'scheme_target') return false;

    const sectionArgs = (markup.args || []).filter((arg) => arg.name === 'section');
    if (sectionArgs.length !== 1) return false;
    const value = sectionArgs[0].value;
    if (!(value?.type === 'VariableLookup' && value.name === 'section' && value.lookups.length === 0)) return false;

    // The frame applies the class only when `scheme_target` is omitted or the literal 'root' / 'inner'.
    // Any other value (`'none'`, a variable) leaves the section to the inline check.
    const targetArgs = (markup.args || []).filter((arg) => arg.name === 'scheme_target');
    if (targetArgs.length === 0) return true;
    if (targetArgs.length !== 1) return false;
    const target = targetArgs[0].value;
    return target?.type === 'String' && (target.value === 'root' || target.value === 'inner');
}

function rendersSectionFrame(markup) {
    const { ast } = parseLiquidAst(markup);
    if (!ast) return false;

    let found = false;
    walk(ast, (node) => {
        if (isSectionFrameRenderWithSection(node)) found = true;
    });
    return found;
}

function collectSectionColorSchemeFailures(root, failures) {
    const files = fg.sync('sections/**/*.liquid', { cwd: root, onlyFiles: true }).map(formatPath);
    const frameAppliesScheme = sectionFrameAppliesColorScheme(root);

    for (const file of files) {
        const text = require('node:fs').readFileSync(path.join(root, file), 'utf8');
        const schemaMatch = text.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
        if (!schemaMatch) continue;
        if (!sectionHasColorSchemeSetting(schemaMatch[1])) continue;

        const markup = text.slice(0, schemaMatch.index ?? 0);
        const appliesInline = /color-\{\{\s*section\.settings\.color_scheme\s*\}\}/.test(markup);
        const appliesViaFrame = frameAppliesScheme && rendersSectionFrame(markup);
        if (!appliesInline && !appliesViaFrame) {
            failures.push({
                file,
                line: 1,
                checkId: CHECK.SECTION_COLOR_SCHEME,
                message:
                    'Sections with a color_scheme setting must apply color-{{ section.settings.color_scheme }} on the section frame.',
            });
        }
    }
}

function collectVendorNoticeFailures(root, failures) {
    const noticesPath = path.join(root, 'THIRD_PARTY_NOTICES.md');
    const notices = require('node:fs').readFileSync(noticesPath, 'utf8');
    const vendors = fg.sync('assets/vendor-*', { cwd: root, onlyFiles: true }).map(formatPath);

    for (const vendor of vendors) {
        if (!notices.includes(vendor)) {
            failures.push({
                file: 'THIRD_PARTY_NOTICES.md',
                line: 1,
                checkId: CHECK.VENDOR_NOTICES,
                message: `Missing THIRD_PARTY_NOTICES.md entry for ${vendor}.`,
            });
        }
    }
}

function collectLintAllowReasonFailures(text, file, failures) {
    const lines = text.split(/\r\n|\r|\n/);

    lines.forEach((line, index) => {
        if (!/lint-allow\b/.test(line)) return;

        const cssMatch = line.match(/\/\*\s*(.*?)\s*\*\//);
        const liquidMatch = line.match(/{%-?\s*#\s*(.*?)\s*-?%}/);
        const payload = cssMatch?.[1] ?? liquidMatch?.[1] ?? '';

        if (!/lint-allow\s+[a-z][a-z0-9-]*\s*:/.test(payload)) {
            failures.push({
                file,
                line: index + 1,
                checkId: CHECK.LINT_ALLOW_REASON,
                message: 'lint-allow comments must include a check id and reason: lint-allow <check-id>: <reason>.',
            });
        }
    });
}

module.exports = {
    CHECK,
    collectSettingsChainLiquidFailures,
    collectSettingsChainCssFailures,
    collectTypographyTierFailures,
    collectStylesheetPlacementFailures,
    collectStylesheetDirectiveFailures,
    collectJsOutletFailures,
    collectJsCopyChainFailures,
    collectModuleRegistrationFailures,
    collectSectionColorSchemeFailures,
    collectVendorNoticeFailures,
    collectLintAllowReasonFailures,
    parseLineAllows,
    pushFailure,
};
