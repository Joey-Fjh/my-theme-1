#!/usr/bin/env node
// Fails when a non-merge commit in the range changes a merchant-owned path
// without the Shopify GitHub integration as author or a non-empty Merchant-Change trailer.
// Usage: node .agents/tools/merchant-guard.mjs [--range <a>..<b>]
// With no --range, reads GITHUB_EVENT_NAME and GITHUB_EVENT_PATH.
// Merchant globs and the guard's start commit come from .agents/tools/harness/routes.json:
// commits reachable from merchantGuardFrom predate the trailer rule and are not checked.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globToRegExp } from './harness/hook.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_PATH = path.join(HERE, 'harness', 'routes.json');
export const SHOPIFY_INTEGRATION_EMAIL = '79544226+shopify[bot]@users.noreply.github.com';
const TRAILER_LINE = /^Merchant-Change:\s*(.*)$/;
const ALL_ZERO = /^0+$/;

function runGit(root, args, input) {
    const env = { ...process.env };
    delete env.GIT_DIR;
    delete env.GIT_WORK_TREE;
    delete env.GIT_INDEX_FILE;
    const result = spawnSync('git', args, {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
        env,
        input,
    });
    if (result.error) {
        throw new Error(`git ${args[0]} failed to start (${result.error.message})`);
    }
    if (result.status !== 0) {
        const detail = (result.stderr || result.stdout || 'unknown error').trim().split('\n')[0];
        throw new Error(`git ${args[0]} failed (${detail})`);
    }
    return result.stdout;
}

function loadRoutes() {
    return JSON.parse(fs.readFileSync(ROUTES_PATH, 'utf8'));
}

export function loadMerchantGlobs() {
    const routes = loadRoutes();
    if (!Array.isArray(routes.merchant) || routes.merchant.length === 0) {
        throw new Error('lint:merchant: routes.json has no merchant globs');
    }
    return routes.merchant;
}

function isMerchantPath(relative, globs) {
    const slash = relative.replace(/\\/g, '/');
    return globs.some((pattern) => globToRegExp(pattern).test(slash));
}

function hasCommit(root, sha) {
    try {
        runGit(root, ['cat-file', '-e', `${sha}^{commit}`]);
        return true;
    } catch {
        return false;
    }
}

// exists(sha) reports whether the commit is in the clone; a force-pushed `before` may not be.
export function rangeFromGithubEvent(eventName, event, exists = () => true) {
    if (eventName === 'pull_request') {
        const base = event?.pull_request?.base?.sha;
        const head = event?.pull_request?.head?.sha;
        if (base && head) return `${base}..${head}`;
        // A fork pull request may arrive with an empty payload; the checkout is then the
        // PR merge commit, whose first parent is the base and second parent the head.
        if (exists('HEAD^2')) return 'HEAD^1..HEAD^2';
        throw new Error('lint:merchant: pull_request event is missing base.sha or head.sha');
    }
    if (eventName === 'push') {
        const before = event?.before;
        const after = event?.after;
        if (!before || !after) {
            throw new Error('lint:merchant: push event is missing before or after');
        }
        // A deleted branch or tag pushes no commits.
        if (ALL_ZERO.test(after)) return null;
        if (ALL_ZERO.test(before) || !exists(before)) {
            const branch = event?.repository?.default_branch;
            if (!branch) {
                throw new Error('lint:merchant: push event is missing repository.default_branch');
            }
            return `origin/${branch}..${after}`;
        }
        return `${before}..${after}`;
    }
    throw new Error(`lint:merchant: unsupported GITHUB_EVENT_NAME ${eventName || '(none)'}`);
}

function listCommits(root, range, since) {
    const args = ['log', '-z', '--no-merges', '--format=%H%x00%ae%x00%s%x00%B', range];
    if (since && hasCommit(root, since)) args.push('--not', since);
    const stdout = runGit(root, args);
    const parts = stdout.split('\0');
    const commits = [];
    for (let index = 0; index + 3 < parts.length; index += 4) {
        const sha = parts[index];
        if (!sha) continue;
        commits.push({
            sha,
            email: parts[index + 1],
            subject: parts[index + 2],
            body: parts[index + 3],
        });
    }
    return commits;
}

function listPaths(root, sha) {
    const stdout = runGit(root, [
        'diff-tree',
        '-z',
        '--root',
        '--no-commit-id',
        '--name-only',
        '-r',
        sha,
    ]);
    return stdout.split('\0').filter(Boolean);
}

function merchantChangeReason(root, body) {
    const stdout = runGit(root, ['interpret-trailers', '--parse'], body);
    for (const line of stdout.split(/\r?\n/)) {
        const match = TRAILER_LINE.exec(line);
        if (match && match[1].trim() !== '') return match[1].trim();
    }
    return '';
}

export function collectMerchantViolations(root, range, since = loadRoutes().merchantGuardFrom) {
    const globs = loadMerchantGlobs();
    const failures = [];
    for (const commit of listCommits(root, range, since)) {
        const paths = listPaths(root, commit.sha).filter((relative) =>
            isMerchantPath(relative, globs),
        );
        if (paths.length === 0) continue;
        if (commit.email === SHOPIFY_INTEGRATION_EMAIL) continue;
        if (merchantChangeReason(root, commit.body)) continue;
        failures.push(`${commit.sha} ${commit.subject}: ${paths.join(', ')}`);
    }
    return failures;
}

function parseRange(argv) {
    const index = argv.indexOf('--range');
    if (index === -1) return null;
    const value = argv[index + 1];
    if (!value || value.startsWith('-') || !value.includes('..')) {
        throw new Error('lint:merchant: --range needs <a>..<b>');
    }
    return value;
}

function rangeFromEnv(root) {
    const eventName = process.env.GITHUB_EVENT_NAME;
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventName || !eventPath) {
        throw new Error(
            'lint:merchant needs --range <a>..<b>, or GITHUB_EVENT_NAME and GITHUB_EVENT_PATH.',
        );
    }
    return rangeFromGithubEvent(eventName, JSON.parse(fs.readFileSync(eventPath, 'utf8')), (sha) =>
        hasCommit(root, sha),
    );
}

function main() {
    try {
        const range = parseRange(process.argv) || rangeFromEnv(process.cwd());
        if (range === null) {
            console.log('Merchant path guard passed: the push deletes a ref.');
            return;
        }
        const failures = collectMerchantViolations(process.cwd(), range);
        if (failures.length > 0) {
            console.error(failures.join('\n'));
            process.exit(1);
        }
        console.log('Merchant path guard passed.');
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
