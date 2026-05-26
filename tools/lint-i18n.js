#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const fg = require('fast-glob');
const { toLiquidHtmlAST } = require('@shopify/liquid-html-parser');
const { parseTree, visit, getNodeValue } = require('jsonc-parser');

const ROOT = process.cwd();

const STOREFRONT_LOCALE = 'locales/en.default.json';
const SCHEMA_LOCALE = 'locales/en.default.schema.json';

const LIQUID_GLOBS = ['layout/**/*.liquid', 'sections/**/*.liquid', 'snippets/**/*.liquid'];
const SCHEMA_GLOBS = ['sections/**/*.liquid', 'blocks/**/*.liquid', 'config/settings_schema.json'];
const LOCALE_GLOBS = ['locales/**/*.json'];

const USER_VISIBLE_ATTRIBUTES = ['aria-label', 'alt', 'placeholder', 'title', 'label'];

const ENGLISH_TEXT_RE = /\b[A-Za-z][A-Za-z0-9'.,:;!?&()[\]\/+\-\s]{2,}\b/;
const TRANSLATION_FILTER_RE = /['"]([a-z0-9_.-]+)['"]\s*\|\s*t\b/g;
const SCHEMA_KEY_RE = /"t:([a-z0-9_.-]+)"/g;

const ALLOWED_TEXT_RE = [
    /^\s*$/,
    /^[A-Z0-9_-]+$/,
    /^https?:\/\//,
    /^mailto:/,
    /^tel:/,
    /^#[\w-]+$/,
    /^\{\{.*\}\}$/,
    /^\{%.*%\}$/,
];

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

function isAllowedLiteral(value) {
    const text = String(value).trim();

    if (text.includes('{%') || text.includes('%}') || text.includes('{{') || text.includes('}}')) {
        return true;
    }

    return ALLOWED_TEXT_RE.some((re) => re.test(text));
}

// --- schema default helpers ---------------------------------------------------

const SCHEMA_ROUTE_RE = /^\//;
const SCHEMA_ENUM_RE =
    /^(left|right|center|top|bottom|justify|inherit|auto|none|enable|disable|enabled|disabled|true|false|yes|no|show|hide|visible|hidden|always|never|inline|block|grid|flex|cover|contain|small|medium|large|day|week|month|year|related|newest|price-asc|price-desc|best-selling|manual|alphabetical|title-ascending|title-descending|created-ascending|created-descending|date|standard|compact|minimal|default|classic|modern|bold|subtle)$/;
const SCHEMA_HANDLE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SCHEMA_ICON_ID_RE = /^icon-[a-z0-9-]+$/;
const SCHEMA_COLOR_SCHEME_RE = /^(?:color-)?scheme-\d+$/;
const SCHEMA_PLACE_RE = /^place-(?:top|bottom)-(?:left|right|center)$/;
const SCHEMA_NUMERIC_RE = /^[\d.]+(?:px|%|rem|em|vh|vw)?$/;

/**
 * Returns true when a schema "default" value is a machine/config token
 * that is not merchant-facing storefront copy.
 */
function isNonVisibleSchemaDefault(value) {
    const text = String(value).trim();

    if (SCHEMA_ROUTE_RE.test(text)) return true;
    if (SCHEMA_COLOR_SCHEME_RE.test(text)) return true;
    if (SCHEMA_ICON_ID_RE.test(text)) return true;
    if (SCHEMA_PLACE_RE.test(text)) return true;
    if (SCHEMA_ENUM_RE.test(text)) return true;
    if (SCHEMA_NUMERIC_RE.test(text)) return true;
    if (SCHEMA_HANDLE_RE.test(text)) return true;

    return false;
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
        validateLiquidSyntax(file, text);

        for (const match of text.matchAll(TRANSLATION_FILTER_RE)) {
            const key = match[1];

            if (!storefrontKeys.has(key)) {
                report(
                    file,
                    toPos(text, match.index ?? 0),
                    `Missing storefront locale key "${key}".`,
                );
            }
        }
    }
}

function validateLiquidSyntax(file, text) {
    try {
        toLiquidHtmlAST(text);
    } catch (error) {
        report(file, error?.loc?.start?.line ?? 1, `Liquid parser failed: ${error.message}`);
    }
}

async function checkSchemaTranslationKeys(schemaKeys) {
    const files = await fg(SCHEMA_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });

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

async function checkHardcodedSchemaText() {
    const files = await fg(SCHEMA_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });
    const translatableFields = new Set([
        'category',
        'content',
        'default',
        'group',
        'info',
        'label',
        'name',
        'placeholder',
        'unit',
    ]);

    for (const file of files.map(formatPath)) {
        const fullText = await readText(file);
        const blocks =
            file === 'config/settings_schema.json'
                ? [{ json: fullText, offset: 0 }]
                : getSchemaBlocks(fullText);

        for (const block of blocks) {
            const tree = parseTree(block.json);
            if (!tree) continue;

            walkSchemaNode(tree, (property, valueNode, parentProps) => {
                if (!translatableFields.has(property)) return;

                const value = getNodeValue(valueNode);

                if (typeof value !== 'string') return;
                if (
                    value.startsWith('t:') ||
                    !ENGLISH_TEXT_RE.test(value) ||
                    isAllowedLiteral(value)
                )
                    return;

                // Schema "default" values that are machine/config tokens
                // (color schemes, icon IDs, alignment, enum handles, routes)
                // are not merchant-facing copy and should not be flagged.
                if (property === 'default' && isNonVisibleSchemaDefault(value)) return;

                // Font family defaults (e.g. "Neue Montreal") are machine values,
                // not merchant-facing text. Detect via sibling "id" containing "font".
                if (property === 'default' && parentProps) {
                    const idNode = parentProps.get('id');
                    const idValue = idNode ? getNodeValue(idNode) : '';
                    if (typeof idValue === 'string' && idValue.includes('font')) return;
                }

                // Metafield key defaults (e.g. "custom.ingredients") are machine paths.
                // Detect via sibling "id" being "metafield_key" or "metafield_namespace".
                if (property === 'default' && parentProps) {
                    const idNode = parentProps.get('id');
                    const idValue = idNode ? getNodeValue(idNode) : '';
                    if (
                        typeof idValue === 'string' &&
                        (idValue === 'metafield_key' || idValue === 'metafield_namespace')
                    )
                        return;
                }

                report(
                    file,
                    toPos(fullText, block.offset + valueNode.offset),
                    `Hardcoded schema text "${value}" should use a t: locale key.`,
                );
            });
        }
    }
}

