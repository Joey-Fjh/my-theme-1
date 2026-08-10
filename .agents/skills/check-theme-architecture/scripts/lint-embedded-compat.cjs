#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const process = require('node:process');
const { ESLint } = require('eslint');
const fg = require('fast-glob');

const ROOT = process.cwd();
const LIQUID_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'blocks/**/*.liquid',
    'templates/**/*.liquid',
];

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
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

function syntheticAssetPath(file, index, extension) {
    const safeName = file.replaceAll(/[^\w.-]/g, '-');
    return path.join(ROOT, 'assets', `__compat-${safeName}-${index}.${extension}`);
}

async function main() {
    const stylelint = (await import('stylelint')).default;
    const eslint = new ESLint({
        cwd: ROOT,
        overrideConfigFile: path.join(ROOT, 'eslint.config.cjs'),
    });
    const issues = [];
    let stylesheetCount = 0;
    let javascriptCount = 0;

    const files = await fg(LIQUID_GLOBS, { cwd: ROOT, onlyFiles: true });

    for (const file of files) {
        const normalizedFile = file.replaceAll('\\', '/');
        const text = await fs.readFile(path.join(ROOT, file), 'utf8');
        const stylesheetBlocks = extractBlocks(text, 'stylesheet');
        const javascriptBlocks = extractBlocks(text, 'javascript');

        for (const [index, block] of stylesheetBlocks.entries()) {
            stylesheetCount += 1;
            const result = await stylelint.lint({
                code: block.code,
                codeFilename: syntheticAssetPath(normalizedFile, index, 'css'),
                configFile: path.join(ROOT, 'stylelint.config.cjs'),
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
            const results = await eslint.lintText(block.code, {
                filePath: syntheticAssetPath(normalizedFile, index, 'js'),
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

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
