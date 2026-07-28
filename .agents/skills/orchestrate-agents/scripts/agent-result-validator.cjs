const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const schemaPath = path.join(projectRoot, '.agents', 'contracts', 'result.schema.json');
const resultSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const agentExpectations = {
    scout: { role: 'scout', outputContract: 'evidence-report' },
    implementer: { role: 'implementer', outputContract: 'implementation-result' },
    validator: { role: 'validator', outputContract: 'validation-result' },
    verifier: { role: 'verifier', outputContract: 'review-result' },
    docs_steward: { role: 'docs-steward', outputContract: 'documentation-result' },
};

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateSchema = ajv.compile(resultSchema);

function formatSchemaError(error) {
    const location = error.instancePath || '/';

    if (error.keyword === 'additionalProperties') {
        return `${location}: unexpected property ${error.params.additionalProperty}`;
    }
    if (error.keyword === 'required') {
        return `${location}: missing required property ${error.params.missingProperty}`;
    }
    return `${location}: ${error.message}`;
}

function validateResultPayload(agentType, payload) {
    const errors = [];
    const expectation = agentExpectations[agentType];

    if (!expectation) {
        errors.push(`unsupported agent type: ${agentType || '<missing>'}`);
    }

    if (!validateSchema(payload)) {
        errors.push(...validateSchema.errors.map(formatSchemaError));
    }

    if (expectation && payload && typeof payload === 'object') {
        if (payload.role !== expectation.role) {
            errors.push(
                `/role: expected ${expectation.role} for agent type ${agentType}, received ${payload.role}`,
            );
        }
        if (payload.output_contract !== expectation.outputContract) {
            errors.push(
                `/output_contract: expected ${expectation.outputContract} for agent type ${agentType}, received ${payload.output_contract}`,
            );
        }
    }

    return { valid: errors.length === 0, errors };
}

function validateResultMessage(agentType, message) {
    if (typeof message !== 'string' || !message.trim()) {
        return { valid: false, errors: ['result must be a non-empty JSON string'] };
    }

    let payload;
    try {
        payload = JSON.parse(message);
    } catch (error) {
        return { valid: false, errors: [`result is not valid JSON: ${error.message}`] };
    }

    return validateResultPayload(agentType, payload);
}

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

async function runCli() {
    const agentType = process.argv[2];
    const message = await readStdin();
    const result = validateResultMessage(agentType, message);

    if (!result.valid) {
        console.error('Agent result contract validation failed:');
        result.errors.forEach((error) => console.error(`- ${error}`));
        process.exitCode = 1;
        return;
    }

    console.log(`Agent result contract passed for ${agentType}.`);
}

module.exports = {
    agentExpectations,
    validateResultMessage,
    validateResultPayload,
};

if (require.main === module) {
    runCli().catch((error) => {
        console.error(`Agent result validator failed: ${error.message}`);
        process.exitCode = 1;
    });
}
