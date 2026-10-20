import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { globToRegExp } from './hook.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const HOOK = path.join(HERE, 'hook.mjs');
const RECORD_CHECK = path.join(HERE, 'record-check.mjs');
const DATE = '2026-10-20';

function runHook(event, payload, stateDir) {
    return spawnSync(process.execPath, [HOOK, event], {
        input: JSON.stringify(payload),
        encoding: 'utf8',
        env: { ...process.env, HARNESS_STATE_DIR: stateDir },
        windowsHide: true,
    });
}

function output(result) {
    assert.equal(result.status, 0, result.stderr);
    if (!result.stdout.trim()) return null;
    return JSON.parse(result.stdout);
}

function git(root, args) {
    const result = spawnSync('git', args, {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
        env: {
            ...process.env,
            GIT_AUTHOR_DATE: '2026-10-20T12:00:00+08:00',
            GIT_COMMITTER_DATE: '2026-10-20T12:00:00+08:00',
            GIT_AUTHOR_NAME: 'test',
            GIT_AUTHOR_EMAIL: 'test@example.com',
            GIT_COMMITTER_NAME: 'test',
            GIT_COMMITTER_EMAIL: 'test@example.com',
        },
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
}

function writeFiles(root, files) {
    for (const [relative, content] of Object.entries(files)) {
        const target = path.join(root, relative);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    }
}

function records(boardBody) {
    return {
        'docs/agent/board.md': `# Board\n\nLast updated: ${DATE}\n\n## Open decisions\n\n- None.\n\n## Pending migration\n\n- **\`AGENTS.md\`:** note.\n\n## Evidence\n\n## Deferred ideas\n\n${boardBody || ''}`,
        'docs/agent/backlog.md': `# Backlog\n\nLast updated: ${DATE}\n\n## Area\n\n- Item. Source: test. Surface: none.\n`,
        'docs/agent/context.md': `# Context\n\nLast updated: ${DATE}\n\n## Batch Test\n\n**Status:** authorized.\n`,
    };
}

function initRepo(files, baseline = 100000) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-'));
    writeFiles(root, files);
    writeFiles(root, {
        '.agents/tools/harness/records.baseline.json': `${JSON.stringify({ boardWords: baseline }, null, 4)}\n`,
    });
    git(root, ['init']);
    git(root, ['add', '.']);
    git(root, ['commit', '-m', 'init']);
    return root;
}

function removeRepo(root) {
    fs.rmSync(root, { recursive: true, force: true });
}

test('prompt emits the plan pointer once per session', () => {
    const root = initRepo({
        'docs/agent/context.md': `# Context\n\nLast updated: ${DATE}\n\n## Batch Demo\n\n**Status:** authorized.\n`,
        'docs/agent/board.md': `# Board\n\nLast updated: ${DATE}\n\n## Pending migration\n`,
        'docs/agent/backlog.md': `# Backlog\n\nLast updated: ${DATE}\n\n## Area\n\n- Item. Source: test. Surface: none.\n`,
    });
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    try {
        const payload = { cwd: root, session_id: 'prompt' };
        const first = output(runHook('prompt', payload, stateDir));
        assert.match(first.hookSpecificOutput.additionalContext, /## Batch Demo/);
        assert.match(first.hookSpecificOutput.additionalContext, /\*\*Status:\*\* authorized/);
        assert.equal(output(runHook('prompt', payload, stateDir)), null);
    } finally {
        removeRepo(root);
        removeRepo(stateDir);
    }
});

test('pre asks for subagents, merchant edits, and merchant shell writes', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const root = REPO;
    try {
        const ask = (toolName, toolInput) =>
            output(
                runHook(
                    'pre',
                    { cwd: root, session_id: 'pre', tool_name: toolName, tool_input: toolInput },
                    stateDir,
                ),
            );
        assert.equal(ask('Agent', { prompt: 'look' }).hookSpecificOutput.permissionDecision, 'ask');
        for (const filePath of [
            'templates/product.json',
            'config/settings_data.json',
            'sections\\header-group.json',
        ]) {
            const result = ask('Edit', { file_path: filePath });
            assert.equal(result.hookSpecificOutput.permissionDecision, 'ask', filePath);
        }
        for (const command of [
            'echo x > templates/index.json',
            'echo x>templates/index.json',
            "sed -i 's/a/b/' config/settings_data.json",
            'shopify theme pull',
            'Set-Content templates\\index.json -Value x',
            'Remove-Item -LiteralPath templates/index.json',
            'cp /tmp/x templates/index.json',
            "node -e \"fs.writeFileSync('templates/index.json','')\"",
            'git checkout HEAD -- templates/index.json',
            'git restore templates/index.json',
        ]) {
            const result = ask('Bash', { command });
            assert.equal(result?.hookSpecificOutput.permissionDecision, 'ask', command);
        }
        for (const command of [
            'cat templates/index.json',
            'git diff templates/index.json',
            'Get-Content templates/index.json',
            'cat templates/index.json > /tmp/x',
            'cp templates/index.json /tmp/x',
            'npm run lint 2>&1',
        ]) {
            assert.equal(ask('Bash', { command }), null, command);
        }
        assert.equal(ask('Edit', { file_path: 'sections/main-product.liquid' }), null);
        const absolute = path.join(REPO, 'templates', 'index.json');
        assert.equal(
            ask('Edit', { file_path: absolute }).hookSpecificOutput.permissionDecision,
            'ask',
        );
    } finally {
        removeRepo(stateDir);
    }
});

test('post points out lint:theme once for a liquid edit', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const payload = {
        cwd: REPO,
        session_id: 'post',
        tool_name: 'Edit',
        tool_input: { file_path: 'sections/main-product.liquid', new_string: 'hello' },
    };
    try {
        const first = output(runHook('post', payload, stateDir));
        assert.match(first.hookSpecificOutput.additionalContext, /lint:theme/);
        assert.equal(output(runHook('post', payload, stateDir)), null);
    } finally {
        removeRepo(stateDir);
    }
});

