#!/usr/bin/env node
/**
 * Acceptance check 7: ensure .shopifyignore patterns do not exclude files
 * under Shopify theme directories (assets, blocks, config, layout, locales,
 * sections, snippets, templates).
 *
 * Usage: node docs/migration/step1/check-shopifyignore.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const shopifyignorePath = path.join(root, '.shopifyignore');

const THEME_DIRS = [
    'assets',
    'blocks',
    'config',
    'layout',
    'locales',
    'sections',
    'snippets',
    'templates',
];

function listFiles(dir) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) return [];
    const out = [];
    for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
        const rel = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            out.push(...listFiles(rel));
        } else {
            out.push(rel);
        }
    }
    return out;
}

function patternToRegExp(line) {
    let p = line.trim();
    if (!p || p.startsWith('#')) return null;
    p = p.replace(/\./g, '\\.');
    p = p.replace(/\*\*/g, '<<<GLOBSTAR>>>');
    p = p.replace(/\*/g, '[^/]*');
    p = p.replace(/<<<GLOBSTAR>>>/g, '.*');
    if (p.endsWith('/')) {
        p = `${p}.*`;
    }
    return new RegExp(`^${p}$`);
}

const patterns = fs
    .readFileSync(shopifyignorePath, 'utf8')
    .split(/\r?\n/)
    .map(patternToRegExp)
    .filter(Boolean);

const themeFiles = THEME_DIRS.flatMap(listFiles);
const hits = [];

for (const file of themeFiles) {
    for (const re of patterns) {
        if (re.test(file)) {
            hits.push({ file, pattern: re.source });
        }
    }
}

if (hits.length === 0) {
    console.log(
        `OK: no .shopifyignore pattern matches ${themeFiles.length} tracked theme-directory files.`,
    );
    process.exit(0);
}

console.error(`FAIL: ${hits.length} theme file(s) matched .shopifyignore:`);
for (const h of hits) {
    console.error(`  ${h.file}  (pattern /${h.pattern}/)`);
}
process.exit(1);
