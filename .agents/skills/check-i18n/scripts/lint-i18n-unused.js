#!/usr/bin/env node
// Fails when a locale key is defined but no theme file references it.
// Usage: node lint-i18n-unused.js (run from the theme root)

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');

const ROOT = process.cwd();

const STOREFRONT_LOCALE = 'locales/en.default.json';
const SCHEMA_LOCALE = 'locales/en.default.schema.json';

const STOREFRONT_SOURCE_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'blocks/**/*.liquid',
    'templates/**/*.liquid',
];
const SCHEMA_SOURCE_GLOBS = [
    'sections/**/*.liquid',
    'blocks/**/*.liquid',
    'config/settings_schema.json',
    'sections/*.json',
];

// Shopify pluralization leaves; the code references the parent key with a count.
const PLURAL_LEAVES = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

// Keys kept on purpose although no file references them yet.
const ALLOWLISTED_PREFIXES = [
    // Gift card recipient form copy, kept for a theme that builds the form (docs/project.md Status).
    'recipient.form.',
];

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r?\n/).length;
}

function collectLeaves(node, text, prefix, leaves) {
    if (!node || node.type !== 'object') return leaves;

    for (const property of node.children ?? []) {
        const [keyNode, valueNode] = property.children ?? [];
        const key = getNodeValue(keyNode);
        const next = prefix ? `${prefix}.${key}` : key;

        if (valueNode?.type === 'object') {
            collectLeaves(valueNode, text, next, leaves);
        } else {
            leaves.push({ key: next, line: lineAt(text, keyNode.offset) });
        }
    }

    return leaves;
}

function readLocaleLeaves(file) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) return [];

    const text = fs.readFileSync(fullPath, 'utf8');
    return collectLeaves(parseTree(text), text, '', []);
}

function readSources(globs) {
    return fg
        .sync(globs, { cwd: ROOT, onlyFiles: true })
        .map((file) => fs.readFileSync(path.join(ROOT, file), 'utf8'))
        .join('\n');
}

function isAllowlisted(key) {
    return ALLOWLISTED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function candidateKeys(key) {
    const parts = key.split('.');
    const last = parts[parts.length - 1];
    return PLURAL_LEAVES.has(last) && parts.length > 1 ? [key, parts.slice(0, -1).join('.')] : [key];
}

function findUnused(file, isUsed) {
    return readLocaleLeaves(file)
        .filter(({ key }) => !isAllowlisted(key))
        .filter(({ key }) => !candidateKeys(key).some(isUsed))
        .map(({ key, line }) => `${file}:${line}: Locale key "${key}" is not referenced by any theme file.`);
}

function lintUnusedLocaleKeys() {
    const storefrontSource = readSources(STOREFRONT_SOURCE_GLOBS);
    const schemaSource = readSources(SCHEMA_SOURCE_GLOBS);

    return [
        ...findUnused(
            STOREFRONT_LOCALE,
            (key) => storefrontSource.includes(`'${key}'`) || storefrontSource.includes(`"${key}"`),
        ),
        ...findUnused(SCHEMA_LOCALE, (key) => schemaSource.includes(`"t:${key}"`)),
    ];
}

const failures = lintUnusedLocaleKeys();

if (failures.length > 0) {
    console.error(failures.join('\n'));
    console.error(
        `\n${failures.length} unused locale key(s). Delete them, or add a prefix with a reason to ALLOWLISTED_PREFIXES.`,
    );
    process.exitCode = 1;
} else {
    console.log('Unused locale key lint passed.');
}
