import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
    decodeInput,
    globToRegExp,
    parseInput,
    prePushFailures,
    resolveRoot,
    runsGitPush,
    stylesheetOnly,
} from './core.mjs';
import { patchEdits } from '../../../.codex/codex-hook.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const HOOK = path.join(REPO, '.claude', 'claude-hook.mjs');
const RECORD_CHECK = path.join(HERE, 'record-check.mjs');
const DATE = '2026-10-20';
const PLAN_BODY =
    '**Status:** authorized.\n\n**Estimate:** 1 hour.\n**Checkpoint:** after task 1.\n**Bar:** must-fix: a failing validator.\n';

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
        'docs/agent/context.md': `# Context\n\nLast updated: ${DATE}\n\n## Batch Test\n\n${PLAN_BODY}`,
    };
}

function initRepo(files) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-'));
    writeFiles(root, files);
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
        'docs/agent/board.md': `# Board\n\nLast updated: ${DATE}\n\n## Topics\n\n### Newer\n\nStatus: discussing · Opened: 2026-10-20 · Updated: 2026-10-22\n\n### Older\n\nStatus: awaiting user · Opened: 2026-10-01 · Updated: 2026-10-05\n\n## Pending migration\n`,
        'docs/agent/backlog.md': `# Backlog\n\nLast updated: ${DATE}\n\n## Area\n\n- Item. Source: test. Surface: none.\n`,
    });
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    try {
        const payload = { cwd: root, session_id: 'prompt' };
        const first = output(runHook('prompt', payload, stateDir));
        assert.match(first.hookSpecificOutput.additionalContext, /## Batch Demo/);
        assert.match(first.hookSpecificOutput.additionalContext, /\*\*Status:\*\* authorized/);
        assert.match(
            first.hookSpecificOutput.additionalContext,
            /board: 2 open topics; oldest updated 2026-10-05 \(Older\)\./,
        );
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

test('preapproved validators are read-only scripts allowed only by exact rules', () => {
    const { preapproved } = JSON.parse(fs.readFileSync(path.join(HERE, 'routes.json'), 'utf8'));
    const { scripts } = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
    const expected = [...preapproved].sort();
    // A script that builds, rewrites, deploys or measures a running store is never preapproved,
    // checked through every npm script it runs.
    const pending = [...preapproved];
    while (pending.length) {
        const name = pending.pop();
        assert.equal(typeof scripts[name], 'string', name);
        assert.doesNotMatch(
            scripts[name],
            /--write|--fix|--cache|tailwindcss|svgo|shopify|layout-check|build:/,
            name,
        );
        pending.push(...[...scripts[name].matchAll(/npm run ([a-z0-9:-]+)/g)].map((m) => m[1]));
    }

    const claude = JSON.parse(fs.readFileSync(path.join(REPO, '.claude/settings.json'), 'utf8'));
    for (const tool of ['Bash', 'PowerShell']) {
        const listed = claude.permissions.allow
            .map((rule) => rule.match(new RegExp(`^${tool}\\(npm\\.cmd run ([^ )*]+)\\)$`)))
            .filter(Boolean)
            .map((match) => match[1]);
        assert.deepEqual(listed.sort(), expected, `.claude/settings.json ${tool}`);
    }
    assert.ok(
        claude.permissions.allow.every((rule) => /^(Bash|PowerShell)\(npm\.cmd run [^ )*]+\)$/.test(rule)),
        '.claude/settings.json allows only exact npm.cmd run rules',
    );

    // Cursor's terminal allowlist and Codex rules match by prefix, so an entry would also allow
    // extra arguments, and several validators write files when given one
    // (`lint:theme -- --shrink-migration-baseline`). Neither client gets a committed list.
    assert.equal(fs.existsSync(path.join(REPO, '.cursor/permissions.json')), false);
    assert.equal(fs.existsSync(path.join(REPO, '.codex/rules')), false);
});

test('board topics need a status line with an allowed status and ordered dates', () => {
    const board = (topics) =>
        `# Board\n\nLast updated: ${DATE}\n\n## Topics\n\n${topics}\n## Pending migration\n\n- **\`AGENTS.md\`:** note.\n`;
    const cases = [
        ['well-formed', '### A\n\nStatus: discussing · Opened: 2026-10-01 · Updated: 2026-10-02\n\nEvidence.\n', null],
        ['no status line', '### A\n\nEvidence first.\n', /topic "A": needs "Status:/],
        ['unknown status', '### A\n\nStatus: decided · Opened: 2026-10-01 · Updated: 2026-10-02\n', /status "decided"/],
        ['impossible date', '### A\n\nStatus: discussing · Opened: 2026-02-30 · Updated: 2026-02-30\n', /must be real dates/],
        ['dates reversed','### A\n\nStatus: awaiting user · Opened: 2026-10-05 · Updated: 2026-10-02\n', /older than Opened/],
    ];
    for (const [name, topics, failure] of cases) {
        const files = records();
        files['docs/agent/board.md'] = board(topics);
        const root = initRepo(files);
        try {
            const run = spawnSync(process.execPath, [RECORD_CHECK], {
                cwd: root,
                encoding: 'utf8',
                windowsHide: true,
            });
            if (failure) {
                assert.equal(run.status, 1, name);
                assert.match(run.stdout, failure, name);
            } else {
                assert.equal(run.status, 0, `${name}: ${run.stdout}`);
                assert.match(run.stdout, /board topics: 1/);
                assert.match(run.stdout, /pending migration lines: 1/);
                assert.doesNotMatch(run.stdout, /words|baseline/);
            }
        } finally {
            removeRepo(root);
        }
    }
});

test('stop hints Show for a stylesheet-only Liquid diff and Ask for a markup diff', () => {
    const liquid = '<div class="demo">Hi</div>\n\n{% stylesheet %}\n  .demo { color: red; }\n  .demo span { margin: 0; }\n{% endstylesheet %}\n';
    const schema = '[{ "name": "{% stylesheet %}" },\n{ "default": true },\n{ "name": "{% endstylesheet %}" }]\n';
    const files = records();
    files['sections/demo.liquid'] = liquid;
    files['config/settings_schema.json'] = schema;
    const root = initRepo(files);
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const target = path.join(root, 'sections/demo.liquid');
    const tierOf = () =>
        output(runHook('stop', { cwd: root, session_id: 'tier' }, stateDir))?.systemMessage || '';
    try {
        tierOf();
        fs.writeFileSync(target, liquid.replace('red', 'blue'));
        assert.equal(stylesheetOnly(root, 'sections/demo.liquid'), true);
        assert.match(tierOf(), /Review tier: Show\./);

        fs.writeFileSync(target, liquid.replace('  .demo span { margin: 0; }\n', ''));
        assert.equal(stylesheetOnly(root, 'sections/demo.liquid'), true, 'removed line inside');

        fs.writeFileSync(target, liquid.replace('Hi', 'Hello').replace('red', 'blue'));
        assert.equal(stylesheetOnly(root, 'sections/demo.liquid'), false);
        assert.match(tierOf(), /Review tier: Ask\./);

        fs.writeFileSync(target, liquid.replace('{% endstylesheet %}\n', '{% endstylesheet %}\n<p></p>\n'));
        assert.equal(stylesheetOnly(root, 'sections/demo.liquid'), false, 'markup after the block');

        // Schema stays Ask even when its strings look like stylesheet tags.
        fs.writeFileSync(target, liquid);
        fs.writeFileSync(path.join(root, 'config/settings_schema.json'), schema.replace('true', 'false'));
        assert.equal(stylesheetOnly(root, 'config/settings_schema.json'), false, 'schema');
        assert.match(tierOf(), /Review tier: Ask\./);
    } finally {
        removeRepo(root);
        removeRepo(stateDir);
    }
});

test('context plans need estimate, checkpoint and bar fields', () => {
    const cases = [
        ['all fields', PLAN_BODY, null],
        ['no estimate', PLAN_BODY.replace(/\*\*Estimate:\*\*.*\n/, ''), /plan "Test" needs \*\*Estimate:\*\*/],
        ['no checkpoint', PLAN_BODY.replace(/\*\*Checkpoint:\*\*.*\n/, ''), /plan "Test" needs \*\*Checkpoint:\*\*/],
        ['empty bar', PLAN_BODY.replace(/\*\*Bar:\*\*.*\n/, '**Bar:**\n'), /plan "Test" needs \*\*Bar:\*\*/],
        ['empty estimate before a field', PLAN_BODY.replace(/\*\*Estimate:\*\*.*\n/, '**Estimate:**\n'), /plan "Test" needs \*\*Estimate:\*\*/],
        ['empty bar before a paragraph', PLAN_BODY.replace(/\*\*Bar:\*\*.*\n/, '**Bar:**  \n\nOutcome.\n'), /plan "Test" needs \*\*Bar:\*\*/],
    ];
    for (const [name, body, failure] of cases) {
        const files = records();
        files['docs/agent/context.md'] = `# Context\n\nLast updated: ${DATE}\n\n## Batch Test\n\n${body}`;
        const root = initRepo(files);
        try {
            const run = spawnSync(process.execPath, [RECORD_CHECK], {
                cwd: root,
                encoding: 'utf8',
                windowsHide: true,
            });
            if (failure) {
                assert.equal(run.status, 1, name);
                assert.match(run.stdout, failure, name);
            } else {
                assert.equal(run.status, 0, `${name}: ${run.stdout}`);
            }
        } finally {
            removeRepo(root);
        }
    }
});

test('pre denies a git push when record checks or whitespace checks fail', () => {
    const root = initRepo(records());
    const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-remote-'));
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const push = () =>
        output(
            runHook(
                'pre',
                {
                    cwd: root,
                    session_id: 'push',
                    tool_name: 'Bash',
                    tool_input: { command: 'git push origin HEAD' },
                },
                stateDir,
            ),
        );
    try {
        git(remote, ['init', '--bare']);
        git(root, ['remote', 'add', 'origin', remote]);
        git(root, ['push', '-u', 'origin', 'HEAD']);
        assert.equal(push(), null, 'a clean push must pass');

        writeFiles(root, { 'notes.md': 'trailing space \n' });
        git(root, ['add', 'notes.md']);
        git(root, ['commit', '-m', 'whitespace']);
        const whitespace = push();
        assert.equal(whitespace.hookSpecificOutput.permissionDecision, 'deny');
        assert.match(whitespace.hookSpecificOutput.permissionDecisionReason, /git diff --check/);
        git(root, ['reset', '--hard', 'HEAD~1']);

        fs.appendFileSync(path.join(root, 'docs/agent/board.md'), '\n**Done: x**\n');
        git(root, ['commit', '-am', 'completion record']);
        const record = push();
        assert.equal(record.hookSpecificOutput.permissionDecision, 'deny');
        assert.match(record.hookSpecificOutput.permissionDecisionReason, /completion record/);
    } finally {
        removeRepo(root);
        removeRepo(remote);
        removeRepo(stateDir);
    }
});

test('runsGitPush recognises git push forms and ignores look-alikes', () => {
    for (const command of [
        'git push',
        'git push -u origin HEAD',
        'git -C D:/repo push',
        'git -C "dir with space" push',
        "git -C 'dir with space' push",
        'git -c x=y -C "C:\\My Repo" push origin HEAD',
        '& git push',
        'git.exe push origin main',
        '"C:\\Program Files\\Git\\cmd\\git.exe" push',
        '& "C:\\Program Files\\Git\\cmd\\git.exe" push',
        'git --no-pager push',
        'git -c core.quotepath=false push',
        'cd repo && git push',
        'npm test; git push origin HEAD',
    ]) {
        assert.equal(runsGitPush(command), true, command);
    }
    for (const command of [
        'echo git push',
        'git pushd',
        'git status',
        'git log --grep push',
        'Write-Output "git push"',
    ]) {
        assert.equal(runsGitPush(command), false, command);
    }
});

test('a git failure in the whitespace check fails open', () => {
    const root = initRepo(records());
    try {
        // A local upstream branch whose ref then points at a missing object: rev-parse may
        // still resolve it, and `git diff --check` fails with a fatal error and no report.
        git(root, ['branch', 'up']);
        git(root, ['branch', '--set-upstream-to=up']);
        fs.writeFileSync(path.join(root, '.git/refs/heads/up'), `${'1'.repeat(40)}\n`);
        assert.deepEqual(prePushFailures(root), []);
    } finally {
        removeRepo(root);
    }
});

const CURSOR_HOOK = path.join(REPO, '.cursor', 'cursor-hook.mjs');
const CODEX_HOOK = path.join(REPO, '.codex', 'codex-hook.mjs');

// Runs an adapter with a payload object, or with raw stdin bytes (Buffer or string).
function runAdapter(script, event, payload, stateDir) {
    const input =
        Buffer.isBuffer(payload) || typeof payload === 'string' ? payload : JSON.stringify(payload);
    return spawnSync(process.execPath, [script, event], {
        input,
        encoding: 'utf8',
        env: { ...process.env, HARNESS_STATE_DIR: stateDir },
        windowsHide: true,
    });
}

function utf16le(text, bom) {
    const body = Buffer.from(text, 'utf16le');
    return bom ? Buffer.concat([Buffer.from([0xff, 0xfe]), body]) : body;
}

function utf16be(text) {
    const le = Buffer.from(text, 'utf16le');
    const be = Buffer.alloc(le.length);
    for (let index = 0; index < le.length; index += 2) {
        be[index] = le[index + 1];
        be[index + 1] = le[index];
    }
    return Buffer.concat([Buffer.from([0xfe, 0xff]), be]);
}

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

// A clean repository with a pushed upstream, then a commit the record check rejects.
function repoWithFailingPush() {
    const root = initRepo(records());
    const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-remote-'));
    git(remote, ['init', '--bare']);
    git(root, ['remote', 'add', 'origin', remote]);
    git(root, ['push', '-u', 'origin', 'HEAD']);
    fs.appendFileSync(path.join(root, 'docs/agent/board.md'), '\n**Done: x**\n');
    git(root, ['commit', '-am', 'completion record']);
    return { root, remote };
}

function patch(...lines) {
    return ['*** Begin Patch', ...lines, '*** End Patch', ''].join('\n');
}

const MERCHANT_PATCH = patch('*** Update File: templates/index.json', '@@', '-a', '+b');
const SNIPPET_PATCH = patch('*** Update File: snippets/loading.liquid', '@@', '-a', '+b');

test('core decodes hook stdin in UTF-8, UTF-8 with a BOM, and UTF-16', () => {
    const text = '{"a":"é"}';
    for (const [label, buffer] of [
        ['plain', Buffer.from(text)],
        ['utf8 bom', Buffer.concat([BOM, Buffer.from(text)])],
        ['utf16le bom', utf16le(text, true)],
        ['utf16le', utf16le(text, false)],
        ['utf16be bom', utf16be(text)],
    ]) {
        assert.deepEqual(parseInput(buffer), { a: 'é' }, label);
    }
    assert.deepEqual(parseInput(Buffer.alloc(0)), {});
    assert.deepEqual(parseInput(Buffer.from(' \r\n')), {});
    assert.throws(() => parseInput(Buffer.from('{')), /malformed stdin/);
    assert.equal(decodeInput(Buffer.concat([BOM, Buffer.from('{}')])), '{}');
    assert.equal(resolveRoot('/d:/repo').replace(/\\/g, '/').toLowerCase(), 'd:/repo');
});

test('core names no client field, tool or product', () => {
    const core = fs.readFileSync(path.join(HERE, 'core.mjs'), 'utf8');
    for (const name of [
        'tool_name',
        'tool_input',
        'hookSpecificOutput',
        'permissionDecision',
        'permission',
        'followup_message',
        'apply_patch',
        'StrReplace',
        'Bash',
        'Cursor',
        'Codex',
        'Claude',
    ]) {
        assert.equal(core.includes(name), false, name);
    }
});

test('cursor guards: merchant writes, asked shell commands and subagents deny, others allow', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const uriRoot = `/${REPO.replace(/\\/g, '/')}`;
    const call = (event, payload) =>
        output(
            runAdapter(
                CURSOR_HOOK,
                event,
                { workspace_roots: [uriRoot], conversation_id: 'cursor', ...payload },
                stateDir,
            ),
        );
    try {
        for (const [tool, toolInput] of [
            ['Write', { file_path: 'templates/index.json', content: '{}' }],
            ['StrReplace', { file_path: 'config/settings_data.json', new_string: 'x' }],
            ['Delete', { path: 'sections/header-group.json' }],
            ['Write', { file_path: path.join(REPO, 'templates', 'product.json') }],
            ['Write', JSON.stringify({ file_path: 'templates/index.json' })],
        ]) {
            const result = call('preToolUse', { tool_name: tool, tool_input: toolInput });
            assert.equal(result.permission, 'deny', `${tool} ${JSON.stringify(toolInput)}`);
            assert.match(result.agent_message, /Merchant-owned path/);
        }
        const snippet = { file_path: 'snippets/loading.liquid', new_string: 'x' };
        assert.equal(
            call('preToolUse', { tool_name: 'StrReplace', tool_input: snippet }).permission,
            'allow',
        );
        assert.equal(call('preToolUse', { tool_name: 'Read', tool_input: {} }).permission, 'allow');
        assert.equal(call('preToolUse', { tool_name: 'Task', tool_input: {} }).permission, 'deny');
        assert.equal(call('subagentStart', { task: 'look' }).permission, 'deny');
        // Every ask is a deny in Cursor (the live check ran an asked shell command).
        const pull = { tool_name: 'Shell', tool_input: { command: 'shopify theme pull' } };
        assert.equal(call('preToolUse', pull).permission, 'deny');
        const shell = call('beforeShellExecution', { command: 'shopify theme pull' });
        assert.equal(shell.permission, 'deny');
        assert.match(shell.agent_message, /Command runs shopify theme pull/);
        assert.equal(call('beforeShellExecution', { command: 'git status' }).permission, 'allow');
    } finally {
        removeRepo(stateDir);
    }
});

test('cursor stdin: a BOM is accepted; malformed input denies guards and is quiet elsewhere', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    try {
        const payload = JSON.stringify({
            workspace_roots: [REPO],
            tool_name: 'Write',
            tool_input: { file_path: 'templates/index.json' },
        });
        for (const buffer of [
            Buffer.concat([BOM, Buffer.from(payload)]),
            utf16le(payload, true),
        ]) {
            const result = output(runAdapter(CURSOR_HOOK, 'preToolUse', buffer, stateDir));
            assert.equal(result.permission, 'deny');
        }
        for (const event of ['preToolUse', 'beforeShellExecution', 'subagentStart']) {
            const result = output(runAdapter(CURSOR_HOOK, event, '{', stateDir));
            assert.equal(result.permission, 'deny', event);
            assert.match(result.agent_message, /cursor-hook: malformed stdin/);
        }
        for (const event of ['postToolUse', 'stop', 'sessionStart']) {
            assert.equal(output(runAdapter(CURSOR_HOOK, event, '{', stateDir)), null, event);
        }
        const unknown = runAdapter(CURSOR_HOOK, 'nope', '{}', stateDir);
        assert.equal(unknown.status, 0);
        assert.match(unknown.stderr, /cursor-hook: unknown event nope/);
    } finally {
        removeRepo(stateDir);
    }
});

