const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const errors = [];

const requiredRoles = [
    'orchestrator',
    'scout',
    'implementer',
    'validator',
    'verifier',
    'docs-steward',
];
const codexAgents = requiredRoles.filter((role) => role !== 'orchestrator');
const delegatedRoles = [...codexAgents];
const codexHookMatcher = '^(scout|implementer|validator|verifier|docs_steward)$';
const agentLintCommand =
    'node .agents/skills/orchestrate-agents/scripts/lint-agent-system.js && node .agents/skills/orchestrate-agents/scripts/test-agent-result-hook.cjs';
const codexAgentExpectations = {
    scout: {
        name: 'scout',
        model: 'gpt-5.6-terra',
        effort: 'low',
        sandbox: 'read-only',
    },
    implementer: {
        name: 'implementer',
        model: 'gpt-5.6-terra',
        effort: 'high',
        sandbox: 'workspace-write',
    },
    validator: {
        name: 'validator',
        model: 'gpt-5.6-terra',
        effort: 'low',
        sandbox: 'read-only',
    },
    verifier: {
        name: 'verifier',
        model: 'gpt-5.6-sol',
        effort: 'high',
        sandbox: 'read-only',
    },
    'docs-steward': {
        name: 'docs_steward',
        model: 'gpt-5.6-terra',
        effort: 'medium',
        sandbox: 'workspace-write',
    },
};

const requiredGovernanceFiles = [
    'AGENTS.md',
    '.agents/skills/agent-router/SKILL.md',
    'docs/references/agent-workflow/collaboration-standard.md',
    'docs/references/agent-workflow/skill-routing.md',
    'docs/references/agent-workflow/multi-agent-architecture.md',
];

function relative(filePath) {
    return path.relative(root, filePath).replaceAll('\\', '/');
}

function fail(filePath, message) {
    errors.push(`${relative(filePath)}: ${message}`);
}

function readRequired(relativePath) {
    const filePath = path.join(root, relativePath);
    if (!fs.existsSync(filePath)) {
        fail(filePath, 'required file is missing');
        return '';
    }
    return fs.readFileSync(filePath, 'utf8');
}

function parseFrontmatter(filePath, source) {
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) {
        fail(filePath, 'missing YAML frontmatter');
        return new Map();
    }

    const values = new Map();
    match[1].split(/\r?\n/).forEach((line) => {
        const separator = line.indexOf(':');
        if (separator === -1) return;
        values.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
    });
    return values;
}

function validateSkill() {
    const relativePath = '.agents/skills/orchestrate-agents/SKILL.md';
    const filePath = path.join(root, relativePath);
    const source = readRequired(relativePath);
    if (!source) return;

    const frontmatter = parseFrontmatter(filePath, source);
    if (frontmatter.get('name') !== 'orchestrate-agents') {
        fail(filePath, 'frontmatter name must be orchestrate-agents');
    }
    if (!frontmatter.get('description')) {
        fail(filePath, 'frontmatter description is required');
    }
    if (/\[TODO|TODO\]/.test(source)) {
        fail(filePath, 'template TODO markers remain');
    }

    const openaiPath = '.agents/skills/orchestrate-agents/agents/openai.yaml';
    const openaiFile = path.join(root, openaiPath);
    const openaiSource = readRequired(openaiPath);
    if (openaiSource && !openaiSource.includes('$orchestrate-agents')) {
        fail(openaiFile, 'default_prompt must mention $orchestrate-agents');
    }
}

function validateRoles() {
    requiredRoles.forEach((role) => {
        const relativePath = `.agents/roles/${role}.md`;
        const filePath = path.join(root, relativePath);
        const source = readRequired(relativePath);
        if (!source) return;

        const frontmatter = parseFrontmatter(filePath, source);
        const requiredFields = [
            'name',
            'description',
            'capability-profile',
            'reasoning-profile',
            'filesystem-profile',
        ];
        requiredFields.forEach((field) => {
            if (!frontmatter.get(field)) fail(filePath, `frontmatter ${field} is required`);
        });
        if (frontmatter.get('name') !== role) {
            fail(filePath, `frontmatter name must be ${role}`);
        }
        if (!source.includes('.agents/contracts/result.schema.json')) {
            fail(filePath, 'role must reference the shared result contract');
        }
        if (role !== 'orchestrator' && !source.includes('Return only one JSON object')) {
            fail(filePath, 'delegated role must require a JSON-only result');
        }
    });
}

