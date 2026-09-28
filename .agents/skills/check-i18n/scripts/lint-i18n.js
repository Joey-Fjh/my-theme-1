#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const fg = require('fast-glob');
const { toLiquidHtmlAST, walk } = require('@shopify/liquid-html-parser');
const { parseTree, visit, getNodeValue } = require('jsonc-parser');

const ROOT = process.cwd();

const STOREFRONT_LOCALE = 'locales/en.default.json';
const SCHEMA_LOCALE = 'locales/en.default.schema.json';

const LIQUID_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'blocks/**/*.liquid',
    'templates/**/*.liquid',
];
const SCHEMA_GLOBS = ['sections/**/*.liquid', 'blocks/**/*.liquid', 'config/settings_schema.json'];
// Section group JSON (header-group, footer-group) can carry `t:` names; check their keys exist.
const SCHEMA_KEY_GLOBS = [...SCHEMA_GLOBS, 'sections/*.json'];
const LOCALE_GLOBS = ['locales/**/*.json'];

const UNICODE_LETTER_RE = /\p{L}/u;
const SCHEMA_KEY_RE = /"t:([a-z0-9_.-]+)"/g;

const ALLOWED_TEXT_RE = [
    /^\s*$/,
    /^(?:\s|\||&(?:nbsp|ndash|mdash|hellip|middot);)+$/i,
    /^https?:\/\//,
    /^mailto:/,
    /^tel:/,
    /^#[\w-]+$/,
    /^\{\{.*\}\}$/,
    /^\{%.*%\}$/,
];

const SCHEMA_ROUTE_RE = /^\//;
const SCHEMA_UNIT_RE = /^(px|em|rem|%|vh|vw|s|ms|deg)$/;

const USER_VISIBLE_TEXT_DEFAULT_SETTING_TYPES = new Set([
    'html',
    'inline_richtext',
    'richtext',
    'text',
    'textarea',
]);

const INSTANCE_SETTINGS_CONTEXTS = new Set([
    'preset_settings',
    'preset_block_settings',
    'section_default_settings',
    'section_default_block_settings',
]);

const SETTING_SCHEMA_PROPERTIES = new Set([
    'label',
    'info',
    'placeholder',
    'content',
    'group',
    'unit',
    'default',
]);

const failures = [];

function report(file, line, message) {
    failures.push({ file, line, message });
}

function toPos(text, offset) {
    const before = text.slice(0, offset);
    return before.split(/\r\n|\r|\n/).length;
}

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function containsUserVisibleText(value) {
    const text = String(value).trim();

    if (!text || !UNICODE_LETTER_RE.test(text)) {
        return false;
    }

    return !isAllowedLiteral(text);
}

function isAllowedLiteral(value) {
    const text = String(value).trim();

    if (text.includes('{%') || text.includes('%}') || text.includes('{{') || text.includes('}}')) {
        return true;
    }

    return ALLOWED_TEXT_RE.some((re) => re.test(text));
}