test('guards deny empty stdin and a missing root; Claude stays fail-open', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    try {
        for (const stdin of ['', ' \r\n', '{}']) {
            for (const event of ['preToolUse', 'beforeShellExecution', 'subagentStart']) {
                const result = output(runAdapter(CURSOR_HOOK, event, stdin, stateDir));
                assert.equal(result.permission, 'deny', `cursor ${event} ${JSON.stringify(stdin)}`);
            }
            const codex = output(runAdapter(CODEX_HOOK, 'preToolUse', stdin, stateDir));
            assert.equal(codex.hookSpecificOutput.permissionDecision, 'deny', JSON.stringify(stdin));
        }
        const cursorWrite = {
            tool_name: 'Write',
            tool_input: { file_path: 'snippets/loading.liquid' },
        };
        const noRoot = output(runAdapter(CURSOR_HOOK, 'preToolUse', cursorWrite, stateDir));
        assert.equal(noRoot.permission, 'deny');
        assert.match(noRoot.agent_message, /no workspace root/);
        const shell = output(
            runAdapter(CURSOR_HOOK, 'beforeShellExecution', { command: 'git status' }, stateDir),
        );
        assert.equal(shell.permission, 'deny');
        const codexPatch = { tool_name: 'apply_patch', tool_input: { command: SNIPPET_PATCH } };
        const codex = output(runAdapter(CODEX_HOOK, 'preToolUse', codexPatch, stateDir));
        assert.equal(codex.hookSpecificOutput.permissionDecision, 'deny');
        assert.match(codex.hookSpecificOutput.permissionDecisionReason, /no workspace root/);
        // Non-guard events without a root stay quiet.
        assert.equal(output(runAdapter(CURSOR_HOOK, 'postToolUse', cursorWrite, stateDir)), null);
        // Claude: empty stdin is a no-op, and the subagent reason is unchanged.
        assert.equal(output(runAdapter(HOOK, 'pre', '', stateDir)), null);
        const agent = output(runHook('pre', { tool_name: 'Agent', tool_input: {} }, stateDir));
        assert.equal(
            agent.hookSpecificOutput.permissionDecisionReason,
            'Agent tool spawns a subagent.',
        );
    } finally {
        removeRepo(stateDir);
    }
});

