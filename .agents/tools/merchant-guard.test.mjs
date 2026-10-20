import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
    collectMerchantViolations,
    rangeFromGithubEvent,
    SHOPIFY_INTEGRATION_EMAIL,
} from './merchant-guard.mjs';

const GUARD = fileURLToPath(new URL('./merchant-guard.mjs', import.meta.url));

function gitEnv(email = 'human@example.com') {
    const env = { ...process.env };
    delete env.GIT_DIR;
    delete env.GIT_WORK_TREE;
    delete env.GIT_INDEX_FILE;
    env.GIT_AUTHOR_NAME = 'Test';
    env.GIT_AUTHOR_EMAIL = email;
    env.GIT_COMMITTER_NAME = 'Test';
    env.GIT_COMMITTER_EMAIL = email;
    return env;
}

function git(root, args, email) {
    const result = spawnSync('git', args, {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
        env: gitEnv(email),
    });
    assert.equal(result.status, 0, `${args.join(' ')}\n${result.stderr || result.stdout}`);
    return result.stdout;
}

function write(root, relative, content = '{}\n') {
    const target = path.join(root, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
}

function commit(root, files, paragraphs, email) {
    git(root, ['add', '--', ...files], email);
    git(root, ['commit', ...paragraphs.flatMap((paragraph) => ['-m', paragraph])], email);
    return git(root, ['rev-parse', 'HEAD'], email).trim();
}

function initRepo() {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'merchant-guard-'));
    git(root, ['init', '-b', 'main']);
    git(root, ['config', 'user.email', 'human@example.com']);
    git(root, ['config', 'user.name', 'Test']);
    write(root, 'README.md', 'init\n');
    commit(root, ['README.md'], ['init']);
    return root;
}

function removeRepo(root) {
    fs.rmSync(root, { recursive: true, force: true });
}

function runCli(root, args, env = {}) {
    return spawnSync(process.execPath, [GUARD, ...args], {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
        env: { ...gitEnv(), ...env },
    });
}

test('a commit touching templates/index.json without a trailer fails', () => {
    const root = initRepo();
    try {
        write(root, 'templates/index.json');
        const sha = commit(root, ['templates/index.json'], ['edit template']);
        const failures = collectMerchantViolations(root, `${sha}~1..${sha}`);
        assert.deepEqual(failures, [`${sha} edit template: templates/index.json`]);
    } finally {
        removeRepo(root);
    }
});

test('Merchant-Change: user approved X passes', () => {
    const root = initRepo();
    try {
        write(root, 'templates/index.json');
        const sha = commit(
            root,
            ['templates/index.json'],
            ['edit template', 'Merchant-Change: user approved X'],
        );
        assert.deepEqual(collectMerchantViolations(root, `${sha}~1..${sha}`), []);
    } finally {
        removeRepo(root);
    }
});

test('an empty or whitespace Merchant-Change trailer fails', () => {
    const root = initRepo();
    try {
        write(root, 'templates/index.json', '{}\n');
        const emptySha = commit(
            root,
            ['templates/index.json'],
            ['empty trailer', 'Merchant-Change:'],
        );
        write(root, 'templates/index.json', '{ }\n');
        const blankSha = commit(
            root,
            ['templates/index.json'],
            ['blank trailer', 'Merchant-Change:   '],
        );
        const failures = collectMerchantViolations(root, `${emptySha}~1..${blankSha}`);
        assert.deepEqual(failures, [
            `${blankSha} blank trailer: templates/index.json`,
            `${emptySha} empty trailer: templates/index.json`,
        ]);
    } finally {
        removeRepo(root);
    }
});

test('a Merchant-Change line above the trailer block does not count', () => {
    const root = initRepo();
    try {
        write(root, 'templates/index.json');
        const sha = commit(
            root,
            ['templates/index.json'],
            [
                'edit template',
                'Merchant-Change: user approved X',
                'This paragraph is not a trailer.',
            ],
        );
        const failures = collectMerchantViolations(root, `${sha}~1..${sha}`);
        assert.deepEqual(failures, [`${sha} edit template: templates/index.json`]);
    } finally {
        removeRepo(root);
    }
});

