#!/usr/bin/env node
// Cursor hook adapter: maps Cursor hook events onto the harness core and the core's
// decisions onto Cursor's hook output. No rule logic lives here.
// Every `ask` becomes a deny: Cursor does not enforce ask on preToolUse or subagentStart,
// and the H6 live check (Cursor 3.26) ran `shopify theme pull` despite an ask from both
// preToolUse and beforeShellExecution, though the docs say the latter enforces it.
// Guard events fail closed (hooks.json sets
// failClosed and errors answer deny). Cursor caches hooks.json and reloads it on save:
// to switch the hooks off, save {"version": 1, "hooks": {}} rather than deleting the file.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    cap,
    checkShell,
    checkSubagent,
    checkWrite,
    doctorReport,
    planContext,
    requireRoot,
    routeHints,
    runHook,
    stopCheck,
} from '../.agents/tools/harness/core.mjs';

const FILE_TOOLS = new Set(['Write', 'StrReplace', 'Edit', 'Delete', 'EditNotebook']);
const SHELL_TOOLS = new Set(['Shell']);
const SUBAGENT_TOOLS = new Set(['Task']);

// tool_input may arrive as an object or as a JSON string.
function fields(value) {
    if (value && typeof value === 'object') return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            if (parsed && typeof parsed === 'object') return parsed;
        } catch {
            // A plain string carries no fields.
        }
    }
    return {};
}

function root(input) {
    const roots = Array.isArray(input.workspace_roots) ? input.workspace_roots : [];
    return requireRoot(input.cwd || roots[0]);
}

function session(input) {
    return input.session_id || input.conversation_id || '';
}

function editOf(toolInput) {
    const input = fields(toolInput);
    return {
        path: input.file_path || input.path || input.target_file || input.target_notebook || '',
        added: [input.new_string, input.content, input.contents].filter(Boolean).join('\n'),
    };
}

function permission({ decision, reason }) {
    if (decision === 'allow') return { permission: 'allow' };
    return { permission: 'deny', user_message: reason, agent_message: reason };
}

const deny = (reason) => permission({ decision: 'deny', reason });

function preToolUse(input) {
    const tool = input.tool_name || '';
    if (FILE_TOOLS.has(tool)) {
        return permission(checkWrite(root(input), [editOf(input.tool_input).path]));
    }
    if (SHELL_TOOLS.has(tool)) {
        return permission(checkShell(root(input), fields(input.tool_input).command || ''));
    }
    if (SUBAGENT_TOOLS.has(tool)) return permission(checkSubagent());
    return { permission: 'allow' };
}

function postToolUse(input) {
    if (!FILE_TOOLS.has(input.tool_name || '')) return null;
    const text = routeHints(root(input), session(input), [editOf(input.tool_input)]);
    return text ? { additional_context: text } : null;
}

// beforeSubmitPrompt cannot add context, so the plan pointer comes with the session start.
function sessionStart(input) {
    const text = [doctorReport(root(input)), planContext(root(input), session(input))]
        .filter(Boolean)
        .join('\n\n');
    return text ? { additional_context: text } : null;
}

// Only failures continue the turn (followup_message; hooks.json caps it at one loop).
// Cursor has no notice-only stop output, so the notice rides along with failures.
// An aborted or failed turn is skipped so it does not consume the worktree fingerprint.
function stop(input) {
    if (input.status === 'aborted' || input.status === 'error') return null;
    const continued = Number(input.loop_count) > 0;
    const result = stopCheck(root(input), session(input), { continued });
    if (!result || continued || result.failures.length === 0) return null;
    const message = [result.failures.join('\n'), result.notice ? `harness: ${result.notice}` : '']
        .filter(Boolean)
        .join('\n');
    return { followup_message: cap(message) };
}

const handlers = {
    sessionStart,
    preToolUse,
    beforeShellExecution: (input) => permission(checkShell(root(input), input.command || '')),
    subagentStart: () => permission(checkSubagent()),
    postToolUse,
    stop,
};

const invoked =
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) {
    runHook({
        label: 'cursor-hook',
        handlers,
        guardEvents: new Set(['preToolUse', 'beforeShellExecution', 'subagentStart']),
        denyOutput: deny,
    });
}