function isSchemaUrlDefault(value) {
    const text = String(value).trim();

    if (/^https?:\/\//.test(text)) return true;
    if (/^mailto:/.test(text)) return true;
    if (/^tel:/.test(text)) return true;
    if (SCHEMA_ROUTE_RE.test(text)) return true;

    return false;
}

function getSettingType(props) {
    const typeNode = props.get('type');
    const type = getNodeValue(typeNode);
    return typeof type === 'string' ? type : '';
}

function isNonVisibleSchemaUnit(property, value) {
    return property === 'unit' && SCHEMA_UNIT_RE.test(String(value).trim());
}

function isThemeInfoGroup(props) {
    const nameNode = props.get('name');
    return getNodeValue(nameNode) === 'theme_info';
}

const USER_VISIBLE_ATTRS = new Set(['aria-label', 'alt', 'placeholder', 'title']);

function parseLiquidAst(source) {
    try {
        return { ast: toLiquidHtmlAST(source) };
    } catch (error) {
        return { error: { message: error.message, line: error.loc?.start?.line ?? 1 } };
    }
}

function flattenLocaleKeys(node, prefix = '', keys = new Set()) {
    if (!node || node.type !== 'object') return keys;

    for (const property of node.children ?? []) {
        const keyNode = property.children?.[0];
        const valueNode = property.children?.[1];
        const key = getNodeValue(keyNode);
        const next = prefix ? `${prefix}.${key}` : key;

        if (valueNode?.type === 'object') {
            flattenLocaleKeys(valueNode, next, keys);
        } else {
            keys.add(next);
        }
    }

    return keys;
}

function buildPropertyMap(node) {
    const props = new Map();

    if (node?.type !== 'object') {
        return props;
    }

    for (const propertyNode of node.children ?? []) {
        const keyNode = propertyNode.children?.[0];
        const valueNode = propertyNode.children?.[1];
        const key = getNodeValue(keyNode);

        if (typeof key === 'string' && valueNode) {
            props.set(key, valueNode);
        }
    }

    return props;
}

function getSchemaContextKind(contextStack) {
    return contextStack.at(-1) ?? 'unknown';
}

function getOptionValues(props) {
    const optionsNode = props.get('options');
    if (!optionsNode || optionsNode.type !== 'array') {
        return [];
    }

    const values = [];

    for (const child of optionsNode.children ?? []) {
        const optionProps = buildPropertyMap(child);
        const valueNode = optionProps.get('value');
        const value = getNodeValue(valueNode);

        if (value !== undefined && value !== null) {
            values.push(String(value));
        }
    }

    return values;
}

function shouldRequireSchemaTranslation(contextStack, property, props) {
    const context = getSchemaContextKind(contextStack);

    if (INSTANCE_SETTINGS_CONTEXTS.has(context)) {
        return false;
    }

    if (context === 'section_default' || context === 'section_default_block_item') {
        return false;
    }

    if (context === 'theme_setting_group' && isThemeInfoGroup(props)) {
        return false;
    }

    if (context === 'preset_item') {
        return property === 'name' || property === 'category';
    }

    if (context === 'section_root' || context === 'block_item' || context === 'theme_setting_group') {
        return property === 'name';
    }

    if (context === 'setting_item' || context === 'option_item') {
        return SETTING_SCHEMA_PROPERTIES.has(property);
    }

    return false;
}

function shouldSkipSchemaDefault(property, value, props) {
    if (property !== 'default') {
        return false;
    }

    const settingType = getSettingType(props);
    const text = String(value).trim();

    if (getOptionValues(props).includes(text)) {
        return true;
    }

    if (settingType === 'url' && isSchemaUrlDefault(value)) {
        return true;
    }

    if (settingType === 'liquid') {
        return true;
    }

    if (USER_VISIBLE_TEXT_DEFAULT_SETTING_TYPES.has(settingType)) {
        return false;
    }

    return true;
}

function walkSchemaNode(node, contextStack, callbacks) {
    if (!node) return;

    if (node.type === 'array') {
        const parentContext = getSchemaContextKind(contextStack);

        for (const child of node.children ?? []) {
            if (parentContext === 'theme_settings_root') {
                walkSchemaNode(child, [...contextStack, 'theme_setting_group'], callbacks);
                continue;
            }

            if (parentContext === 'settings_list') {
                walkSchemaNode(child, [...contextStack, 'setting_item'], callbacks);
                continue;
            }

            if (parentContext === 'blocks_list') {
                walkSchemaNode(child, [...contextStack, 'block_item'], callbacks);
                continue;
            }

            if (parentContext === 'presets_list') {
                walkSchemaNode(child, [...contextStack, 'preset_item'], callbacks);
                continue;
            }

            if (parentContext === 'preset_blocks_list') {
                walkSchemaNode(child, [...contextStack, 'preset_block_item'], callbacks);
                continue;
            }

            if (parentContext === 'section_default_blocks_list') {
                walkSchemaNode(child, [...contextStack, 'section_default_block_item'], callbacks);
                continue;
            }

            if (parentContext === 'options_list') {
                walkSchemaNode(child, [...contextStack, 'option_item'], callbacks);
                continue;
            }

            walkSchemaNode(child, contextStack, callbacks);
        }

        return;
    }

    if (node.type !== 'object') {
        return;
    }

    const props = buildPropertyMap(node);
    const context = getSchemaContextKind(contextStack);

    if (INSTANCE_SETTINGS_CONTEXTS.has(context)) {
        for (const [settingId, valueNode] of props) {
            callbacks.onInstanceSettingValue?.({
                contextStack,
                settingId,
                valueNode,
            });
        }
        return;
    }

    for (const [property, valueNode] of props) {
        if (property === 'default' && valueNode.type === 'object' && context === 'section_root') {
            walkSchemaNode(valueNode, [...contextStack, 'section_default'], callbacks);
            continue;
        }

        if (property === 'settings' && valueNode.type === 'array') {
            walkSchemaNode(valueNode, [...contextStack, 'settings_list'], callbacks);
            continue;
        }

        if (property === 'settings' && valueNode.type === 'object') {
            if (context === 'preset_item' || context === 'preset_block_item') {
                const nextContext =
                    context === 'preset_block_item'
                        ? 'preset_block_settings'
                        : 'preset_settings';
                walkSchemaNode(valueNode, [...contextStack, nextContext], callbacks);
                continue;
            }

            if (context === 'section_default' || context === 'section_default_block_item') {
                const nextContext =
                    context === 'section_default_block_item'
                        ? 'section_default_block_settings'
                        : 'section_default_settings';
                walkSchemaNode(valueNode, [...contextStack, nextContext], callbacks);
                continue;
            }
        }

        if (property === 'blocks' && valueNode.type === 'array') {
            let nextContext = 'blocks_list';

            if (context === 'preset_item') {
                nextContext = 'preset_blocks_list';
            } else if (context === 'section_default') {
                nextContext = 'section_default_blocks_list';
            }

            walkSchemaNode(valueNode, [...contextStack, nextContext], callbacks);
            continue;
        }

        if (property === 'presets' && valueNode.type === 'array') {
            walkSchemaNode(valueNode, [...contextStack, 'presets_list'], callbacks);
            continue;
        }

        if (property === 'options' && valueNode.type === 'array') {
            walkSchemaNode(valueNode, [...contextStack, 'options_list'], callbacks);
            continue;
        }

        callbacks.onSchemaProperty?.({
            contextStack,
            property,
            valueNode,
            props,
        });

        walkSchemaNode(valueNode, contextStack, callbacks);
    }
}

async function readText(file) {
    return fs.readFile(path.join(ROOT, file), 'utf8');
}

async function fileExists(file) {
    try {
        await fs.access(path.join(ROOT, file));
        return true;
    } catch {
        return false;
    }
}

async function loadLocaleKeys(file) {
    if (!(await fileExists(file))) {
        report(file, 1, 'Locale file is missing.');
        return new Set();
    }

    const text = await readText(file);
    const tree = parseTree(text, undefined, { allowTrailingComma: false });

    if (!tree) {
        report(file, 1, 'Locale JSON could not be parsed.');
        return new Set();
    }

    return flattenLocaleKeys(tree);
}

async function checkDuplicateJsonKeys() {
    const files = await fg(LOCALE_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });

    for (const file of files.map(formatPath)) {
        const text = await readText(file);
        const stack = [];

        visit(text, {
            onObjectBegin() {
                stack.push(new Map());
            },
            onObjectProperty(property, offset) {
                const current = stack.at(-1);
                if (!current) return;

                if (current.has(property)) {
                    report(
                        file,
                        toPos(text, offset),
                        `Duplicate translation key "${property}" in the same object.`,
                    );
                }

                current.set(property, true);
            },
            onObjectEnd() {
                stack.pop();
            },
            onError(error, offset) {
                report(file, toPos(text, offset), `Invalid JSON syntax (${error}).`);
            },
        });
    }
}