test('cursor context: session start carries the plan once, route hints once', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    try {
        const base = { workspace_roots: [REPO], conversation_id: 'context' };
        const start = output(runAdapter(CURSOR_HOOK, 'sessionStart', base, stateDir));
        assert.match(start.additional_context, /docs\/agent\/context\.md/);
        const edit = {
            ...base,
            tool_name: 'StrReplace',
            tool_input: { file_path: 'sections/main-product.liquid', new_string: 'x' },
        };
        const first = output(runAdapter(CURSOR_HOOK, 'postToolUse', edit, stateDir));
        assert.match(first.additional_context, /lint:theme/);
        assert.equal(output(runAdapter(CURSOR_HOOK, 'postToolUse', edit, stateDir)), null);
    } finally {
        removeRepo(stateDir);
    }
});

test('cursor and codex deny a failing git push', () => {
    const { root, remote } = repoWithFailingPush();
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const command = 'git push origin HEAD';
    try {
        const cursor = output(
            runAdapter(
                CURSOR_HOOK,
                'beforeShellExecution',
                { workspace_roots: [root], command },
                stateDir,
            ),
        );
        assert.equal(cursor.permission, 'deny');
        assert.match(cursor.agent_message, /completion record/);
        const codex = output(
            runAdapter(
                CODEX_HOOK,
                'preToolUse',
                { cwd: root, tool_name: 'Bash', tool_input: { command } },
                stateDir,
            ),
        );
        assert.equal(codex.hookSpecificOutput.permissionDecision, 'deny');
        assert.match(codex.hookSpecificOutput.permissionDecisionReason, /completion record/);
    } finally {
        removeRepo(root);
        removeRepo(remote);
        removeRepo(stateDir);
    }
});