test('stop is silent on an unchanged diff and blocks structural record failures', () => {
    const root = initRepo(records());
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    try {
        const payload = { cwd: root, session_id: 'stop' };
        assert.equal(output(runHook('stop', payload, stateDir)), null);
        const started = Date.now();
        assert.equal(output(runHook('stop', payload, stateDir)), null);
        assert.ok(Date.now() - started < 1000, 'unchanged stop exceeded 1s');

        // A content change inside an already-untracked directory must change the fingerprint.
        const nestedState = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
        const probe = path.join(root, 'scratch/nested/probe.txt');
        const storedFingerprint = () => {
            const [file] = fs.readdirSync(nestedState);
            return JSON.parse(fs.readFileSync(path.join(nestedState, file), 'utf8')).fingerprint;
        };
        writeFiles(root, { 'scratch/nested/probe.txt': 'one' });
        runHook('stop', { cwd: root, session_id: 'nested' }, nestedState);
        const before = storedFingerprint();
        fs.writeFileSync(probe, 'two');
        runHook('stop', { cwd: root, session_id: 'nested' }, nestedState);
        assert.notEqual(storedFingerprint(), before, 'nested untracked change was not seen');
        removeRepo(nestedState);

        // Non-ASCII paths (C-quoted by git without -z) must reach both the routes and the hash.
        const unicodeRoot = initRepo(records());
        const unicodeState = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
        try {
            const payload = { cwd: unicodeRoot, session_id: 'unicode' };
            output(runHook('stop', payload, unicodeState));
            writeFiles(unicodeRoot, { 'assets/测试.css': 'a {}' });
            const routed = output(runHook('stop', payload, unicodeState));
            assert.match(
                routed?.systemMessage || '',
                /test:layout/,
                'non-ASCII path missed its route',
            );
            fs.writeFileSync(path.join(unicodeRoot, 'assets/测试.css'), 'b {}');
            assert.notEqual(
                output(runHook('stop', payload, unicodeState)),
                null,
                'non-ASCII edit missed',
            );
        } finally {
            removeRepo(unicodeRoot);
            removeRepo(unicodeState);
        }

        const doneRoot = initRepo(records('**Done: sample\n'));
        const done = output(runHook('stop', { cwd: doneRoot, session_id: 'done' }, stateDir));
        assert.equal(done.decision, 'block');
        assert.match(done.reason, /completion record/);
        removeRepo(doneRoot);

        const backlogRoot = initRepo(records());
        fs.appendFileSync(path.join(backlogRoot, 'docs/agent/backlog.md'), '- missing labels\n');
        const backlog = output(
            runHook('stop', { cwd: backlogRoot, session_id: 'backlog' }, stateDir),
        );
        assert.equal(backlog.decision, 'block');
        assert.match(backlog.reason, /Source:/);
        removeRepo(backlogRoot);

        const loudRoot = initRepo(records('alpha '.repeat(30)), 1);
        const loud = output(runHook('stop', { cwd: loudRoot, session_id: 'loud' }, stateDir));
        assert.equal(loud.decision, undefined);
        assert.equal(
            loud.hookSpecificOutput,
            undefined,
            'a passing stop must not continue the turn',
        );
        assert.match(loud.systemMessage, /prompt:/);
        removeRepo(loudRoot);

        const activeRoot = initRepo(records('**Done: sample\n'));
        const active = runHook(
            'stop',
            { cwd: activeRoot, session_id: 'active', stop_hook_active: true },
            stateDir,
        );
        assert.equal(active.status, 0);
        assert.equal(active.stdout.trim(), '');
        assert.match(active.stderr, /completion record/);
        removeRepo(activeRoot);
    } finally {
        removeRepo(root);
        removeRepo(stateDir);
    }
});