test('a shopify[bot] commit passes without a trailer', () => {
    const root = initRepo();
    try {
        write(root, 'templates/index.json');
        const sha = commit(
            root,
            ['templates/index.json'],
            ['editor write'],
            SHOPIFY_INTEGRATION_EMAIL,
        );
        assert.deepEqual(collectMerchantViolations(root, `${sha}~1..${sha}`), []);
    } finally {
        removeRepo(root);
    }
});

test('a commit touching only sections/foo.liquid passes', () => {
    const root = initRepo();
    try {
        write(root, 'sections/foo.liquid', 'hello\n');
        const sha = commit(root, ['sections/foo.liquid'], ['section']);
        assert.deepEqual(collectMerchantViolations(root, `${sha}~1..${sha}`), []);
    } finally {
        removeRepo(root);
    }
});

test('sections/header-group.json and config/settings_data.json are guarded', () => {
    const root = initRepo();
    try {
        write(root, 'sections/header-group.json');
        write(root, 'config/settings_data.json');
        const sha = commit(
            root,
            ['sections/header-group.json', 'config/settings_data.json'],
            ['merchant files'],
        );
        const failures = collectMerchantViolations(root, `${sha}~1..${sha}`);
        assert.equal(failures.length, 1);
        assert.match(failures[0], new RegExp(`^${sha} merchant files: `));
        assert.match(failures[0], /config\/settings_data\.json/);
        assert.match(failures[0], /sections\/header-group\.json/);
    } finally {
        removeRepo(root);
    }
});

test('a merge commit is skipped', () => {
    const root = initRepo();
    try {
        write(root, 'sections/foo.liquid', 'a\n');
        commit(root, ['sections/foo.liquid'], ['base file']);
        git(root, ['checkout', '-b', 'feature']);
        write(root, 'sections/foo.liquid', 'b\n');
        commit(root, ['sections/foo.liquid'], ['feature side']);
        git(root, ['checkout', 'main']);
        write(root, 'sections/foo.liquid', 'c\n');
        commit(root, ['sections/foo.liquid'], ['main side']);
        const merge = spawnSync('git', ['merge', '--no-commit', 'feature'], {
            cwd: root,
            encoding: 'utf8',
            windowsHide: true,
            env: gitEnv(),
        });
        assert.notEqual(merge.status, 0, merge.stdout + merge.stderr);
        write(root, 'sections/foo.liquid', 'resolved\n');
        write(root, 'templates/only-merge.json');
        git(root, ['add', '-A']);
        git(root, ['commit', '-m', 'merge both']);
        const mergeSha = git(root, ['rev-parse', 'HEAD']).trim();
        assert.equal(
            git(root, ['rev-list', '--parents', '-n', '1', 'HEAD']).trim().split(' ').length,
            3,
        );
        const seen = spawnSync(
            'git',
            ['diff-tree', '-z', '-m', '--no-commit-id', '--name-only', '-r', mergeSha],
            { cwd: root, encoding: 'utf8', windowsHide: true, env: gitEnv() },
        );
        assert.equal(seen.status, 0, seen.stderr);
        assert.ok(seen.stdout.split('\0').includes('templates/only-merge.json'));
        const failures = collectMerchantViolations(root, `${mergeSha}~3..${mergeSha}`);
        assert.equal(
            failures.some((line) => line.startsWith(mergeSha)),
            false,
        );
        assert.deepEqual(failures, []);
    } finally {
        removeRepo(root);
    }
});

