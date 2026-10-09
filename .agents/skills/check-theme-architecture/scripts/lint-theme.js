#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const espree = require('espree');
const fg = require('fast-glob');
const { parseLiquidAst, walk } = require('./lib/liquid-ast');
const { parseLineAllows, pushFailure } = require('./lib/lint-allow');
const {
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
} = require('./lib/theme-contracts');
const {
    collectMigrationCounts,
    collectMigrationFailures,
    baselinePath,
    readBaseline,
    shrinkBaseline,
    toBaseline,
    writeBaselineFile,
} = require('./lib/migration-lint');
const {
    collectDeadSettingEntries,
    collectDeadSettingFailures,
    baselinePath: deadSettingsBaselinePath,
    readBaseline: readDeadSettingsBaseline,
    shrinkBaseline: shrinkDeadSettingsBaseline,
    toBaseline: toDeadSettingsBaseline,
    writeBaselineFile: writeDeadSettingsBaselineFile,
} = require('./lib/dead-setting-lint');
const {
    collectCssFontWeightFailures,
    collectMarkupFontWeightFailures,
} = require('./lib/font-weight-lint');
const {
    collectColourRoleSyncFailures,
    collectCssRawColourFailures,
    collectMarkupRawColourFailures,
} = require('./lib/raw-colour-lint');

const LIQUID_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'blocks/**/*.liquid',
    'templates/**/*.liquid',
];

const PROTECTED_RUNTIME_NAMES = new Set([
    'all_products',
    'article',
    'articles',
    'block',
    'blog',
    'blogs',
    'canonical_url',
    'cart',
    'collection',
    'collections',
    'content_for_header',
    'content_for_layout',
    'customer',
    'form',
    'forloop',
    'gift_card',
    'handle',
    'images',
    'linklists',
    'localization',
    'metaobjects',
    'order',
    'page',
    'page_description',
    'page_image',
    'page_title',
    'pages',
    'paginate',
    'predictive_search',
    'product',
    'recommendations',
    'request',
    'routes',
    'search',
    'section',
    'settings',
    'shop',
    'template',
    'theme',
]);

const STYLESHEET_MEDIA_CHECK = 'stylesheet-media-query';
const MEDIA_WIDTH_ATOM = /^\(width (>=|<) (48|64|80)rem\)$/;
const MEDIA_MOTION_ATOM = /^\(prefers-reduced-motion: (reduce|no-preference)\)$/;
const MEDIA_CAN_HOVER = '(hover: hover) and (pointer: fine)';
const MEDIA_NO_HOVER = 'not ((hover: hover) and (pointer: fine))';
const STYLESHEET_MEDIA_MESSAGE =
    'Liquid stylesheet media queries use only (width >= | < 48rem / 64rem / 80rem), ' +
    `${MEDIA_CAN_HOVER}, ${MEDIA_NO_HOVER}, and prefers-reduced-motion, joined by "and" (6-C2).`;

/** True when a media prelude uses only the tokenized breakpoints and the two hover conditions. */
function isAllowedStylesheetMedia(prelude) {
    const text = prelude.replace(/\s+/g, ' ').trim();
    if (text === MEDIA_NO_HOVER) return true;
    const parts = text.split(' and ');
    for (let i = 0; i < parts.length; i++) {
        if (MEDIA_WIDTH_ATOM.test(parts[i]) || MEDIA_MOTION_ATOM.test(parts[i])) continue;
        // can-hover is the pair `(hover: hover) and (pointer: fine)`, never one half alone.
        if (parts[i] === '(hover: hover)' && parts[i + 1] === '(pointer: fine)') {
            i++;
            continue;
        }
        return false;
    }
    return parts.length > 0 && parts[0] !== '';
}

