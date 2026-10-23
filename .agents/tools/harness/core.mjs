// Client-neutral harness core. Each client's adapter, in that client's own directory,
// maps its hook events and payloads onto these functions and maps the returned
// decisions onto its own output. Decisions are { decision: 'allow' | 'ask' | 'deny', reason }.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { boardTopics, checkRecords } from './record-check.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const INSTALL_ROOT = path.resolve(HERE, '../../..');
const ROUTES_PATH = path.join(HERE, 'routes.json');
const DOCTOR = path.join(INSTALL_ROOT, '.agents/tools/doctor-agent.mjs');
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

const ALLOW = Object.freeze({ decision: 'allow', reason: '' });
const ask = (reason) => ({ decision: 'ask', reason });
const deny = (reason) => ({ decision: 'deny', reason });

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

// A workspace root may arrive URI-style (`/d:/repo`); path.resolve would turn that into
// D:\d:\repo, and on POSIX treat `d:/repo` as relative. Without a root, the repository this
// file belongs to is used.
export function resolveRoot(candidate) {
    if (typeof candidate !== 'string' || !candidate) return INSTALL_ROOT;
    const drive = candidate.replace(/\\/g, '/').match(/^\/([A-Za-z]:\/.*)$/);
    return drive ? path.win32.normalize(drive[1]) : path.resolve(candidate);
}

