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

function rejectionReason(errors) {
    const details = errors.slice(0, 6).join('; ');
    return `Agent result contract validation failed: ${details}. Return only one corrected JSON object that conforms to .agents/contracts/result.schema.json; do not redo the task or change files.`;
}

function evaluateHookEvent(event) {
    if (validatorLoadError) {
        return {
            continue: false,
            stopReason: `Agent result validator could not load: ${validatorLoadError.message}`,
            systemMessage: 'Delegated result validation is unavailable; install project dependencies.',
        };
    }

    const result = validateResultMessage(event?.agent_type, event?.last_assistant_message);
    if (result.valid) return null;

    const reason = rejectionReason(result.errors);
    if (event?.stop_hook_active) {
        return {
            continue: false,
            stopReason: `Agent result remained invalid after one correction attempt: ${reason}`,
            systemMessage: 'Delegated result rejected after the allowed correction attempt.',
        };
    }

    return { decision: 'block', reason };
}

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

async function runHook() {
    const input = await readStdin();
    let event;

    try {
        event = JSON.parse(input);
    } catch (error) {
        process.stdout.write(
            JSON.stringify({
                continue: false,
                stopReason: `SubagentStop hook input was not valid JSON: ${error.message}`,
                systemMessage: 'Agent result validation hook could not parse its event input.',
            }),
        );
        return;
    }

    const response = evaluateHookEvent(event);
    if (response) process.stdout.write(JSON.stringify(response));
}

module.exports = { evaluateHookEvent };

if (require.main === module) {
    runHook().catch((error) => {
        process.stdout.write(
            JSON.stringify({
                continue: false,
                stopReason: `Agent result validation hook failed: ${error.message}`,
                systemMessage: 'Agent result validation hook failed closed.',
            }),
        );
    });
}
