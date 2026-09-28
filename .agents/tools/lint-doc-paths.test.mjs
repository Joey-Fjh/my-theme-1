import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { lintDocPaths } from './lint-doc-paths.mjs';

function withTempRepo(files, run) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-paths-'));
    try {
        for (const [relative, content] of Object.entries(files)) {
            const target = path.join(root, relative);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, content, 'utf8');
        }
        run(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

test('missing path fails with file and line', () => {
    withTempRepo({ 'AGENTS.md': 'intro\nSee `snippets/gone.liquid`.\n' }, (root) => {
        const failures = lintDocPaths(root);
        assert.equal(failures.length, 1);
        assert.match(failures[0], /^AGENTS\.md:2: cited path does not exist: snippets\/gone\.liquid$/);
    });
});

test('existing path passes', () => {
    withTempRepo(
        {
            'docs/references/a.md': 'Uses `snippets/image.liquid`, then `assets/base.js`.\n',
            'snippets/image.liquid': '',
            'assets/base.js': '',
        },
        (root) => {
            assert.deepEqual(lintDocPaths(root), []);
        },
    );
});

test('glob with no match fails and glob with a match passes', () => {
    withTempRepo(
        {
            'README.md': 'Scans `sections/*.json` and `blocks/*.liquid`.\n',
            'sections/header-group.json': '{}',
        },
        (root) => {
            const failures = lintDocPaths(root);
            assert.equal(failures.length, 1);
            assert.match(failures[0], /blocks\/\*\.liquid/);
        },
    );
});

test('glob that matches only an empty directory fails', () => {
    withTempRepo({ 'README.md': 'Scans `sections/**`.\n' }, (root) => {
        fs.mkdirSync(path.join(root, 'sections', 'empty'), { recursive: true });
        const failures = lintDocPaths(root);
        assert.equal(failures.length, 1);
        assert.match(failures[0], /sections\/\*\*/);
    });
});

test('ignored line passes', () => {
    withTempRepo(
        { 'docs/references/a.md': '- Do not restore `snippets/old.liquid`. <!-- doc-paths: ignore -->\n' },
        (root) => {
            assert.deepEqual(lintDocPaths(root), []);
        },
    );
});

test('docs/agent records are not scanned', () => {
    withTempRepo({ 'docs/agent/board.md': 'Removed `snippets/old.liquid`.\n' }, (root) => {
        assert.deepEqual(lintDocPaths(root), []);
    });
});

test('non-repository paths are ignored', () => {
    withTempRepo({ 'AGENTS.md': 'Run `npm.cmd run lint` and read `node_modules/x`.\n' }, (root) => {
        assert.deepEqual(lintDocPaths(root), []);
    });
});
