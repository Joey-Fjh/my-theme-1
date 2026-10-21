#!/usr/bin/env node
// Claude Code hook adapter: maps Claude Code hook events onto the harness core and the
// core's decisions onto Claude Code's hook output. No rule logic lives here.
// Errors fail open (exit 0, no output), so a broken hook never blocks this client.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
    cap,
    checkShell,
    checkSubagent,
    checkWrite,
    planContext,
    resolveRoot,
    routeHints,
    runHook,
    stopCheck,
} from '../.agents/tools/harness/core.mjs';

const FILE_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);
const SHELL_TOOLS = new Set(['Bash', 'PowerShell']);

function root(input) {
    return resolveRoot(input.cwd || process.env.CLAUDE_PROJECT_DIR);
}

function filePath(toolInput) {
    return toolInput?.file_path || toolInput?.notebook_path || toolInput?.path || '';
}

function added(toolInput) {
    return [toolInput?.new_string, toolInput?.content, toolInput?.new_source]
        .filter(Boolean)
        .join('\n');
}

function context(eventName, text) {
    if (!text) return null;
    return { hookSpecificOutput: { hookEventName: eventName, additionalContext: text } };
}

function permission({ decision, reason }) {
    if (decision === 'allow') return null;
    return {
        hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: decision,
            permissionDecisionReason: reason,
        },
    };
}

function pre(input) {
    const tool = input.tool_name || '';
    if (tool === 'Agent') return permission(checkSubagent());
    if (FILE_TOOLS.has(tool)) return permission(checkWrite(root(input), [filePath(input.tool_input)]));
    if (SHELL_TOOLS.has(tool)) {
        return permission(checkShell(root(input), input.tool_input?.command || ''));
    }
    return null;
}

function post(input) {
    if (!FILE_TOOLS.has(input.tool_name || '')) return null;
    const edit = { path: filePath(input.tool_input), added: added(input.tool_input) };
    return context('PostToolUse', routeHints(root(input), input.session_id, [edit]));
}

function stop(input) {
    const result = stopCheck(root(input), input.session_id, {
        continued: Boolean(input.stop_hook_active),
    });
    if (!result) return null;
    if (input.stop_hook_active) {
        if (result.report) console.error(`harness: ${result.report.replace(/\n/g, ' | ')}`.slice(0, 500));
        return null;
    }
    // Only failures continue the turn; the notice reaches the user through systemMessage,
    // which costs no model turn.
    const output = {};
    if (result.failures.length > 0) {
        output.decision = 'block';
        output.reason = cap(result.failures.join('\n'));
    }
    if (result.notice) output.systemMessage = `harness: ${result.notice}`;
    return Object.keys(output).length ? output : null;
}

const handlers = {
    prompt: (input) => context('UserPromptSubmit', planContext(root(input), input.session_id)),
    pre,
    post,
    stop,
};

const invoked =
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) runHook({ label: 'harness', handlers });