function collectStylesheetMediaFailures(cssText, file, failures, allowsByLine, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;
    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n\r]/g, ' '));
    for (const match of stripped.matchAll(/@media([^{]*){/g)) {
        if (isAllowedStylesheetMedia(match[1])) continue;
        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(lineText, baseOffset + match.index),
            STYLESHEET_MEDIA_CHECK,
            `${STYLESHEET_MEDIA_MESSAGE} Found: @media${match[1].trimEnd()}.`,
        );
    }
}

const LEGACY_CHECK = {
    PROTECTED_RUNTIME: 'protected-runtime-name',
    TAB_ARIA: 'tab-aria',
    BUNDLED_ASSET: 'bundled-asset-tag',
    ALPINE_EXPRESSION: 'alpine-expression',
    INVALID_RGB_ALPHA: 'invalid-rgb-alpha',
};

const TAB_ARIA_SELECTED_ATTRS = ['aria-selected', ':aria-selected', 'x-bind:aria-selected'];
const TAB_ARIA_CONTROLS_ATTRS = ['aria-controls', ':aria-controls', 'x-bind:aria-controls'];

const BUNDLED_ASSET_TAG_NAMES = ['stylesheet', 'javascript'];
const CSS_SOURCE_GLOBS = ['tailwind/**/*.css', 'assets/base.css', 'assets/gift-card.css'];

const { extractBlocks } = require('./lint-embedded-compat.cjs');

const INVALID_RGB_ALPHA_RE = /rgba?\(\s*var\(--color-[a-z0-9-]+\)\s*\//i;
const INVALID_RGB_ALPHA_MESSAGE =
    'Scheme color variables are comma-separated RGB triplets. ' +
    'Use rgba(var(--color-*), alpha) instead of rgb(var(--color-*) / alpha).';

function parseRootArg(argv) {
    const index = argv.indexOf('--root');

    if (index !== -1 && argv[index + 1]) {
        return path.resolve(argv[index + 1]);
    }

    return process.cwd();
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function maskNonExecutableLiquid(text) {
    let masked = text;

    for (const [openTag, closeTag] of [
        ['comment', 'endcomment'],
        ['doc', 'enddoc'],
    ]) {
        const re = new RegExp(
            `{%-?\\s*${openTag}\\s*-?%}[\\s\\S]*?{%-?\\s*${closeTag}\\s*-?%}`,
            'gi',
        );
        masked = masked.replace(re, (match) => match.replace(/[^\n\r]/g, ' '));
    }

    return masked;
}

function collectProtectedRuntimeNameFailures(ast, text, file, failures, allowsByLine) {
    walk(ast, (node) => {
        if (node.type !== 'LiquidTag') {
            return;
        }

        if (node.name !== 'assign' && node.name !== 'capture') {
            return;
        }

        const name = node.markup?.name;

        if (typeof name !== 'string' || !PROTECTED_RUNTIME_NAMES.has(name)) {
            return;
        }

        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(text, node.position?.start ?? 0),
            LEGACY_CHECK.PROTECTED_RUNTIME,
            `Do not ${node.name} over protected Shopify Liquid runtime name "${name}".`,
        );
    });
}

function hasHtmlAttribute(attributes, names) {
    const expected = new Set(Array.isArray(names) ? names : [names]);

    return (attributes ?? []).some((attr) => {
        if (!Array.isArray(attr.name)) return false;
        const attrName = attr.name.map((part) => part.value || '').join('');
        return expected.has(attrName);
    });
}

function getHtmlAttributeValue(attributes, name) {
    if (!attributes) return '';

    for (const attr of attributes) {
        if (!Array.isArray(attr.name)) continue;

        const attrName = attr.name.map((part) => part.value || '').join('');
        if (attrName !== name) continue;

        return (attr.value ?? [])
            .map((part) => (part.type === 'TextNode' ? part.value || '' : ''))
            .join('')
            .trim();
    }

    return '';
}

function collectTabFailures(ast, text, file, failures, allowsByLine) {
    walk(ast, (node) => {
        if (!node.attributes) return;

        const role = getHtmlAttributeValue(node.attributes, 'role');
        if (role !== 'tab') return;

        const missing = [];

        if (!hasHtmlAttribute(node.attributes, TAB_ARIA_SELECTED_ATTRS)) {
            missing.push('aria-selected');
        }

        if (!hasHtmlAttribute(node.attributes, TAB_ARIA_CONTROLS_ATTRS)) {
            missing.push('aria-controls');
        }

        if (missing.length === 0) return;

        pushFailure(
            failures,
            allowsByLine,
            file,
            lineAt(text, node.position?.start ?? 0),
            LEGACY_CHECK.TAB_ARIA,
            `role="tab" is missing ${missing.join(', ')}.`,
        );
    });
}

const ALPINE_NON_EXPRESSION_DIRECTIVES = new Set([
    'x-cloak',
    'x-ignore',
    'x-ref',
    'x-teleport',
    'x-transition',
]);
const HTML_ENTITIES = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    newline: '\n',
    quot: '"',
    tab: '\t',
};
const ALPINE_EXPRESSION_MESSAGE =
    'keep Alpine attributes to simple expressions: move the logic into the registered component, and pass Liquid values through data-*.';