function validateSchemas() {
    ['task.schema.json', 'result.schema.json'].forEach((name) => {
        const relativePath = `.agents/contracts/${name}`;
        const filePath = path.join(root, relativePath);
        const source = readRequired(relativePath);
        if (!source) return;

        try {
            const schema = JSON.parse(source);
            if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
                fail(filePath, 'must declare JSON Schema draft 2020-12');
            }
            if (schema.type !== 'object' || schema.additionalProperties !== false) {
                fail(filePath, 'root schema must be a closed object');
            }
            const requiredFields =
                name === 'task.schema.json'
                    ? [
                          'task_id',
                          'parent_task_id',
                          'context_version',
                          'role',
                          'objective',
                          'scope',
                          'inputs',
                          'allowed_actions',
                          'prohibited_actions',
                          'acceptance_criteria',
                          'validation_commands',
                          'stop_conditions',
                          'output_contract',
                          'allow_nested_delegation',
                          'budget',
                      ]
                    : [
                          'task_id',
                          'context_version',
                          'role',
                          'status',
                          'output_contract',
                          'summary',
                          'evidence',
                          'files_changed',
                          'commands',
                          'blockers',
                          'risks',
                          'next_action',
                      ];
            requiredFields.forEach((field) => {
                if (!schema.required?.includes(field)) {
                    fail(filePath, `required field is missing: ${field}`);
                }
            });
            delegatedRoles.forEach((role) => {
                if (!schema.properties?.role?.enum?.includes(role)) {
                    fail(filePath, `role enum is missing: ${role}`);
                }
            });
            if (
                name === 'task.schema.json' &&
                schema.properties?.allow_nested_delegation?.const !== false
            ) {
                fail(filePath, 'allow_nested_delegation must be fixed to false');
            }
        } catch (error) {
            fail(filePath, `invalid JSON: ${error.message}`);
        }
    });
}

