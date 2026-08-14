#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const fg = require('fast-glob');
const { toLiquidHtmlAST, walk } = require('@shopify/liquid-html-parser');

const ROOT = process.cwd();
const LIQUID_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'blocks/**/*.liquid',
    'templates/**/*.liquid',
];

function lineAt(source, offset) {
    return source.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function parseVariableMarkup(markup) {
    const probe = `{{ ${markup} }}`;
    const ast = toLiquidHtmlAST(probe);
    let parsed = false;

    walk(ast, (node) => {
        if (node.type === 'LiquidVariableOutput' && typeof node.markup !== 'string') {
            parsed = true;
        }
    });

    return parsed;
}

function isRubyCompatibilityFallback(markup) {
    const trimmed = markup.trim();
    if (!trimmed) return true;

    // Ruby Liquid accepts an empty first filter argument, for example:
    // {{ product.title | append: }}
    if (/\|\s*[a-zA-Z_][\w-]*\s*:\s*$/.test(trimmed)) {
        return parseVariableMarkup(`${trimmed} nil`);
    }

    // Ruby Liquid also accepts a trailing comma after a real filter argument.
    if (/,(?=\s*(?:\||$))/.test(trimmed)) {
        const withoutTrailingCommas = trimmed.replace(/,(?=\s*(?:\||$))/g, '');
        return parseVariableMarkup(withoutTrailingCommas);
    }

    return false;
}

function getLiquidSyntaxFailures(source) {
    const failures = [];
    let ast;

    try {
        ast = toLiquidHtmlAST(source);
    } catch (error) {
        failures.push({
            line: error.loc?.start?.line ?? 1,
            message: `Liquid parse error: ${error.message}`,
        });
        return failures;
    }

    walk(ast, (node) => {
        if (node.type !== 'LiquidVariableOutput' || typeof node.markup !== 'string') return;
        if (isRubyCompatibilityFallback(node.markup)) return;

        failures.push({
            line: lineAt(source, node.position.start),
            message:
                'Liquid variable output was not fully parsed. Filter argument names must be unquoted identifiers.',
        });
    });

    return failures;
}

function runSelfTest() {
    const invalid = "{{ media | model_viewer_tag: 'camera-controls': true }}";
    const valid = '{{ media | model_viewer_tag: camera-controls: true }}';

    if (getLiquidSyntaxFailures(invalid).length !== 1) {
        throw new Error('Liquid syntax lint self-test failed to reject a quoted argument name.');
    }

    if (getLiquidSyntaxFailures(valid).length !== 0) {
        throw new Error('Liquid syntax lint self-test rejected a valid hyphenated argument name.');
    }
}

async function main() {
    runSelfTest();

    const files = await fg(LIQUID_GLOBS, { cwd: ROOT, dot: false, onlyFiles: true });
    const failures = [];

    for (const file of files) {
        const source = await fs.readFile(path.join(ROOT, file), 'utf8');
        for (const failure of getLiquidSyntaxFailures(source)) {
            failures.push({ file: file.replaceAll('\\', '/'), ...failure });
        }
    }

    if (failures.length === 0) {
        console.log('Liquid syntax lint passed.');
        return;
    }

    console.error(`Liquid syntax lint found ${failures.length} issue(s):`);
    for (const failure of failures) {
        console.error(`${failure.file}:${failure.line}: ${failure.message}`);
    }
    process.exitCode = 1;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

