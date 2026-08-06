const assert = require('node:assert/strict');
const { evaluateHookEvent } = require('../../../../.codex/hooks/validate-agent-result.cjs');
const {
    evaluateCursorHookEvent,
    parseHookInput,
    resolveAgentType,
} = require('../../../../.cursor/hooks/validate-agent-result.cjs');

function validResult(overrides = {}) {
    return {
        task_id: 'agent-hook-smoke-scout',
        context_version: 'agent-hook-smoke-v1',
        role: 'scout',
        status: 'complete',
        output_contract: 'evidence-report',
        summary: 'Read-only discovery completed.',
        evidence: [
            {
                kind: 'file',
                reference: 'AGENTS.md',
                line: 1,
                detail: 'Repository rules were found.',
            },
        ],
        files_changed: [],
        commands: [],
        blockers: [],
        risks: [],
        next_action: null,
        ...overrides,
    };
}

const validResponse = evaluateHookEvent({
    agent_type: 'scout',
    stop_hook_active: false,
    last_assistant_message: JSON.stringify(validResult()),
});
assert.equal(validResponse, null, 'valid result must be accepted');

const malformedResponse = evaluateHookEvent({
    agent_type: 'scout',
    stop_hook_active: false,
    last_assistant_message: '{not-json}',
});
assert.equal(malformedResponse.decision, 'block', 'malformed JSON must be returned for correction');

const invalidPayload = validResult();
invalidPayload.evidence[0]['.reference'] = invalidPayload.evidence[0].reference;
delete invalidPayload.evidence[0].reference;
const invalidResponse = evaluateHookEvent({
    agent_type: 'scout',
    stop_hook_active: false,
    last_assistant_message: JSON.stringify(invalidPayload),
});
assert.equal(invalidResponse.decision, 'block', 'schema-invalid result must be returned');
assert.match(invalidResponse.reason, /reference/, 'schema error must identify the bad field');

const retryResponse = evaluateHookEvent({
    agent_type: 'scout',
    stop_hook_active: true,
    last_assistant_message: JSON.stringify(invalidPayload),
});
assert.equal(retryResponse.continue, false, 'a second invalid result must fail closed');

const mismatchedRoleResponse = evaluateHookEvent({
    agent_type: 'validator',
    stop_hook_active: false,
    last_assistant_message: JSON.stringify(validResult()),
});
assert.equal(mismatchedRoleResponse.decision, 'block', 'agent role mismatch must be rejected');

const cursorValidResponse = evaluateCursorHookEvent({
    subagent_type: 'scout',
    status: 'completed',
    loop_count: 0,
    summary: JSON.stringify(validResult()),
});
assert.equal(cursorValidResponse, null, 'valid Cursor result must be accepted');

const cursorMalformedResponse = evaluateCursorHookEvent({
    subagent_type: 'scout',
    status: 'completed',
    loop_count: 0,
    summary: '{not-json}',
});
assert.match(
    cursorMalformedResponse.followup_message,
    /Return only one corrected JSON object/,
    'malformed Cursor result must receive one correction request',
);

const cursorMismatchedRoleResponse = evaluateCursorHookEvent({
    subagent_type: 'validator',
    status: 'completed',
    loop_count: 0,
    summary: JSON.stringify(validResult()),
});
assert.match(
    cursorMismatchedRoleResponse.followup_message,
    /expected validator/,
    'Cursor agent role mismatch must receive a correction request',
);

const cursorRetryResponse = evaluateCursorHookEvent({
    subagent_type: 'scout',
    status: 'completed',
    loop_count: 1,
    summary: JSON.stringify(invalidPayload),
});
assert.equal(cursorRetryResponse.exitCode, 2, 'a second invalid Cursor result must fail closed');

const cursorUnrelatedResponse = evaluateCursorHookEvent({
    subagent_type: 'generalPurpose',
    status: 'completed',
    loop_count: 0,
    summary: 'Unrelated built-in subagent result.',
});
assert.equal(cursorUnrelatedResponse, null, 'unrelated Cursor subagents must be ignored');

const cursorFailedResponse = evaluateCursorHookEvent({
    subagent_type: 'scout',
    status: 'error',
    loop_count: 0,
    summary: '{not-json}',
});
assert.equal(cursorFailedResponse, null, 'failed Cursor tasks cannot enter correction loops');

assert.equal(
    resolveAgentType({ subagent_type: 'docs-steward' }),
    'docs_steward',
    'Cursor docs-steward name must map to the shared validator alias',
);

assert.equal(
    resolveAgentType({
        subagent_type: 'generalPurpose',
        task: 'Task capsule: {"role":"verifier","objective":"Review the change."}',
    }),
    'verifier',
    'Cursor generic subagent type must fall back to the parent task capsule role',
);

assert.equal(
    resolveAgentType({
        subagent_type: 'generalPurpose',
        description: '[project-role:validator] Run approved checks',
    }),
    'validator',
    'Cursor generic subagent type must support the explicit project-role marker',
);

const cursorHookPayload = JSON.stringify({
    subagent_type: 'scout',
    status: 'completed',
    loop_count: 0,
    summary: JSON.stringify(validResult()),
});
assert.equal(
    parseHookInput(cursorHookPayload).subagent_type,
    'scout',
    'Cursor hook must parse standard JSON input',
);
assert.equal(
    parseHookInput(`,${cursorHookPayload.slice(1)}`).subagent_type,
    'scout',
    'Cursor hook must parse the observed Windows temp-file JSON fragment',
);

console.log('Agent result hook tests passed (16 cases across Codex and Cursor).');