function validateCodexAgents() {
    const adapterDirectory = path.join(root, '.codex/agents');
    if (fs.existsSync(adapterDirectory)) {
        const actualAdapters = fs
            .readdirSync(adapterDirectory)
            .filter((name) => name.endsWith('.toml'))
            .map((name) => name.replace(/\.toml$/, ''))
            .sort();
        const expectedAdapters = [...codexAgents].sort();
        if (JSON.stringify(actualAdapters) !== JSON.stringify(expectedAdapters)) {
            fail(
                adapterDirectory,
                `adapter set must be exactly: ${expectedAdapters.join(', ')}`,
            );
        }
    }

    codexAgents.forEach((role) => {
        const relativePath = `.codex/agents/${role}.toml`;
        const filePath = path.join(root, relativePath);
        const source = readRequired(relativePath);
        if (!source) return;

        const requiredPatterns = [
            [/^description\s*=\s*"[^"]+"/m, 'description'],
            [/^developer_instructions\s*=\s*"""/m, 'developer instructions'],
        ];
        requiredPatterns.forEach(([pattern, label]) => {
            if (!pattern.test(source)) fail(filePath, `missing or invalid ${label}`);
        });
        if (!source.includes(`.agents/roles/${role}.md`)) {
            fail(filePath, `adapter must load .agents/roles/${role}.md`);
        }
        if (!source.includes('never create or delegate to another agent')) {
            fail(filePath, 'adapter must prohibit nested delegation');
        }

        const expectation = codexAgentExpectations[role];
        const configuredValues = {
            name: source.match(/^name\s*=\s*"([^"]+)"/m)?.[1],
            model: source.match(/^model\s*=\s*"([^"]+)"/m)?.[1],
            effort: source.match(/^model_reasoning_effort\s*=\s*"([^"]+)"/m)?.[1],
            sandbox: source.match(/^sandbox_mode\s*=\s*"([^"]+)"/m)?.[1],
        };
        Object.entries(expectation).forEach(([field, expected]) => {
            if (configuredValues[field] !== expected) {
                fail(filePath, `${field} must be ${expected}`);
            }
        });
    });

    const configPath = '.codex/config.toml';
    const configFile = path.join(root, configPath);
    const config = readRequired(configPath);
    const configPatterns = [
        /^\[agents\]$/m,
        /^enabled\s*=\s*true$/m,
        /^max_concurrent_threads_per_session\s*=\s*3$/m,
        /^default_subagent_model\s*=\s*"gpt-5\.6-terra"$/m,
        /^\[features\]$/m,
        /^hooks\s*=\s*true$/m,
    ];
    configPatterns.forEach((pattern) => {
        if (!pattern.test(config)) fail(configFile, `missing expected setting: ${pattern}`);
    });
}

function validateCodexHooks() {
    const hookConfigPath = '.codex/hooks.json';
    const hookConfigFile = path.join(root, hookConfigPath);
    const hookConfigSource = readRequired(hookConfigPath);
    if (hookConfigSource) {
        try {
            const hookConfig = JSON.parse(hookConfigSource);
            const groups = hookConfig.hooks?.SubagentStop;
            if (!Array.isArray(groups) || groups.length !== 1) {
                fail(hookConfigFile, 'must define exactly one SubagentStop matcher group');
            } else {
                const group = groups[0];
                if (group.matcher !== codexHookMatcher) {
                    fail(hookConfigFile, `SubagentStop matcher must be ${codexHookMatcher}`);
                }
                if (!Array.isArray(group.hooks) || group.hooks.length !== 1) {
                    fail(hookConfigFile, 'SubagentStop group must define exactly one handler');
                } else {
                    const handler = group.hooks[0];
                    if (handler.type !== 'command') {
                        fail(hookConfigFile, 'SubagentStop handler must use command type');
                    }
                    ['command', 'commandWindows'].forEach((field) => {
                        if (!handler[field]?.includes('.codex/hooks/validate-agent-result.cjs')) {
                            fail(hookConfigFile, `${field} must invoke the result hook adapter`);
                        }
                    });
                }
            }
        } catch (error) {
            fail(hookConfigFile, `invalid JSON: ${error.message}`);
        }
    }

    const hookAdapterPath = '.codex/hooks/validate-agent-result.cjs';
    const hookAdapter = readRequired(hookAdapterPath);
    if (
        hookAdapter &&
        (!hookAdapter.includes('.agents') ||
            !hookAdapter.includes('agent-result-validator.cjs'))
    ) {
        fail(path.join(root, hookAdapterPath), 'hook adapter must load the shared validator');
    }

    const validatorPath =
        '.agents/skills/orchestrate-agents/scripts/agent-result-validator.cjs';
    const validator = readRequired(validatorPath);
    if (validator && !validator.includes("require('ajv/dist/2020')")) {
        fail(path.join(root, validatorPath), 'shared validator must use JSON Schema draft 2020');
    }

    readRequired('.agents/skills/orchestrate-agents/scripts/test-agent-result-hook.cjs');
}

function validateGovernanceRouting() {
    requiredGovernanceFiles.forEach((relativePath) => readRequired(relativePath));

    const agents = readRequired('AGENTS.md');
    if (!agents.includes('docs/references/agent-workflow/multi-agent-architecture.md')) {
        fail(path.join(root, 'AGENTS.md'), 'multi-agent architecture is not routed');
    }
    if (!agents.includes('orchestrate-agents')) {
        fail(path.join(root, 'AGENTS.md'), 'orchestrate-agents is not discoverable');
    }

    const routerPath = '.agents/skills/agent-router/SKILL.md';
    const router = readRequired(routerPath);
    if (!router.includes('multi-agent-architecture.md') || !router.includes('orchestrate-agents')) {
        fail(path.join(root, routerPath), 'router is missing the multi-agent route');
    }

    const routingPath = 'docs/references/agent-workflow/skill-routing.md';
    const routing = readRequired(routingPath);
    if (!routing.includes('orchestrate-agents') || !routing.includes('multi-agent-architecture.md')) {
        fail(path.join(root, routingPath), 'skill routing is missing the multi-agent route');
    }
    if (!routing.includes('.codex/hooks.json') || !routing.includes('agent-result-validator.cjs')) {
        fail(path.join(root, routingPath), 'skill routing is missing runtime result enforcement');
    }

    const architecturePath = 'docs/references/agent-workflow/multi-agent-architecture.md';
    const architecture = readRequired(architecturePath);
    if (!architecture.includes('SubagentStop') || !architecture.includes('hook trust')) {
        fail(path.join(root, architecturePath), 'architecture is missing Codex hook boundaries');
    }

    const packagePath = 'package.json';
    const packageSource = readRequired(packagePath);
    try {
        const packageJson = JSON.parse(packageSource);
        if (
            packageJson.scripts?.['lint:agents'] !== agentLintCommand
        ) {
            fail(path.join(root, packagePath), 'lint:agents script is missing or incorrect');
        }
        if (
            packageJson.scripts?.['test:agent-hooks'] !==
            'node .agents/skills/orchestrate-agents/scripts/test-agent-result-hook.cjs'
        ) {
            fail(path.join(root, packagePath), 'test:agent-hooks script is missing or incorrect');
        }
        if (!packageJson.devDependencies?.ajv) {
            fail(path.join(root, packagePath), 'Ajv dev dependency is required');
        }
        if (!packageJson.scripts?.lint?.includes('npm run lint:agents')) {
            fail(path.join(root, packagePath), 'general lint does not include lint:agents');
        }
    } catch (error) {
        fail(path.join(root, packagePath), `invalid JSON: ${error.message}`);
    }
}

validateSkill();
validateRoles();
validateSchemas();
validateCodexAgents();
validateCodexHooks();
validateGovernanceRouting();

if (errors.length) {
    console.error('Agent orchestration lint failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
}

console.log(
    `Agent orchestration lint passed (${requiredRoles.length} roles, ${codexAgents.length} Codex adapters, 2 contracts, 1 runtime hook).`,
);