function isAlpineExpressionAttribute(name) {
    if (name.startsWith('@') || name.startsWith(':')) return true;
    if (!name.startsWith('x-')) return false;
    return !ALPINE_NON_EXPRESSION_DIRECTIVES.has(name.split(/[:.]/)[0]);
}

function decodeHtmlEntities(value) {
    let unknown = false;
    const decoded = value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi, (match, entity) => {
        if (entity[0] === '#') {
            const hex = entity[1] === 'x' || entity[1] === 'X';
            const codePoint = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
            if (codePoint > 0x10ffff) {
                unknown = true;
                return ' ';
            }
            return String.fromCodePoint(codePoint);
        }
        const known = HTML_ENTITIES[entity.toLowerCase()];
        if (known === undefined) unknown = true;
        return known ?? ' ';
    });
    return unknown ? null : decoded;
}

function findFunctionOrSequence(node, allowSequence) {
    if (!node || typeof node.type !== 'string') return null;
    if (
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ClassExpression'
    ) {
        return 'a function';
    }
    if (node.type === 'SequenceExpression' && !allowSequence) return 'a comma sequence';

    for (const [key, value] of Object.entries(node)) {
        if (key === 'parent' || key === 'loc' || key === 'range') continue;
        const children = Array.isArray(value) ? value : [value];
        for (const child of children) {
            if (child && typeof child === 'object') {
                const found = findFunctionOrSequence(child, allowSequence);
                if (found) return found;
            }
        }
    }
    return null;
}

const NOT_SINGLE_EXPRESSION = 'statements or invalid JavaScript (not a single expression)';

function parseSingleExpression(code) {
    const wrapped = `(${code}\n)`;
    let program;
    try {
        program = espree.parse(wrapped, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            tokens: true,
        });
    } catch {
        return null;
    }

    if (program.body.length !== 1 || program.body[0].type !== 'ExpressionStatement') return null;

    let depth = 0;
    const { tokens } = program;
    for (let index = 0; index < tokens.length; index += 1) {
        const { type, value } = tokens[index];
        if (type !== 'Punctuator') continue;
        if (value === '(') depth += 1;
        if (value === ')') {
            depth -= 1;
            if (depth === 0 && index !== tokens.length - 1) return null;
        }
    }

    return program.body[0].expression;
}

function describeAlpineExpressionProblem(name, code) {
    if (code.trim() === '') return null;

    const forParts = name.startsWith('x-for')
        ? code.match(/^\s*([\s\S]+?)\s+(?:in|of)\s+([\s\S]+)$/)
        : null;
    const checks = forParts ? [[forParts[1], true], [forParts[2], false]] : [[code, false]];

    for (const [part, allowSequence] of checks) {
        const expression = parseSingleExpression(part);
        if (!expression) return NOT_SINGLE_EXPRESSION;

        const problem = findFunctionOrSequence(expression, allowSequence);
        if (problem) return problem;
    }

    return null;
}

