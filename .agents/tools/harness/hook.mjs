#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkRecords } from './record-check.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const INSTALL_ROOT = path.resolve(HERE, '../../..');
const ROUTES_PATH = path.join(HERE, 'routes.json');
const RECORD_PATHS = new Set([
    'docs/agent/board.md',
    'docs/agent/backlog.md',
    'docs/agent/context.md',
]);
const FAST_ALLOWED = new Set([
    'lint:theme',
    'lint:i18n',
    'lint:liquid-syntax',
    'lint:doc-paths',
    'lint:records',
]);
const STOP_BUDGET_MS = 90_000;
const TIER_RANK = { Ask: 3, Show: 2, Ship: 1 };
// Advisory shell coverage: a command is treated as writing a merchant path when the
// path is a redirection target, the destination (last argument) of a copy or move, or
// any argument of an in-place writer. CI is the hard gate.
const REDIRECT_TARGET = /\d?>{1,2}\s*(?!&)(["']?)([^\s"';|&<>]+)\1/g;
const COPY_MOVE = /(?:^|[\s;&|(])(?:cp|mv|Copy-Item|Move-Item|copy|move)\s+([^;|&]+)/gi;
const IN_PLACE_WRITERS = [
    /\bsed\s+(?:-\w*\s+)*-i/,
    /\b(?:Set-Content|Out-File|Add-Content|Remove-Item|Clear-Content|New-Item)\b/i,
    /(?:^|[\s;&|(])(?:rm|del|tee|truncate)\s/,
    /\b(?:writeFileSync|writeFile|appendFileSync|rmSync|unlinkSync|write_text)\b/,
    /open\(\s*[^)]*['"][wa]\+?['"]/,
    /\bgit\s+(?:checkout|restore|reset)\b/,
];

const ESCAPE = new Set(['\\', '.', '+', '^', '$', '{', '}', '(', ')', '|', '[', ']']);

export function globToRegExp(pattern) {
    let source = '';
    const normalized = pattern.replace(/\\/g, '/');
    for (let index = 0; index < normalized.length; index += 1) {
        if (normalized[index] === '*' && normalized[index + 1] === '*') {
            source += '.*';
            index += 1;
            if (normalized[index + 1] === '/') index += 1;
            continue;
        }
        if (normalized[index] === '*') {
            source += '[^/]*';
            continue;
        }
        source += ESCAPE.has(normalized[index]) ? `\\${normalized[index]}` : normalized[index];
    }
    return new RegExp(`^${source}$`, 'i');
}

export function repoRelative(filePath, root) {
    if (!filePath) return '';
    const slash = filePath.replace(/\\/g, '/');
    if (!path.win32.isAbsolute(filePath) && !path.posix.isAbsolute(filePath)) {
        return slash.replace(/^\.\//, '');
    }
    const rootSlash = path.resolve(root).replace(/\\/g, '/');
    const absolute = path.resolve(filePath).replace(/\\/g, '/');
    if (absolute.toLowerCase().startsWith(`${rootSlash.toLowerCase()}/`)) {
        return absolute.slice(rootSlash.length + 1);
    }
    return slash;
}

function loadRoutes() {
    return JSON.parse(fs.readFileSync(ROUTES_PATH, 'utf8'));
}

function matchesGlob(relative, pattern) {
    return globToRegExp(pattern).test(relative.replace(/\\/g, '/'));
}

function merchantHit(relative, merchant) {
    return merchant.some((pattern) => matchesGlob(relative, pattern));
}

function pathSuffixes(token) {
    const slash = token.replace(/\\/g, '/').replace(/^\.\//, '');
    const parts = slash.split('/').filter(Boolean);
    const suffixes = [];
    for (let index = 0; index < parts.length; index += 1) {
        suffixes.push(parts.slice(index).join('/'));
    }
    return suffixes;
}

function tokenIsMerchant(token, merchant) {
    return pathSuffixes(token).some((suffix) => merchantHit(suffix, merchant));
}

function tokensOf(text) {
    return text
        .replace(/\\/g, '/')
        .split(/[\s"'`;|&<>(),]+/)
        .filter(Boolean);
}

export function writesMerchant(command, merchant) {
    const text = command.replace(/\\/g, '/');
    for (const match of text.matchAll(REDIRECT_TARGET)) {
        if (tokenIsMerchant(match[2], merchant)) return true;
    }
    for (const match of text.matchAll(COPY_MOVE)) {
        const args = tokensOf(match[1]).filter((token) => !token.startsWith('-'));
        if (args.length > 1 && tokenIsMerchant(args[args.length - 1], merchant)) return true;
    }
    if (IN_PLACE_WRITERS.some((pattern) => pattern.test(text))) {
        return tokensOf(text).some((token) => tokenIsMerchant(token, merchant));
    }
    return false;
}

function toolPath(toolInput) {
    return toolInput?.file_path || toolInput?.notebook_path || toolInput?.path || '';
}

function addedFromTool(toolInput) {
    return [toolInput?.new_string, toolInput?.content, toolInput?.new_source]
        .filter(Boolean)
        .join('\n');
}

function matchRoutes(routes, relative, addedText) {
    return routes.filter((route) => {
        if (!(route.paths || []).some((pattern) => matchesGlob(relative, pattern))) return false;
        if (!route.diff) return true;
        if (addedText == null) return false;
        return new RegExp(route.diff).test(addedText);
    });
}

function statePath(root, sessionId) {
    const dir = process.env.HARNESS_STATE_DIR || os.tmpdir();
    fs.mkdirSync(dir, { recursive: true });
    const key = crypto
        .createHash('sha256')
        .update(`${path.resolve(root)}\0${sessionId || ''}`)
        .digest('hex')
        .slice(0, 16);
    return path.join(dir, `harness-${key}.json`);
}

function readState(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return {};
    }
}

function writeState(file, state) {
    fs.writeFileSync(file, JSON.stringify(state));
}

function projectRoot(input) {
    if (input.cwd) return path.resolve(input.cwd);
    if (process.env.CLAUDE_PROJECT_DIR) return path.resolve(process.env.CLAUDE_PROJECT_DIR);
    return INSTALL_ROOT;
}

function planPointer(root) {
    const contextPath = path.join(root, 'docs/agent/context.md');
    if (!fs.existsSync(contextPath)) return 'docs/agent/context.md has no plan under execution.';
    const text = fs.readFileSync(contextPath, 'utf8');
    const heading = text.match(/^## Batch .+$/m);
    if (!heading) return 'docs/agent/context.md has no plan under execution.';
    const status = text.match(/^\*\*Status:\*\*.+$/m);
    return ['Plan in docs/agent/context.md:', heading[0], status?.[0]].filter(Boolean).join('\n');
}

function ask(reason) {
    return {
        hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'ask',
            permissionDecisionReason: reason,
        },
    };
}

function contextOutput(eventName, text) {
    return {
        hookSpecificOutput: {
            hookEventName: eventName,
            additionalContext: text,
        },
    };
}

function handlePrompt(input) {
    const root = projectRoot(input);
    const file = statePath(root, input.session_id);
    const state = readState(file);
    if (state.prompted) return null;
    state.prompted = true;
    writeState(file, state);
    return contextOutput('UserPromptSubmit', planPointer(root));
}

function handlePre(input) {
    const tool = input.tool_name || '';
    const routes = loadRoutes();
    if (tool === 'Agent') return ask('Agent tool spawns a subagent.');
    const root = projectRoot(input);
    if (tool === 'Edit' || tool === 'Write' || tool === 'NotebookEdit') {
        const relative = repoRelative(toolPath(input.tool_input), root);
        if (merchantHit(relative, routes.merchant)) return ask(`Merchant-owned path: ${relative}.`);
        return null;
    }
    if (tool === 'Bash' || tool === 'PowerShell') {
        const command = input.tool_input?.command || '';
        if (/\bshopify\s+theme\s+pull\b/.test(command))
            return ask('Command runs shopify theme pull.');
        if (writesMerchant(command, routes.merchant)) {
            return ask('Command writes a merchant-owned path.');
        }
    }
    return null;
}

function handlePost(input) {
    const tool = input.tool_name || '';
    if (tool !== 'Edit' && tool !== 'Write' && tool !== 'NotebookEdit') return null;
    const root = projectRoot(input);
    const relative = repoRelative(toolPath(input.tool_input), root);
    const routes = loadRoutes().routes;
    const matched = matchRoutes(routes, relative, addedFromTool(input.tool_input));
    const file = statePath(root, input.session_id);
    const state = readState(file);
    const seen = new Set(state.pointed || []);
    const fresh = matched.filter((route) => !seen.has(route.id));
    if (fresh.length === 0) return null;
    state.pointed = [...seen, ...fresh.map((route) => route.id)];
    writeState(file, state);
    const lines = fresh.map((route) => {
        const validators = (route.validators || []).join(', ') || 'none';
        const pointers = (route.pointers || []).join(', ') || 'none';
        return `Route ${route.id} matches ${relative}. Validators: ${validators}. Review tier: ${route.tier}. Pointers: ${pointers}.`;
    });
    return contextOutput('PostToolUse', lines.join('\n'));
}

function git(root, args) {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
    if (result.status !== 0) {
        throw new Error((result.stderr || `git ${args.join(' ')} failed`).trim());
    }
    return result.stdout || '';
}

// Git output is read with -z: NUL-separated, never C-quoted, so paths with spaces or
// non-ASCII characters arrive as written.
function statusPaths(status) {
    const entries = status.split('\0');
    const paths = [];
    for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        if (!entry) continue;
        paths.push(entry.slice(3));
        // A rename or copy entry is followed by its original path.
        if (/[RC]/.test(entry.slice(0, 2)) && entries[index + 1]) {
            paths.push(entries[index + 1]);
            index += 1;
        }
    }
    return paths;
}

function nulList(output) {
    return output.split('\0').filter(Boolean);
}

function fingerprint(root) {
    const head = git(root, ['rev-parse', 'HEAD']).trim();
    // -uall lists files inside untracked directories, so their content reaches the hash.
    const status = git(root, ['status', '--porcelain', '-z', '-uall']);
    const hash = crypto.createHash('sha256');
    hash.update(head);
    hash.update('\0');
    hash.update(status);
    for (const relative of statusPaths(status)) {
        const absolute = path.join(root, relative);
        hash.update('\0');
        hash.update(relative);
        if (fs.existsSync(absolute) && fs.statSync(absolute).isFile()) {
            hash.update(fs.readFileSync(absolute));
        }
    }
    return { head, fingerprint: hash.digest('hex') };
}

function changedFiles(root) {
    const tracked = nulList(git(root, ['diff', '--name-only', '-z', 'HEAD']));
    const untracked = nulList(git(root, ['ls-files', '--others', '--exclude-standard', '-z']));
    return [...new Set([...tracked, ...untracked].map((file) => file.replace(/\\/g, '/')))];
}

function addedLines(root, relative) {
    const untracked = nulList(
        git(root, ['ls-files', '--others', '--exclude-standard', '-z', '--', relative]),
    );
    if (untracked.length > 0) {
        const absolute = path.join(root, relative);
        return fs.existsSync(absolute) ? fs.readFileSync(absolute, 'utf8') : '';
    }
    return git(root, ['diff', '-U0', '--', relative])
        .split('\n')
        .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
        .join('\n');
}

function runFastValidator(root, script, budgetMs) {
    const result = spawnSync('npm.cmd', ['run', script], {
        cwd: root,
        encoding: 'utf8',
        timeout: budgetMs,
        shell: true,
        windowsHide: true,
    });
    const timedOut = result.error && result.error.code === 'ETIMEDOUT';
    const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
    return { ok: !timedOut && result.status === 0, timedOut, output };
}

function highestTier(routes) {
    return routes.reduce((best, route) => {
        if (!best || (TIER_RANK[route.tier] || 0) > (TIER_RANK[best] || 0)) return route.tier;
        return best;
    }, null);
}

function cap(text, limit = 1500) {
    if (text.length <= limit) return text;
    return `${text.slice(0, limit)}…`;
}

function handleStop(input) {
    const root = projectRoot(input);
    const file = statePath(root, input.session_id);
    const state = readState(file);
    const current = fingerprint(root);
    if (state.fingerprint === current.fingerprint) return null;

    const changed = changedFiles(root);
    const recordsChanged = changed.some((relative) => RECORD_PATHS.has(relative));
    const headMoved = Boolean(state.head && state.head !== current.head);
    const recordResult =
        recordsChanged || headMoved || !state.fingerprint ? checkRecords(root) : null;

    const failures = [...(recordResult?.failures || [])];
    let owed = [];
    let tier = null;
    if (!input.stop_hook_active) {
        const routes = loadRoutes().routes;
        const matched = [];
        for (const relative of changed) {
            matched.push(...matchRoutes(routes, relative, addedLines(root, relative)));
        }
        const unique = [...new Map(matched.map((route) => [route.id, route])).values()];
        tier = highestTier(unique);
        const validators = [...new Set(unique.flatMap((route) => route.validators || []))];
        const fast = [
            ...new Set(
                unique
                    .flatMap((route) => route.fast || [])
                    .filter((script) => FAST_ALLOWED.has(script)),
            ),
        ];
        owed = validators.filter((script) => !fast.includes(script));
        let budget = STOP_BUDGET_MS;
        for (const script of fast) {
            if (budget < 1000) {
                failures.push(`${script}: stop budget exhausted`);
                break;
            }
            const started = Date.now();
            const result = runFastValidator(root, script, budget);
            budget -= Date.now() - started;
            if (!result.ok) {
                failures.push(
                    `${script}: ${result.timedOut ? 'timed out' : 'failed'}\n${cap(result.output)}`,
                );
            }
        }
    }

    state.fingerprint = current.fingerprint;
    state.head = current.head;
    writeState(file, state);

    const prompts = (recordResult?.notes || []).filter((line) => line.startsWith('prompt:'));
    const report = [
        ...failures.map((line) => `fail: ${line}`),
        ...prompts,
        tier ? `Review tier: ${tier}.` : '',
        owed.length ? `Owed validators: ${owed.join(', ')}.` : '',
    ]
        .filter(Boolean)
        .join('\n');

    if (input.stop_hook_active) {
        if (report) console.error(`harness: ${report.replace(/\n/g, ' | ')}`.slice(0, 500));
        return null;
    }
    // Only failures continue the turn; counts, tier and owed validators go to the user
    // through systemMessage, which costs no model turn.
    const notice = [
        ...prompts,
        tier ? `Review tier: ${tier}.` : '',
        owed.length ? `Owed validators: ${owed.join(', ')}.` : '',
    ]
        .filter(Boolean)
        .join('\n');
    const output = {};
    if (failures.length > 0) {
        output.decision = 'block';
        output.reason = cap(failures.join('\n'));
    }
    if (notice) output.systemMessage = `harness: ${notice}`;
    return Object.keys(output).length ? output : null;
}

const HANDLERS = {
    prompt: handlePrompt,
    pre: handlePre,
    post: handlePost,
    stop: handleStop,
};

function main() {
    const event = process.argv[2];
    let raw = '';
    try {
        raw = fs.readFileSync(0, 'utf8');
    } catch (error) {
        console.error(`harness: ${error.message}`);
        process.exit(0);
    }
    let input;
    try {
        input = JSON.parse(raw.trim() ? raw : '{}');
    } catch {
        console.error('harness: malformed stdin');
        process.exit(0);
    }
    try {
        const handler = HANDLERS[event];
        if (!handler) {
            console.error(`harness: unknown event ${event || '(none)'}`);
            process.exit(0);
        }
        const output = handler(input);
        if (output) process.stdout.write(JSON.stringify(output));
    } catch (error) {
        console.error(`harness: ${error.message}`);
        process.exit(0);
    }
}

const invoked =
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) main();
