#!/usr/bin/env node
// Fails when durable docs cite a repository path that no longer exists.
// Usage: node .agents/tools/lint-doc-paths.mjs [--root <dir>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const DOC_GLOBS = [
    'AGENTS.md',
    'README.md',
    'docs/project.md',
    'docs/references/**/*.md',
    '.agents/roles/*.md',
    '.agents/skills/check-*/SKILL.md',
];
const TOP_LEVEL_DIRS = [
    'assets',
    'blocks',
    'config',
    'docs',
    'layout',
    'locales',
    'sections',
    'snippets',
    'tailwind',
    'templates',
    '.agents',
    '.github',
];
const IGNORE_MARKER = '<!-- doc-paths: ignore -->';
const PATH_RE = new RegExp(
    '`((?:' + TOP_LEVEL_DIRS.map((dir) => dir.replace('.', '\\.')).join('|') + ')/[^`\\s]+)`',
    'g',
);

function parseRoot(argv) {
    const index = argv.indexOf('--root');
    if (index !== -1 && argv[index + 1]) {
        return path.resolve(argv[index + 1]);
    }
    return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
}

function pathExists(root, cited) {
    // Trailing punctuation inside backticks is never part of a path.
    const clean = cited.replace(/[.,;:]+$/, '');
    if (fg.isDynamicPattern(clean)) {
        return fg.sync(clean, { cwd: root, dot: true, onlyFiles: true }).length > 0;
    }
    return fs.existsSync(path.join(root, clean));
}

export function lintDocPaths(root) {
    const failures = [];
    const docs = fg.sync(DOC_GLOBS, { cwd: root, dot: true, onlyFiles: true });

    for (const doc of docs) {
        const lines = fs.readFileSync(path.join(root, doc), 'utf8').split(/\r?\n/);
        lines.forEach((line, index) => {
            if (line.includes(IGNORE_MARKER)) {
                return;
            }
            for (const match of line.matchAll(PATH_RE)) {
                if (!pathExists(root, match[1])) {
                    failures.push(`${doc}:${index + 1}: cited path does not exist: ${match[1]}`);
                }
            }
        });
    }

    return failures;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
    const failures = lintDocPaths(parseRoot(process.argv));
    if (failures.length > 0) {
        console.error(failures.join('\n'));
        console.error(
            `\n${failures.length} documented path(s) are missing. Update the doc, or mark an intentional mention of a removed file with ${IGNORE_MARKER}.`,
        );
        process.exit(1);
    }
    console.log('Doc path lint passed.');
}
