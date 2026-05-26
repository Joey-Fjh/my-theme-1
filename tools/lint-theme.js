#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');

const ROOT = process.cwd();

const LIQUID_GLOBS = ['layout/**/*.liquid', 'sections/**/*.liquid', 'snippets/**/*.liquid'];
const SCHEMA_GLOBS = ['sections/**/*.liquid', 'blocks/**/*.liquid', 'config/settings_schema.json'];

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

async function checkLiquidArchitecture() {
    const assignRe = /{%-?\s*(assign|capture)\s+([a-zA-Z_][\w]*)\b/g;
    const inlineScriptRe = /<script\b(?![^>]*\bsrc=)(?![^>]*\btype="application\/(?:ld\+json|json)")[\s\S]*?<\/script>/gi;
    const styleTagRe = /<style\b[\s\S]*?<\/style>/gi;
    const rawCartFetchRe = /\bfetch\s*\(\s*['"]\/cart(?:\.js|\/(?:add|change|clear|update)\.js)/g;
    const domListenerRe = /\b(?:document|window)\.addEventListener\s*\(/g;
    const hardcodedColorUtilityRe = /\b(?:text|bg|border)-\[(?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\]/g;
    const headingTextSizeRe =
        /<h[1-6]\b[^>]*class=["'][^"']*\b(?:pc:|max-pc:)?text-(?:xs|sm|base|lg|xl|[2-9]xl)\b/gi;
    const nonHeadingHeadingClassRe =
        /<(?!h[1-6]\b)([a-z][\w:-]*)\b[^>]*class=["'][^"']*\b(?:hxxxl|hxxl|hxl|h0|h[1-6])\b/gi;
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

        for (const match of text.matchAll(inlineScriptRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'Use {% javascript %} with Components.register(), not inline <script>.',
            );
        }

        for (const match of text.matchAll(styleTagRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'Do not use <style> tags in Liquid templates.',
            );
        }

        for (const match of text.matchAll(rawCartFetchRe)) {
            report(
                file,
                lineAt(text, match.index ?? 0),
                'Cart requests must go through $store.cart.',
            );
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
                `Do not apply heading class to <${match[1]}>.`,
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

async function main() {
    await Promise.all([checkSchemaIds(), checkLiquidArchitecture()]);

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