test('malformed stdin fails open', () => {
    const result = spawnSync(process.execPath, [HOOK, 'pre'], {
        input: '{',
        encoding: 'utf8',
        windowsHide: true,
    });
    assert.equal(result.status, 0);
    assert.match(result.stderr, /harness: malformed stdin/);
});

test('routes.json matches package scripts, pointers, validation commands, and merchant paths', () => {
    const routes = JSON.parse(fs.readFileSync(path.join(HERE, 'routes.json'), 'utf8'));
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
    const agents = fs.readFileSync(path.join(REPO, 'AGENTS.md'), 'utf8');
    const validators = routes.routes.flatMap((route) => route.validators);
    for (const script of validators) {
        assert.equal(typeof pkg.scripts[script], 'string', script);
    }
    for (const route of routes.routes) {
        for (const pointer of route.pointers) {
            assert.equal(fs.existsSync(path.join(REPO, pointer)), true, pointer);
        }
    }
    const table = agents
        .split('## Validation')[1]
        .split('## ')[0]
        .split('\n')
        .filter((line) => line.startsWith('|'));
    const commands = [...table.join('\n').matchAll(/npm\.cmd run ([a-z0-9:-]+)/g)].map(
        (match) => match[1],
    );
    // Release gates and the dev server are not path-driven, so no route owes them.
    const notRouted = new Set(['lint', 'test', 'shopify:dev']);
    for (const command of commands) {
        if (notRouted.has(command)) {
            assert.equal(validators.includes(command), false, command);
            continue;
        }
        assert.equal(validators.includes(command), true, command);
    }

    // Path → validators and tier, as the AGENTS.md Validation table and Review tiers say.
    const routesFor = (file) =>
        routes.routes.filter((route) => route.paths.some((glob) => globToRegExp(glob).test(file)));
    const tierOf = (file) =>
        routesFor(file)
            .filter((route) => !route.diff)
            .reduce((best, route) => (rank[route.tier] > rank[best] ? route.tier : best), 'Ship');
    const owed = (file) => new Set(routesFor(file).flatMap((route) => route.validators));
    const rank = { Ship: 1, Show: 2, Ask: 3 };
    assert.equal(tierOf('assets/base.css'), 'Show');
    assert.equal(tierOf('tailwind/tailwind.input.css'), 'Show');
    assert.equal(tierOf('locales/en.default.json'), 'Show');
    assert.equal(tierOf('sections/main-product.liquid'), 'Ask');
    assert.equal(tierOf('assets/cart.js'), 'Ask');
    assert.equal(tierOf('package.json'), 'Ask');
    assert.ok(owed('sections/main-product.liquid').has('lint:compat'));
    assert.ok(owed('assets/base.css').has('scan:compat'));
    assert.ok(!owed('package.json').has('lint') && !owed('package.json').has('test'));
    const core = agents.split('## Core Rules')[1].split('## ')[0];
    const cited = [...core.matchAll(/^- `([^`]+)`/gm)].map((match) => match[1]);
    assert.ok(cited.length >= 3);
    for (const pathGlob of cited) {
        assert.equal(routes.merchant.includes(pathGlob), true, pathGlob);
    }
});

test('prune-baseline only lowers the stored word count', () => {
    const root = initRepo(records('short board'), 100000);
    try {
        const lowered = spawnSync(process.execPath, [RECORD_CHECK, '--prune-baseline'], {
            cwd: root,
            encoding: 'utf8',
            windowsHide: true,
        });
        assert.equal(lowered.status, 0, lowered.stdout + lowered.stderr);
        const baseline = JSON.parse(
            fs.readFileSync(path.join(root, '.agents/tools/harness/records.baseline.json'), 'utf8'),
        );
        assert.ok(baseline.boardWords < 100000);
        assert.match(lowered.stdout, /pending migration lines: 1/);

        fs.writeFileSync(
            path.join(root, '.agents/tools/harness/records.baseline.json'),
            `${JSON.stringify({ boardWords: 1 }, null, 4)}\n`,
        );
        const held = spawnSync(process.execPath, [RECORD_CHECK, '--prune-baseline'], {
            cwd: root,
            encoding: 'utf8',
            windowsHide: true,
        });
        assert.equal(held.status, 0, held.stdout);
        const still = JSON.parse(
            fs.readFileSync(path.join(root, '.agents/tools/harness/records.baseline.json'), 'utf8'),
        );
        assert.equal(still.boardWords, 1);
    } finally {
        removeRepo(root);
    }
});