test('paths with spaces and non-ASCII names are read unquoted', () => {
    const root = initRepo();
    try {
        write(root, 'templates/my page.json');
        write(root, 'templates/café.json');
        write(root, 'sections/分组-group.json');
        const sha = commit(
            root,
            ['templates/my page.json', 'templates/café.json', 'sections/分组-group.json'],
            ['odd names'],
        );
        const failures = collectMerchantViolations(root, `${sha}~1..${sha}`);
        assert.equal(failures.length, 1);
        assert.equal(failures[0].includes('\\'), false);
        assert.equal(failures[0].includes('"'), false);
        assert.match(failures[0], new RegExp(`^${sha} odd names: `));
        assert.ok(failures[0].includes('templates/my page.json'));
        assert.ok(failures[0].includes('templates/café.json'));
        assert.ok(failures[0].includes('sections/分组-group.json'));
    } finally {
        removeRepo(root);
    }
});

test('GitHub event ranges use pull_request shas, push shas, or the default branch', () => {
    assert.equal(
        rangeFromGithubEvent('pull_request', {
            pull_request: { base: { sha: 'aaa' }, head: { sha: 'bbb' } },
        }),
        'aaa..bbb',
    );
    assert.equal(
        rangeFromGithubEvent('push', {
            before: 'abc',
            after: 'def',
            repository: { default_branch: 'main' },
        }),
        'abc..def',
    );
    assert.equal(
        rangeFromGithubEvent('push', {
            before: '0'.repeat(40),
            after: 'def',
            repository: { default_branch: 'main' },
        }),
        'origin/main..def',
    );
    assert.equal(
        rangeFromGithubEvent('push', {
            before: '0'.repeat(64),
            after: 'def',
            repository: { default_branch: 'develop' },
        }),
        'origin/develop..def',
    );
});

test('the CLI --range exit code matches the violations', () => {
    const root = initRepo();
    try {
        write(root, 'sections/foo.liquid', 'ok\n');
        const passing = commit(root, ['sections/foo.liquid'], ['section only']);
        const pass = runCli(root, ['--range', `${passing}~1..${passing}`]);
        assert.equal(pass.status, 0, pass.stderr);
        assert.match(pass.stdout, /Merchant path guard passed/);

        write(root, 'templates/index.json');
        const failing = commit(root, ['templates/index.json'], ['edit template']);
        const fail = runCli(root, ['--range', `${failing}~1..${failing}`]);
        assert.equal(fail.status, 1);
        assert.match(fail.stderr, new RegExp(`${failing} edit template: templates/index.json`));
    } finally {
        removeRepo(root);
    }
});

test('a new-branch push is resolved against origin/<default branch>', () => {
    const root = initRepo();
    const origin = fs.mkdtempSync(path.join(os.tmpdir(), 'merchant-origin-'));
    try {
        write(root, 'templates/on-main.json');
        const mainSha = commit(root, ['templates/on-main.json'], ['on default']);
        git(root, ['init', '--bare', origin]);
        git(root, ['remote', 'add', 'origin', origin]);
        git(root, ['push', 'origin', 'main']);
        git(root, ['checkout', '-b', 'feature']);
        write(root, 'templates/on-feature.json');
        const featureSha = commit(root, ['templates/on-feature.json'], ['on feature']);
        const eventPath = path.join(root, 'event.json');
        fs.writeFileSync(
            eventPath,
            JSON.stringify({
                before: '0'.repeat(40),
                after: featureSha,
                repository: { default_branch: 'main' },
            }),
        );
        const result = runCli(root, [], {
            GITHUB_EVENT_NAME: 'push',
            GITHUB_EVENT_PATH: eventPath,
        });
        assert.equal(result.status, 1);
        assert.match(
            result.stderr,
            new RegExp(`${featureSha} on feature: templates/on-feature.json`),
        );
        assert.equal(result.stderr.includes(mainSha), false);
    } finally {
        removeRepo(root);
        removeRepo(origin);
    }
});