test('cursor and codex stop: failures continue the turn once', () => {
    const root = initRepo(records());
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const board = path.join(root, 'docs/agent/board.md');
    const cursor = (extra) =>
        output(
            runAdapter(
                CURSOR_HOOK,
                'stop',
                { workspace_roots: [root], conversation_id: 'stop', status: 'completed', ...extra },
                stateDir,
            ),
        );
    const codex = (extra) =>
        output(
            runAdapter(CODEX_HOOK, 'stop', { cwd: root, session_id: 'codex-stop', ...extra }, stateDir),
        );
    try {
        assert.equal(cursor({}), null);
        assert.equal(codex({}), null);
        fs.appendFileSync(board, '\n**Done: x**\n');
        assert.equal(cursor({ status: 'aborted' }), null, 'an aborted turn is skipped');
        assert.match(cursor({}).followup_message, /completion record/);
        assert.equal(cursor({}), null, 'an unchanged worktree is not reported twice');
        fs.appendFileSync(board, '\n**Done: y**\n');
        assert.equal(cursor({ loop_count: 1 }), null, 'a continued turn does not continue again');
        const blocked = codex({});
        assert.equal(blocked.decision, 'block');
        assert.match(blocked.reason, /completion record/);
        fs.appendFileSync(board, '\n**Done: z**\n');
        assert.equal(codex({ stop_hook_active: true }), null);
    } finally {
        removeRepo(root);
        removeRepo(stateDir);
    }
});

