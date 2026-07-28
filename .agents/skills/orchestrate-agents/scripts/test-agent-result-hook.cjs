const assert = require('node:assert/strict');
const { evaluateHookEvent } = require('../../../../.codex/hooks/validate-agent-result.cjs');

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

console.log('Agent result hook tests passed (5 cases).');