function flattenAttributes(attributes, result = []) {
    for (const attr of attributes ?? []) {
        if (Array.isArray(attr.name)) {
            result.push(attr);
        } else if (Array.isArray(attr.children)) {
            for (const child of attr.children) {
                flattenAttributes(child.children ?? [child], result);
            }
        }
    }
    return result;
}

function collectAlpineExpressionFailures(ast, text, file, failures, allowsByLine) {
    walk(ast, (node) => {
        for (const attr of flattenAttributes(node.attributes)) {
            const name = attr.name.map((part) => part.value || '').join('');
            if (!isAlpineExpressionAttribute(name)) continue;

            const parts = attr.value ?? [];
            const reasons = [];

            if (parts.some((part) => part.type !== 'TextNode')) {
                reasons.push('Liquid');
            }

            const decoded = decodeHtmlEntities(
                parts.map((part) => (part.type === 'TextNode' ? part.value || '' : '0')).join(''),
            );

            if (decoded === null) {
                reasons.push('an HTML entity this check cannot read (write the character itself)');
            } else {
                const problem = describeAlpineExpressionProblem(name, decoded);
                if (problem) reasons.push(problem);
            }

            if (reasons.length === 0) continue;

            pushFailure(
                failures,
                allowsByLine,
                file,
                lineAt(text, attr.position?.start ?? node.position?.start ?? 0),
                LEGACY_CHECK.ALPINE_EXPRESSION,
                `Alpine attribute "${name}" contains ${reasons.join(', ')}; ${ALPINE_EXPRESSION_MESSAGE}`,
            );
        }
    });
}

function collectBundledAssetTagFailures(ast, text, file, failures, allowsByLine) {
    const tagsByName = Object.fromEntries(BUNDLED_ASSET_TAG_NAMES.map((name) => [name, []]));

    walk(ast, (node) => {
        if (node.type !== 'LiquidRawTag') {
            return;
        }

        if (!tagsByName[node.name]) {
            return;
        }

        tagsByName[node.name].push(node);
    });

    for (const tagName of BUNDLED_ASSET_TAG_NAMES) {
        const tags = tagsByName[tagName];

        for (let index = 1; index < tags.length; index += 1) {
            const node = tags[index];
            pushFailure(
                failures,
                allowsByLine,
                file,
                lineAt(text, node.blockStartPosition?.start ?? node.position?.start ?? 0),
                LEGACY_CHECK.BUNDLED_ASSET,
                `Only one {% ${tagName} %} tag is allowed per file (found ${tags.length}). ` +
                    'Multiple tags cause a syntax error in the theme editor.',
            );
        }

        for (const node of tags) {
            if (!node.body) {
                continue;
            }

            walk(node.body, (inner) => {
                if (inner.type === 'LiquidVariableOutput') {
                    pushFailure(
                        failures,
                        allowsByLine,
                        file,
                        lineAt(text, inner.position?.start ?? 0),
                        LEGACY_CHECK.BUNDLED_ASSET,
                        `Liquid output tags are not allowed inside {% ${tagName} %} blocks. ` +
                            'Liquid is not rendered in bundled asset tags.',
                    );
                }

                if (inner.type === 'LiquidTag') {
                    pushFailure(
                        failures,
                        allowsByLine,
                        file,
                        lineAt(text, inner.position?.start ?? 0),
                        LEGACY_CHECK.BUNDLED_ASSET,
                        `Liquid tags are not allowed inside {% ${tagName} %} blocks. ` +
                            'Liquid is not rendered in bundled asset tags.',
                    );
                }
            });
        }
    }
}