test('codex apply_patch: every target is checked, asks become denies', () => {
    const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-state-'));
    const call = (event, toolName, commandText) =>
        output(
            runAdapter(
                CODEX_HOOK,
                event,
                {
                    cwd: REPO,
                    session_id: 'codex',
                    tool_name: toolName,
                    tool_input: { command: commandText },
                },
                stateDir,
            ),
        );
    const decision = (result) => result?.hookSpecificOutput.permissionDecision;
    try {
        const crlf = patch(
            '*** Add File: snippets/new file.liquid',
            '+hi',
            '*** Update File: snippets/a.liquid',
            '*** Move to: templates/x.json',
            '@@',
            '-a',
            '+b',
            '*** Delete File: snippets/old.liquid',
        ).replace(/\n/g, '\r\n');
        assert.deepEqual(
            patchEdits(crlf).map((edit) => edit.path),
            [
                'snippets/new file.liquid',
                'snippets/a.liquid',
                'templates/x.json',
                'snippets/old.liquid',
            ],
        );
        for (const text of [
            MERCHANT_PATCH,
            patch('*** Update File: snippets/a.liquid', '*** Move to: templates/x.json'),
            patch('*** Delete File: config/settings_data.json'),
            patch('*** Add File: snippets/ok.liquid', '+x', '*** Add File: sections/footer-group.json'),
            'not a patch',
        ]) {
            assert.equal(decision(call('preToolUse', 'apply_patch', text)), 'deny', text);
        }
        assert.equal(call('preToolUse', 'apply_patch', SNIPPET_PATCH), null);
        assert.equal(decision(call('preToolUse', 'Bash', 'shopify theme pull')), 'deny');
        assert.equal(call('preToolUse', 'Bash', 'git status'), null);
        const hint = call('postToolUse', 'apply_patch', SNIPPET_PATCH);
        assert.match(hint.hookSpecificOutput.additionalContext, /lint:theme/);
        assert.equal(decision(output(runAdapter(CODEX_HOOK, 'preToolUse', '{', stateDir))), 'deny');
        const payload = { cwd: REPO, tool_name: 'apply_patch', tool_input: { command: MERCHANT_PATCH } };
        const bom = Buffer.concat([BOM, Buffer.from(JSON.stringify(payload))]);
        assert.equal(decision(output(runAdapter(CODEX_HOOK, 'preToolUse', bom, stateDir))), 'deny');
        assert.equal(output(runAdapter(CODEX_HOOK, 'postToolUse', '{', stateDir)), null);
        const prompt = output(
            runAdapter(CODEX_HOOK, 'prompt', { cwd: REPO, session_id: 'codex' }, stateDir),
        );
        assert.match(prompt.hookSpecificOutput.additionalContext, /docs\/agent\/context\.md/);
    } finally {
        removeRepo(stateDir);
    }
});