test('commits reachable from the guard start commit are not checked', () => {
    const root = initRepo();
    try {
        const base = git(root, ['rev-parse', 'HEAD']).trim();
        write(root, 'templates/index.json');
        const before = commit(root, ['templates/index.json'], ['old template edit']);
        write(root, 'templates/product.json');
        const after = commit(root, ['templates/product.json'], ['new template edit']);
        assert.deepEqual(collectMerchantViolations(root, `${base}..${after}`, before), [
            `${after} new template edit: templates/product.json`,
        ]);
        assert.equal(
            collectMerchantViolations(root, `${base}..${after}`, 'f'.repeat(40)).length,
            2,
        );
    } finally {
        removeRepo(root);
    }
});

test('a force-pushed before that is not in the clone falls back to the default branch', () => {
    const event = {
        before: 'a'.repeat(40),
        after: 'b'.repeat(40),
        repository: { default_branch: 'main' },
    };
    assert.equal(
        rangeFromGithubEvent('push', event, () => false),
        `origin/main..${'b'.repeat(40)}`,
    );
    assert.equal(
        rangeFromGithubEvent('push', event, () => true),
        `${'a'.repeat(40)}..${'b'.repeat(40)}`,
    );
});

test('a root commit on an orphan branch is checked', () => {
    const root = initRepo();
    try {
        git(root, ['checkout', '--orphan', 'orphan']);
        git(root, ['rm', '-rf', '--cached', '.']);
        write(root, 'templates/index.json');
        const sha = commit(root, ['templates/index.json'], ['orphan template']);
        assert.deepEqual(collectMerchantViolations(root, `main..${sha}`), [
            `${sha} orphan template: templates/index.json`,
        ]);
    } finally {
        removeRepo(root);
    }
});

test('a push that deletes a ref checks nothing', () => {
    const event = {
        before: 'a'.repeat(40),
        after: '0'.repeat(40),
        repository: { default_branch: 'main' },
    };
    assert.equal(rangeFromGithubEvent('push', event), null);
});

test('the CLI passes a branch or tag deletion read from the GitHub event', () => {
    const root = initRepo();
    try {
        const before = git(root, ['rev-parse', 'HEAD']).trim();
        for (const ref of ['refs/heads/gone', 'refs/tags/gone']) {
            const eventPath = path.join(root, 'event.json');
            fs.writeFileSync(
                eventPath,
                JSON.stringify({
                    ref,
                    before,
                    after: '0'.repeat(40),
                    deleted: true,
                    repository: { default_branch: 'main' },
                }),
            );
            const result = runCli(root, [], {
                GITHUB_EVENT_NAME: 'push',
                GITHUB_EVENT_PATH: eventPath,
            });
            assert.equal(result.status, 0, `${ref}: ${result.stderr}`);
            assert.match(result.stdout, /deletes a ref/);
        }
    } finally {
        removeRepo(root);
    }
});

test('a fork pull request without shas uses the merge commit parents', () => {
    assert.equal(
        rangeFromGithubEvent('pull_request', {}, (rev) => rev === 'HEAD^2'),
        'HEAD^1..HEAD^2',
    );
    assert.throws(() => rangeFromGithubEvent('pull_request', {}, () => false), /missing base.sha/);
    const root = initRepo();
    try {
        git(root, ['checkout', '-b', 'fork']);
        write(root, 'templates/index.json');
        const head = commit(root, ['templates/index.json'], ['fork template']);
        git(root, ['checkout', 'main']);
        write(root, 'README.md', 'base moved\n');
        commit(root, ['README.md'], ['base moved']);
        git(root, ['merge', '--no-ff', '-m', 'merge pr', 'fork']);
        const eventPath = path.join(root, 'event.json');
        fs.writeFileSync(eventPath, '{}');
        const result = runCli(root, [], {
            GITHUB_EVENT_NAME: 'pull_request',
            GITHUB_EVENT_PATH: eventPath,
        });
        assert.equal(result.status, 1);
        assert.match(result.stderr, new RegExp(`${head} fork template: templates/index.json`));
    } finally {
        removeRepo(root);
    }
});
