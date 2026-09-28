#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const fg = require('fast-glob');
const { toLiquidHtmlAST, walk } = require('@shopify/liquid-html-parser');

const LIQUID_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'blocks/**/*.liquid',
    'templates/**/*.liquid',
];

function parseRootArg(argv) {
    const index = argv.indexOf('--root');

    if (index !== -1 && argv[index + 1]) {
        return path.resolve(argv[index + 1]);
    }

    return process.cwd();
}

function lineAt(source, offset) {
    return source.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function formatPath(file) {
    return file.replaceAll('\\', '/');
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

    if (/\|\s*[a-zA-Z_][\w-]*\s*:\s*$/.test(trimmed)) {
        return parseVariableMarkup(`${trimmed} nil`);
    }

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

async function runLiquidSyntaxLint(root) {
    const files = await fg(LIQUID_GLOBS, { cwd: root, dot: false, onlyFiles: true });
    const failures = [];

    for (const file of files.map(formatPath)) {
        const source = await fs.readFile(path.join(root, file), 'utf8');

        for (const failure of getLiquidSyntaxFailures(source)) {
            failures.push({ file, ...failure });
        }
    }

    return failures;
}

async function main(argv = process.argv) {
    const root = parseRootArg(argv);
    const failures = await runLiquidSyntaxLint(root);

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

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

module.exports = {
    getLiquidSyntaxFailures,
    isRubyCompatibilityFallback,
    runLiquidSyntaxLint,
};