function collectInvalidRgbAlphaFailures(cssText, file, failures, allowsByLine, options = {}) {
    const { baseOffset = 0, lineText = cssText } = options;
    const lines = cssText.split('\n');
    let offset = 0;

    for (const line of lines) {
        const strippedLine = line.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n\r]/g, ' '));

        if (INVALID_RGB_ALPHA_RE.test(strippedLine)) {
            pushFailure(
                failures,
                allowsByLine,
                file,
                lineAt(lineText, baseOffset + offset),
                LEGACY_CHECK.INVALID_RGB_ALPHA,
                INVALID_RGB_ALPHA_MESSAGE,
            );
        }

        offset += line.length + 1;
    }
}

async function runThemeLint(root, notes = []) {
    const failures = [];
    const files = await fg(LIQUID_GLOBS, { cwd: root, dot: false, onlyFiles: true });

    for (const file of files.map(formatPath)) {
        const text = await fs.readFile(path.join(root, file), 'utf8');
        const allowsByLine = parseLineAllows(text);
        collectLintAllowReasonFailures(text, file, failures);
        const { ast, error } = parseLiquidAst(text);

        if (error) {
            failures.push({
                file,
                line: 1,
                message: `Liquid parse error: ${error.message}`,
            });
            continue;
        }

        collectProtectedRuntimeNameFailures(ast, text, file, failures, allowsByLine);
        collectBundledAssetTagFailures(ast, text, file, failures, allowsByLine);
        collectTabFailures(ast, text, file, failures, allowsByLine);
        collectAlpineExpressionFailures(ast, text, file, failures, allowsByLine);
        collectSettingsChainLiquidFailures(ast, text, file, failures, allowsByLine);
        collectTypographyTierFailures(ast, text, file, failures, allowsByLine);
        collectMarkupFontWeightFailures(text, file, failures, allowsByLine);
        collectMarkupRawColourFailures(text, file, failures, allowsByLine);
        collectStylesheetPlacementFailures(ast, text, file, failures, allowsByLine, { file });

        for (const block of extractBlocks(text, 'stylesheet')) {
            collectInvalidRgbAlphaFailures(block.code, file, failures, allowsByLine, {
                baseOffset: block.offset,
                lineText: text,
            });
            collectSettingsChainCssFailures(block.code, file, failures, allowsByLine, {
                baseOffset: block.offset,
                lineText: text,
            });
            collectStylesheetDirectiveFailures(block.code, file, failures, allowsByLine, {
                baseOffset: block.offset,
                lineText: text,
            });
            collectStylesheetMediaFailures(block.code, file, failures, allowsByLine, {
                baseOffset: block.offset,
                lineText: text,
            });
            collectCssFontWeightFailures(block.code, file, failures, allowsByLine, {
                baseOffset: block.offset,
                lineText: text,
            });
            collectCssRawColourFailures(block.code, file, failures, allowsByLine, {
                baseOffset: block.offset,
                lineText: text,
            });
        }
    }

    const cssFiles = await fg(CSS_SOURCE_GLOBS, { cwd: root, dot: false, onlyFiles: true });

    for (const file of cssFiles.map(formatPath)) {
        const text = await fs.readFile(path.join(root, file), 'utf8');
        const allowsByLine = parseLineAllows(text);
        collectLintAllowReasonFailures(text, file, failures);
        collectInvalidRgbAlphaFailures(text, file, failures, allowsByLine);
        collectSettingsChainCssFailures(text, file, failures, allowsByLine);
        collectCssFontWeightFailures(text, file, failures, allowsByLine);
        collectCssRawColourFailures(text, file, failures, allowsByLine);
    }

    const hasThemeLayout = await fs
        .access(path.join(root, 'layout/theme.liquid'))
        .then(() => true)
        .catch(() => false);
    const hasAssets = await fs.access(path.join(root, 'assets')).then(() => true).catch(() => false);
    const hasVendorNotices = await fs
        .access(path.join(root, 'THIRD_PARTY_NOTICES.md'))
        .then(() => true)
        .catch(() => false);

    if (hasAssets) {
        collectJsOutletFailures(root, failures);
        collectJsCopyChainFailures(root, failures);
    }

    if (hasThemeLayout) {
        collectModuleRegistrationFailures(root, failures);
    }

    collectSectionColorSchemeFailures(root, failures);
    collectColourRoleSyncFailures(root, failures);
    collectMigrationFailures(root, failures, notes);
    collectDeadSettingFailures(root, failures, notes);

    if (hasAssets && hasVendorNotices) {
        collectVendorNoticeFailures(root, failures);
    }

    return failures;
}

