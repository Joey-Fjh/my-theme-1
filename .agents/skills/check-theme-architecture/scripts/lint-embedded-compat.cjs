#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const { ESLint } = require('eslint');
const fg = require('fast-glob');

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

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function encodeLiquidPath(file) {
    return formatPath(file)
        .replace(/\.liquid$/i, '-liquid')
        .replace(/[^\w.-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function extractBlocks(text, tagName) {
    const blocks = [];
    const pattern = new RegExp(
        `{%-?\\s*${tagName}\\s*-?%}([\\s\\S]*?){%-?\\s*end${tagName}\\s*-?%}`,
        'g',
    );

    for (const match of text.matchAll(pattern)) {
        const code = match[1];
        const offset = (match.index ?? 0) + match[0].indexOf(code);
        blocks.push({ code, offset });
    }

    return blocks;
}

function virtualEmbeddedJsPath(liquidFile, index) {
    return `assets/__embedded-${encodeLiquidPath(liquidFile)}-${index}.js`;
}

function virtualEmbeddedCssPath(liquidFile, index) {
    const normalized = formatPath(liquidFile);
    const directory = path.posix.dirname(normalized);
    return `${directory}/__embedded-${encodeLiquidPath(normalized)}-${index}.css`;
}

async function runEmbeddedCompatLint(root) {
    const stylelint = (await import('stylelint')).default;
    const eslint = new ESLint({
        cwd: root,
        overrideConfigFile: path.join(root, 'eslint.config.cjs'),
    });
    const issues = [];
    let stylesheetCount = 0;
    let javascriptCount = 0;
    const files = await fg(LIQUID_GLOBS, { cwd: root, onlyFiles: true });

    for (const file of files) {
        const normalizedFile = formatPath(file);
        const text = await fs.readFile(path.join(root, file), 'utf8');
        const stylesheetBlocks = extractBlocks(text, 'stylesheet');
        const javascriptBlocks = extractBlocks(text, 'javascript');

        for (const [index, block] of stylesheetBlocks.entries()) {
            stylesheetCount += 1;
            const result = await stylelint.lint({
                code: block.code,
                codeFilename: virtualEmbeddedCssPath(normalizedFile, index),
                configFile: path.join(root, 'stylelint.config.cjs'),
            });

            for (const warning of result.results.flatMap((entry) => entry.warnings)) {
                issues.push({
                    file: normalizedFile,
                    line: lineAt(text, block.offset) + (warning.line ?? 1) - 1,
                    message: warning.text,
                });
            }
        }

        for (const [index, block] of javascriptBlocks.entries()) {
            javascriptCount += 1;
            const virtualPath = virtualEmbeddedJsPath(normalizedFile, index);
            const results = await eslint.lintText(block.code, {
                filePath: virtualPath,
                warnIgnored: false,
            });

            for (const message of results.flatMap((entry) => entry.messages)) {
                issues.push({
                    file: normalizedFile,
                    line: lineAt(text, block.offset) + (message.line ?? 1) - 1,
                    message: `${message.message} (${message.ruleId ?? 'eslint'})`,
                });
            }
        }
    }

    return { issues, stylesheetCount, javascriptCount };
}

async function main(argv = process.argv) {
    const root = parseRootArg(argv);
    const { issues, stylesheetCount, javascriptCount } = await runEmbeddedCompatLint(root);

    if (issues.length === 0) {
        console.log(
            `Embedded compatibility lint passed (${stylesheetCount} stylesheet blocks, ${javascriptCount} javascript blocks).`,
        );
        return;
    }

    console.error(`Embedded compatibility lint found ${issues.length} issue(s):`);
    for (const issue of issues) {
        console.error(`${issue.file}:${issue.line}: ${issue.message}`);
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
    encodeLiquidPath,
    extractBlocks,
    lineAt,
    runEmbeddedCompatLint,
    virtualEmbeddedCssPath,
    virtualEmbeddedJsPath,
};
