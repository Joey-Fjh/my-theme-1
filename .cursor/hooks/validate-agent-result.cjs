const path = require('node:path');

const validatorPath = path.resolve(
    __dirname,
    '..',
    '..',
    '.agents',
    'skills',
    'orchestrate-agents',
    'scripts',
    'agent-result-validator.cjs',
);

let validateResultMessage;
let validatorLoadError;
try {
    ({ validateResultMessage } = require(validatorPath));
} catch (error) {
    validatorLoadError = error;
}

const cursorAgentAliases = {
    scout: 'scout',
    implementer: 'implementer',
    validator: 'validator',
    verifier: 'verifier',
    'docs-steward': 'docs_steward',
    docs_steward: 'docs_steward',
};

function rejectionReason(errors) {
    const details = errors.slice(0, 6).join('; ');
    return `Agent result contract validation failed: ${details}. Return only one corrected JSON object that conforms to .agents/contracts/result.schema.json; do not redo the task or change files.`;
}

function roleFromTask(task) {
    if (task && typeof task === 'object') {
        return cursorAgentAliases[String(task.role || '').trim().toLowerCase()] || null;
    }
    if (typeof task !== 'string') return null;

    const roleMatch = task.match(
        /["']role["']\s*:\s*["'](scout|implementer|validator|verifier|docs-steward|docs_steward)["']/i,
    );
    return roleMatch ? cursorAgentAliases[roleMatch[1].toLowerCase()] : null;
}

function roleFromDescription(description) {
    if (typeof description !== 'string') return null;
    const roleMatch = description.match(
        /\[project-role:(scout|implementer|validator|verifier|docs-steward|docs_steward)\]/i,
    );
    return roleMatch ? cursorAgentAliases[roleMatch[1].toLowerCase()] : null;
}

function resolveAgentType(event) {
    const candidate = String(event?.subagent_type || '').trim().toLowerCase();
    return (
        cursorAgentAliases[candidate] ||
        roleFromTask(event?.task) ||
        roleFromDescription(event?.description)
    );
}

function evaluateCursorHookEvent(event) {
    if (event?.status !== 'completed') return null;

    const agentType = resolveAgentType(event);
    if (!agentType) return null;

    if (validatorLoadError) {
        return {
            exitCode: 2,
            error: `Agent result validator could not load: ${validatorLoadError.message}`,
        };
    }

    const result = validateResultMessage(agentType, event?.summary);
    if (result.valid) return null;

    const reason = rejectionReason(result.errors);
    if (Number(event?.loop_count || 0) >= 1) {
        return {
            exitCode: 2,
            error: `Agent result remained invalid after one correction attempt: ${reason}`,
        };
    }

    return { followup_message: reason };
}

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

function parseHookInput(input) {
    const source = String(input || '')
        .replace(/^\uFEFF/, '')
        .trim();
    const candidates = [source];
    const windowsFragment = source.replace(/^,\s*/, '');

    if (!windowsFragment.startsWith('{') && /^"[^"]+"\s*:/.test(windowsFragment)) {
        candidates.push(
            windowsFragment.endsWith('}')
                ? `{${windowsFragment}`
                : `{${windowsFragment}}`,
        );
    }

    let lastError;
    for (const candidate of candidates) {
        try {
            const event = JSON.parse(candidate);
            if (event && typeof event === 'object' && !Array.isArray(event)) return event;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error('hook input must be a JSON object');
}

async function runHook() {
    const input = await readStdin();
    let event;

    try {
        event = parseHookInput(input);
    } catch (error) {
        process.stderr.write(`subagentStop hook input was not valid JSON: ${error.message}`);
        process.exitCode = 2;
        return;
    }

    const response = evaluateCursorHookEvent(event);
    if (!response) {
        process.stdout.write('{}');
        return;
    }

    if (response.exitCode) {
        process.stderr.write(response.error);
        process.exitCode = response.exitCode;
        return;
    }

    process.stdout.write(JSON.stringify(response));
}

module.exports = {
    evaluateCursorHookEvent,
    parseHookInput,
    resolveAgentType,
    roleFromDescription,
    roleFromTask,
};

if (require.main === module) {
    runHook().catch((error) => {
        process.stderr.write(`Agent result validation hook failed: ${error.message}`);
        process.exitCode = 2;
    });
}