/** Returns an exit code, or null when no migration baseline flag was given. */
function runMigrationBaselineFlag(root, argv) {
    if (argv.includes('--write-migration-baseline')) {
        if (require('node:fs').existsSync(baselinePath(root))) {
            console.error('--write-migration-baseline refused: the baseline already exists.');
            return 1;
        }
        writeBaselineFile(root, toBaseline(collectMigrationCounts(root)));
        console.log('Migration baseline written.');
        return 0;
    }
    if (argv.includes('--shrink-migration-baseline')) {
        const baseline = readBaseline(root);
        if (!baseline) {
            console.error('--shrink-migration-baseline refused: no baseline exists.');
            return 1;
        }
        writeBaselineFile(root, shrinkBaseline(baseline, collectMigrationCounts(root)));
        console.log('Migration baseline shrunk to the current counts.');
        return 0;
    }
    return null;
}

/** Returns an exit code, or null when no dead-settings baseline flag was given. */
function runDeadSettingsBaselineFlag(root, argv) {
    if (argv.includes('--write-dead-settings-baseline')) {
        if (require('node:fs').existsSync(deadSettingsBaselinePath(root))) {
            console.error('--write-dead-settings-baseline refused: the baseline already exists.');
            return 1;
        }
        const { entries } = collectDeadSettingEntries(root);
        writeDeadSettingsBaselineFile(root, toDeadSettingsBaseline(entries));
        console.log('Dead-settings baseline written.');
        return 0;
    }
    if (argv.includes('--shrink-dead-settings-baseline')) {
        const baseline = readDeadSettingsBaseline(root);
        if (!baseline) {
            console.error('--shrink-dead-settings-baseline refused: no baseline exists.');
            return 1;
        }
        const { entries } = collectDeadSettingEntries(root);
        writeDeadSettingsBaselineFile(root, shrinkDeadSettingsBaseline(baseline, entries));
        console.log('Dead-settings baseline shrunk to the current entries.');
        return 0;
    }
    return null;
}

async function main(argv = process.argv) {
    const root = parseRootArg(argv);
    let flagExit = runDeadSettingsBaselineFlag(root, argv);
    if (flagExit !== null) {
        process.exitCode = flagExit;
        return;
    }
    flagExit = runMigrationBaselineFlag(root, argv);
    if (flagExit !== null) {
        process.exitCode = flagExit;
        return;
    }

    const notes = [];
    const failures = await runThemeLint(root, notes);
    for (const note of notes) console.log(note);

    if (failures.length === 0) {
        console.log('Theme architecture lint passed.');
        return;
    }

    console.error(`Theme architecture lint found ${failures.length} issue(s):`);
    for (const failure of failures) {
        console.error(`${failure.file}:${failure.line}: ${failure.message}`);
    }

    process.exitCode = 1;
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = {
    PROTECTED_RUNTIME_NAMES,
    CHECK,
    LEGACY_CHECK,
    maskNonExecutableLiquid,
    runThemeLint,
    collectProtectedRuntimeNameFailures,
    collectBundledAssetTagFailures,
    collectTabFailures,
    collectInvalidRgbAlphaFailures,
    isAllowedStylesheetMedia,
    parseLineAllows,
};
