#!/usr/bin/env node
// Codex hook adapter: maps Codex hook events onto the harness core and the core's
// decisions onto Codex's hook output. No rule logic lives here.
// Codex has no `ask` (it reports one as a hook failure and runs the tool), so an ask
// becomes a deny. PreToolUse fails closed: errors answer deny. Codex runs the command
// from the session cwd through cmd.exe on Windows, so start Codex at the repository root.
// Codex runs a project hook only after the user trusts it: it hashes each hook's TOML entry
// and compares it with `hooks.state.<key>.trusted_hash` in the user's ~/.codex/config.toml.
// A changed entry is skipped silently until trusted again (startup "Trust All and Continue",
// or `/hooks` then `t`). Editing this file does not change the hash; editing config.toml does.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    cap,
    checkShell,
    checkWrite,
    doctorReport,
    planContext,
    requireRoot,
    routeHints,
    runHook,
    stopCheck,
} from '../.agents/tools/harness/core.mjs';

const PATCH_HEADER = /^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+?)\s*$/;

// apply_patch text → one entry per target ({ path, added }); a Move yields its source
// (Update File) and its destination (Move to).
export function patchEdits(patch) {
    if (typeof patch !== 'string') return [];
    const edits = [];
    for (const line of patch.split(/\r?\n/)) {
        const header = line.match(PATCH_HEADER);
        if (header) {
            edits.push({ path: header[1], added: '' });
        } else if (edits.length && line.startsWith('+')) {
            const edit = edits[edits.length - 1];
            edit.added += `${line.slice(1)}\n`;
        }
    }
    return edits;
}

function root(input) {
    return requireRoot(input.cwd);
}

function command(toolInput) {
    const value = toolInput?.command;
    return Array.isArray(value) ? value.join(' ') : value || '';
}

function context(eventName, text) {
    if (!text) return null;
    return { hookSpecificOutput: { hookEventName: eventName, additionalContext: text } };
}

function deny(reason) {
    return {
        hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: reason,
        },
    };
}

function permission({ decision, reason }) {
    return decision === 'allow' ? null : deny(reason);
}

function preToolUse(input) {
    const tool = input.tool_name || '';
    if (tool === 'Bash') return permission(checkShell(root(input), command(input.tool_input)));
    if (tool !== 'apply_patch') return null;
    const edits = patchEdits(command(input.tool_input));
    if (edits.length === 0) return deny('codex-hook: no apply_patch target paths found.');
    return permission(
        checkWrite(
            root(input),
            edits.map((edit) => edit.path),
        ),
    );
}

function postToolUse(input) {
    if (input.tool_name !== 'apply_patch') return null;
    const edits = patchEdits(command(input.tool_input));
    return context('PostToolUse', routeHints(root(input), input.session_id, edits));
}

// Only failures continue the turn; Codex has no notice-only stop output, so the notice
// rides along with failures.
function stop(input) {
    const continued = Boolean(input.stop_hook_active);
    const result = stopCheck(root(input), input.session_id, { continued });
    if (!result || continued || result.failures.length === 0) return null;
    const reason = [result.failures.join('\n'), result.notice ? `harness: ${result.notice}` : '']
        .filter(Boolean)
        .join('\n');
    return { decision: 'block', reason: cap(reason) };
}

const handlers = {
    sessionStart: (input) => context('SessionStart', doctorReport(root(input))),
    prompt: (input) => context('UserPromptSubmit', planContext(root(input), input.session_id)),
    preToolUse,
    postToolUse,
    stop,
};

const invoked =
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) {
    runHook({
        label: 'codex-hook',
        handlers,
        guardEvents: new Set(['preToolUse']),
        denyOutput: deny,
    });
}