async function checkLiquidTranslationKeys(storefrontKeys) {
    const files = await fg(LIQUID_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });

    for (const file of files.map(formatPath)) {
        const text = await readText(file);
        const { ast, error: parseError } = parseLiquidAst(text);

        if (parseError) {
            report(file, parseError.line, `Liquid parser failed: ${parseError.message}`);
            continue;
        }

        walk(ast, (node) => {
            if (node.type !== 'LiquidVariableOutput') return;

            const markup = node.markup;
            if (!markup || typeof markup !== 'object') return;

            const hasTFilter =
                Array.isArray(markup.filters) &&
                markup.filters.some((filter) => filter.name === 't');
            if (!hasTFilter) return;

            const expr = markup.expression;
            if (!expr || expr.type !== 'String') return;

            const key = expr.value;
            if (!key) return;

            if (!storefrontKeys.has(key)) {
                report(
                    file,
                    toPos(text, node.position.start),
                    `Missing storefront locale key "${key}".`,
                );
            }
        });
    }
}

async function checkSchemaTranslationKeys(schemaKeys) {
    const files = await fg(SCHEMA_KEY_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });

    for (const file of files.map(formatPath)) {
        const text = await readText(file);

        for (const match of text.matchAll(SCHEMA_KEY_RE)) {
            const key = match[1];

            if (!schemaKeys.has(key)) {
                report(file, toPos(text, match.index ?? 0), `Missing schema locale key "${key}".`);
            }
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

function inspectSchemaProperty({ file, fullText, blockOffset, contextStack, property, valueNode, props }) {
    const value = getNodeValue(valueNode);

    if (typeof value !== 'string') {
        return;
    }

    if (shouldRequireSchemaTranslation(contextStack, property, props)) {
        if (value.startsWith('t:')) {
            return;
        }

        if (isNonVisibleSchemaUnit(property, value)) {
            return;
        }

        if (shouldSkipSchemaDefault(property, value, props)) {
            return;
        }

        if (!containsUserVisibleText(value)) {
            return;
        }

        report(
            file,
            toPos(fullText, blockOffset + valueNode.offset),
            `Hardcoded schema text "${value}" should use a t: locale key.`,
        );
    }
}

function inspectInstanceSettingValue({ file, fullText, blockOffset, settingId, valueNode }) {
    const value = getNodeValue(valueNode);

    if (typeof value !== 'string' || !value.startsWith('t:')) {
        return;
    }

    report(
        file,
        toPos(fullText, blockOffset + valueNode.offset),
        `Instance setting "${settingId}" must not use a t: locale key; preset and default values are literal instance data.`,
    );
}

async function checkHardcodedSchemaText() {
    const files = await fg(SCHEMA_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });

    for (const file of files.map(formatPath)) {
        const fullText = await readText(file);
        const blocks =
            file === 'config/settings_schema.json'
                ? [{ json: fullText, offset: 0 }]
                : getSchemaBlocks(fullText);

        for (const block of blocks) {
            const tree = parseTree(block.json);
            if (!tree) continue;

            const rootContext =
                file === 'config/settings_schema.json' ? 'theme_settings_root' : 'section_root';

            walkSchemaNode(tree, [rootContext], {
                onSchemaProperty: (payload) =>
                    inspectSchemaProperty({
                        file,
                        fullText,
                        blockOffset: block.offset,
                        ...payload,
                    }),
                onInstanceSettingValue: (payload) =>
                    inspectInstanceSettingValue({
                        file,
                        fullText,
                        blockOffset: block.offset,
                        ...payload,
                    }),
            });
        }
    }
}

async function checkHardcodedLiquidText() {
    const files = await fg(LIQUID_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });

    for (const file of files.map(formatPath)) {
        const text = await readText(file);
        const { ast, error: parseError } = parseLiquidAst(text);

        if (parseError) {
            continue;
        }

        const attrRanges = [];
        const attrChecks = [];
        const parentByNode = new Map();

        walk(ast, (node, parent) => {
            if (parent) parentByNode.set(node, parent);

            const isAttr =
                node.type === 'AttrSingleQuoted' ||
                node.type === 'AttrDoubleQuoted' ||
                node.type === 'AttrUnquoted' ||
                node.type === 'AttrEmpty';
            if (!isAttr) return;

            attrRanges.push([node.position.start, node.position.end]);

            const attrName = (node.name || []).map((part) => part.value || '').join('');
            if (!USER_VISIBLE_ATTRS.has(attrName)) return;

            for (const valueNode of node.value || []) {
                if (valueNode.type !== 'TextNode') continue;

                const literal = valueNode.value.trim();
                if (!literal || !containsUserVisibleText(literal)) continue;

                attrChecks.push({
                    line: toPos(text, valueNode.position.start),
                    message: `Hardcoded ${attrName}="${literal}" should use the | t filter.`,
                });
            }
        });

        for (const { line, message } of attrChecks) {
            report(file, line, message);
        }

        function isInsideAttribute(offset) {
            for (const [start, end] of attrRanges) {
                if (offset >= start && offset < end) return true;
            }
            return false;
        }

        function isVisibleHtmlText(node) {
            const visibleFlowTags = new Set(['if', 'unless', 'case', 'for', 'tablerow']);
            let ancestor = parentByNode.get(node);

            while (ancestor) {
                const isAttribute =
                    ancestor.type === 'AttrSingleQuoted' ||
                    ancestor.type === 'AttrDoubleQuoted' ||
                    ancestor.type === 'AttrUnquoted' ||
                    ancestor.type === 'AttrEmpty';
                if (isAttribute) return false;
                if (ancestor.type === 'HtmlRawNode' || ancestor.type === 'LiquidRawTag') {
                    return false;
                }
                if (
                    ancestor.type === 'LiquidTag' &&
                    !visibleFlowTags.has(String(ancestor.name || ''))
                ) {
                    return false;
                }
                if (ancestor.type === 'HtmlElement') return true;

                ancestor = parentByNode.get(ancestor);
            }

            return false;
        }

        walk(ast, (node, parent) => {
            if (node.type !== 'TextNode') return;
            if (!parent) return;
            if (isInsideAttribute(node.position.start)) return;
            if (!isVisibleHtmlText(node)) return;

            if (Array.isArray(parent.name) && parent.name[0] === node) {
                return;
            }

            const literal = node.value.trim();
            if (!literal || !containsUserVisibleText(literal)) return;

            report(
                file,
                toPos(text, node.position.start),
                `Hardcoded visible text "${literal}" should use the | t filter.`,
            );
        });
    }
}

async function main() {
    await checkDuplicateJsonKeys();

    const [storefrontKeys, schemaKeys] = await Promise.all([
        loadLocaleKeys(STOREFRONT_LOCALE),
        loadLocaleKeys(SCHEMA_LOCALE),
    ]);

    await Promise.all([
        checkLiquidTranslationKeys(storefrontKeys),
        checkSchemaTranslationKeys(schemaKeys),
        checkHardcodedSchemaText(),
        checkHardcodedLiquidText(),
    ]);

    if (failures.length === 0) {
        console.log('i18n lint passed.');
        return;
    }

    console.error(`i18n lint found ${failures.length} issue(s):`);
    for (const failure of failures) {
        console.error(`${failure.file}:${failure.line}: ${failure.message}`);
    }

    process.exitCode = 1;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