// Like resolveRoot, but a payload without a root is an error, so a guard that cannot tell
// which repository it protects fails closed instead of guessing.
export function requireRoot(candidate) {
    if (typeof candidate !== 'string' || !candidate) throw new Error('no workspace root');
    return resolveRoot(candidate);
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

function planPointer(root) {
    const contextPath = path.join(root, 'docs/agent/context.md');
    if (!fs.existsSync(contextPath)) return 'docs/agent/context.md has no plan under execution.';
    const text = fs.readFileSync(contextPath, 'utf8');
    const heading = text.match(/^## Batch .+$/m);
    if (!heading) return 'docs/agent/context.md has no plan under execution.';
    const status = text.match(/^\*\*Status:\*\*.+$/m);
    return ['Plan in docs/agent/context.md:', heading[0], status?.[0]].filter(Boolean).join('\n');
}

// Open board topics and the one waiting longest, so drift is visible at session start.
function boardPointer(root) {
    const boardPath = path.join(root, 'docs/agent/board.md');
    if (!fs.existsSync(boardPath)) return null;
    const topics = boardTopics(fs.readFileSync(boardPath, 'utf8')).filter((topic) => topic.updated);
    if (topics.length === 0) return 'board: no open topics.';
    const oldest = topics.reduce((a, b) => (b.updated < a.updated ? b : a));
    return `board: ${topics.length} open topics; oldest updated ${oldest.updated} (${oldest.title}).`;
}

export function cap(text, limit = 1500) {
    if (text.length <= limit) return text;
    return `${text.slice(0, limit)}…`;
}

// The plan pointer, once per session.
export function planContext(root, sessionId) {
    const file = statePath(root, sessionId);
    const state = readState(file);
    if (state.prompted) return null;
    state.prompted = true;
    writeState(file, state);
    return [planPointer(root), boardPointer(root)].filter(Boolean).join('\n');
}

// The doctor's hook report, for clients without a separate session-start command.
export function doctorReport(root) {
    const result = spawnSync(process.execPath, [DOCTOR, '--hook'], {
        cwd: root,
        encoding: 'utf8',
        timeout: 15_000,
        windowsHide: true,
    });
    if (result.error) return null;
    return (result.stdout || '').trim() || null;
}

export function checkSubagent() {
    return ask('Agent tool spawns a subagent.');
}

export function checkWrite(root, filePaths) {
    const { merchant } = loadRoutes();
    for (const filePath of filePaths) {
        const relative = repoRelative(filePath, root);
        if (merchantHit(relative, merchant)) return ask(`Merchant-owned path: ${relative}.`);
    }
    return ALLOW;
}

// Before a push: the record checks and whitespace errors in the commits being pushed,
// so CI does not go red on what the stop check only sees after the turn.
export function prePushFailures(root) {
    const failures = [...checkRecords(root).failures];
    const run = (args) =>
        spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
    if (run(['rev-parse', '--verify', '--quiet', '@{upstream}']).status === 0) {
        const check = run(['diff', '--check', '@{upstream}...HEAD']);
        // Only reported whitespace errors block; a git failure (stderr, no report) fails open.
        const report = (check.stdout || '').trim();
        if (check.status !== 0 && report) failures.push(`git diff --check:\n${report}`);
    }
    return failures;
}

// Git global options that take a separate value (`git -C dir push`).
const GIT_OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace']);

// Splits a command segment into words, keeping quoted spans (paths with spaces) whole.
function shellWords(segment) {
    return (segment.match(/(?:"[^"]*"|'[^']*'|[^\s"'])+/g) || []).map((word) =>
        word.replace(/"([^"]*)"|'([^']*)'/g, '$1$2'),
    );
}

// True when a command segment runs `git push`, allowing `git.exe`, a quoted program path
// and global options before the subcommand; `echo git push` or `git pushd` do not count.
export function runsGitPush(command) {
    for (const segment of command.split(/&&|\|\||[;|\n]/)) {
        const tokens = shellWords(segment.trim().replace(/^&\s*/, ''));
        if (!tokens.length) continue;
        const program = tokens[0].replace(/\\/g, '/').split('/').pop();
        if (!/^git(\.exe)?$/i.test(program)) continue;
        let index = 1;
        while (index < tokens.length && tokens[index].startsWith('-')) {
            index += GIT_OPTIONS_WITH_VALUE.has(tokens[index]) ? 2 : 1;
        }
        if (tokens[index] === 'push') return true;
    }
    return false;
}

export function checkShell(root, command) {
    const { merchant } = loadRoutes();
    if (runsGitPush(command)) {
        const failures = prePushFailures(root);
        if (failures.length > 0) return deny(cap(`Push blocked:\n${failures.join('\n')}`));
    }
    if (/\bshopify\s+theme\s+pull\b/.test(command)) return ask('Command runs shopify theme pull.');
    if (writesMerchant(command, merchant)) return ask('Command writes a merchant-owned path.');
    return ALLOW;
}

// Route hints for edited files ({ path, added }), each route once per session.
export function routeHints(root, sessionId, edits) {
    const routes = loadRoutes().routes;
    const file = statePath(root, sessionId);
    const state = readState(file);
    const seen = new Set(state.pointed || []);
    const lines = [];
    for (const edit of edits) {
        const relative = repoRelative(edit.path, root);
        const fresh = matchRoutes(routes, relative, edit.added).filter(
            (route) => !seen.has(route.id),
        );
        for (const route of fresh) {
            seen.add(route.id);
            const validators = (route.validators || []).join(', ') || 'none';
            const pointers = (route.pointers || []).join(', ') || 'none';
            const tier = route.stylesheetTier
                ? `${route.tier} (${route.stylesheetTier} when only the {% stylesheet %} block changes)`
                : route.tier;
            lines.push(
                `Route ${route.id} matches ${relative}. Validators: ${validators}. Review tier: ${tier}. Pointers: ${pointers}.`,
            );
        }
    }
    if (lines.length === 0) return null;
    state.pointed = [...seen];
    writeState(file, state);
    return lines.join('\n');
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

const STYLESHEET_OPEN = /\{%-?\s*stylesheet\s*-?%\}/;
const STYLESHEET_CLOSE = /\{%-?\s*endstylesheet\s*-?%\}/;

// 1-based numbers of the lines between a {% stylesheet %} tag and its end tag.
function stylesheetLines(text) {
    const inside = new Set();
    let open = false;
    text.split('\n').forEach((line, index) => {
        if (open && STYLESHEET_CLOSE.test(line)) open = false;
        else if (open) inside.add(index + 1);
        else if (STYLESHEET_OPEN.test(line)) open = true;
    });
    return inside;
}

// True when a tracked Liquid file changed only inside its {% stylesheet %} block: every
// removed line (in HEAD) and every added line (in the worktree) lies inside the block.
export function stylesheetOnly(root, relative) {
    if (!relative.toLowerCase().endsWith('.liquid')) return false;
    const absolute = path.join(root, relative);
    const head = spawnSync('git', ['show', `HEAD:${relative}`], {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
    });
    if (head.status !== 0 || !fs.existsSync(absolute)) return false;
    const hunks = [
        ...git(root, ['diff', '-U0', 'HEAD', '--', relative]).matchAll(
            /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm,
        ),
    ];
    if (hunks.length === 0) return false;
    const before = stylesheetLines(head.stdout);
    const after = stylesheetLines(fs.readFileSync(absolute, 'utf8'));
    const inside = (lines, start, count) => {
        for (let line = start; line < start + count; line += 1) {
            if (!lines.has(line)) return false;
        }
        return true;
    };
    return hunks.every(
        ([, oldStart, oldCount = '1', newStart, newCount = '1']) =>
            inside(before, Number(oldStart), Number(oldCount)) &&
            inside(after, Number(newStart), Number(newCount)),
    );
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

// End-of-turn check. Null when the worktree is unchanged since the last check. Otherwise
// `failures` should continue the turn, `notice` (record prompts, review tier, owed
// validators) is for the user only, and `report` is both. `continued` marks a turn the
// check itself already continued: validators are skipped so it cannot loop.
export function stopCheck(root, sessionId, { continued = false } = {}) {
    const file = statePath(root, sessionId);
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
    if (!continued) {
        const routes = loadRoutes().routes;
        const matched = [];
        for (const relative of changed) {
            for (const route of matchRoutes(routes, relative, addedLines(root, relative))) {
                // The AGENTS.md review tiers: a Liquid change confined to its stylesheet is Show.
                const lowered = route.stylesheetTier && stylesheetOnly(root, relative);
                matched.push(lowered ? { ...route, tier: route.stylesheetTier } : route);
            }
        }
        const unique = [...new Map(matched.map((route) => [route.id, route])).values()];
        tier = highestTier(matched);
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

    const notice = [
        tier ? `Review tier: ${tier}.` : '',
        owed.length ? `Owed validators: ${owed.join(', ')}.` : '',
    ]
        .filter(Boolean)
        .join('\n');
    const report = [...failures.map((line) => `fail: ${line}`), notice].filter(Boolean).join('\n');
    return { failures, notice, report };
}

function swap16(buffer) {
    const length = buffer.length - (buffer.length % 2);
    const swapped = Buffer.alloc(length);
    for (let index = 0; index < length; index += 2) {
        swapped[index] = buffer[index + 1];
        swapped[index + 1] = buffer[index];
    }
    return swapped;
}

// Hook stdin as text: UTF-8 with or without a BOM (observed on Windows), or UTF-16
// detected by its BOM or by NUL bytes.
export function decodeInput(buffer) {
    if (!buffer || buffer.length === 0) return '';
    if (buffer[0] === 0xff && buffer[1] === 0xfe) return buffer.subarray(2).toString('utf16le');
    if (buffer[0] === 0xfe && buffer[1] === 0xff) {
        return swap16(buffer.subarray(2)).toString('utf16le');
    }
    if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
        return buffer.subarray(3).toString('utf8');
    }
    if (buffer.includes(0)) {
        let even = 0;
        let odd = 0;
        for (let index = 0; index + 1 < buffer.length; index += 2) {
            if (buffer[index] === 0) even += 1;
            if (buffer[index + 1] === 0) odd += 1;
        }
        if (odd > even) return buffer.toString('utf16le');
        if (even > odd) return swap16(buffer).toString('utf16le');
    }
    return buffer.toString('utf8');
}

export function parseInput(buffer) {
    const text = decodeInput(buffer).trim();
    if (!text) return {};
    try {
        const value = JSON.parse(text);
        return value && typeof value === 'object' ? value : {};
    } catch {
        throw new Error('malformed stdin');
    }
}

// Runs one hook invocation: event from argv, payload from stdin, output as JSON on stdout,
// exit code 0. On any error the message goes to stderr under `label`; for an event in
// `guardEvents`, `denyOutput(reason)` is written as well, so a guard fails closed. With a
// `denyOutput`, an empty payload on a guard event is an error too.
export function runHook({ label, handlers, guardEvents = new Set(), denyOutput = null }) {
    const event = process.argv[2];
    const fail = (message) => {
        console.error(`${label}: ${message}`);
        if (denyOutput && guardEvents.has(event)) {
            process.stdout.write(JSON.stringify(denyOutput(`${label}: ${message}`)));
        }
    };
    const handler = handlers[event];
    if (!handler) return fail(`unknown event ${event || '(none)'}`);
    let input;
    try {
        input = parseInput(fs.readFileSync(0));
    } catch (error) {
        return fail(error.message);
    }
    if (denyOutput && guardEvents.has(event) && Object.keys(input).length === 0) {
        return fail('empty stdin');
    }
    try {
        const output = handler(input);
        if (output) process.stdout.write(JSON.stringify(output));
    } catch (error) {
        fail(error.message);
    }
}