function walkSchemaNode(node, onProperty, parentProperties) {
    if (!node) return;

    if (node.type === 'object') {
        const props = new Map();
        for (const propertyNode of node.children ?? []) {
            const keyNode = propertyNode.children?.[0];
            const valueNode = propertyNode.children?.[1];
            const key = getNodeValue(keyNode);
            if (typeof key === 'string' && valueNode) {
                props.set(key, valueNode);
            }
        }

        for (const [property, valueNode] of props) {
            onProperty(property, valueNode, props);
            walkSchemaNode(valueNode, onProperty, props);
        }

        return;
    }

    if (node.type === 'array') {
        for (const child of node.children ?? []) {
            walkSchemaNode(child, onProperty, parentProperties);
        }
    }
}

async function checkHardcodedLiquidText() {
    const files = await fg(LIQUID_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });
    const tagTextRe = />\s*([^<>][^<>]*[A-Za-z][^<>]*)\s*</g;
    const attrRe = new RegExp(
        `(?<!:)\\b(${USER_VISIBLE_ATTRIBUTES.join('|')})=(["'])([^"'{}%]*[A-Za-z][^"'{}%]*)\\2`,
        'g',
    );

    for (const file of files.map(formatPath)) {
        const text = await readText(file);

        for (const match of text.matchAll(tagTextRe)) {
            const literal = match[1].trim();
            if (!ENGLISH_TEXT_RE.test(literal) || isAllowedLiteral(literal)) continue;
            if (literal.includes('{%') || literal.includes('%}')) continue;

            report(
                file,
                toPos(text, (match.index ?? 0) + match[0].indexOf(match[1])),
                `Hardcoded visible text "${literal}" should use the | t filter.`,
            );
        }

        for (const match of text.matchAll(attrRe)) {
            const attr = match[1];
            const literal = match[3].trim();
            if (!ENGLISH_TEXT_RE.test(literal) || isAllowedLiteral(literal)) continue;

            report(
                file,
                toPos(text, match.index ?? 0),
                `Hardcoded ${attr}="${literal}" should use the | t filter.`,
            );
        }
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
