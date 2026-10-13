// Local check that the branch ruleset files and the workflows agree: every status check a ruleset
// requires must be the name of a workflow job, or a merge into the protected branch waits forever.
// No network access. Limits, all reported and none guessed:
// - a job name that is an expression (`${{ ... }}`, which includes matrix names) is not evaluated, so it
//   never satisfies a required check, and the failure for that check lists such jobs;
// - a job name that YAML reads as a number, boolean or other non-string fails: quote it;
// - check names produced by reusable workflows are not modelled.
import fs from 'node:fs';
import path from 'node:path';
import { CORE_SCHEMA, load as parseYaml } from 'js-yaml';

const WORKFLOWS_DIR = '.github/workflows';
const RULESETS_DIR = '.github/rulesets';

// Each job is { id, name, expression }. A job's check name is its `name`, or its id when it has none.
// The YAML 1.2 core schema keeps a name such as 2026-10-13 a string, as GitHub's workflow parser does.
export function readJobs(yamlText) {
    const workflow = parseYaml(yamlText, { schema: CORE_SCHEMA });
    const jobs = workflow?.jobs;
    if (jobs === null || typeof jobs !== 'object') return [];

    return Object.entries(jobs).map(([id, job]) => {
        const name = job?.name;
        if (name === undefined || name === null || name === '') {
            return { id, name: id, expression: false };
        }
        if (typeof name !== 'string') {
            throw new Error(
                `job "${id}" has a name YAML reads as ${typeof name} (${JSON.stringify(name)}); quote it`,
            );
        }
        return { id, name, expression: name.includes('${{') };
    });
}

export function readRequiredContexts(rulesetText) {
    const ruleset = JSON.parse(rulesetText);
    const rules = Array.isArray(ruleset.rules) ? ruleset.rules : [];

    return rules
        .filter((rule) => rule?.type === 'required_status_checks')
        .flatMap((rule) => rule.parameters?.required_status_checks ?? [])
        .map((check) => check?.context)
        .filter((context) => typeof context === 'string' && context !== '');
}

function listFiles(root, relativeDir, extensions) {
    const dir = path.join(root, relativeDir);
    if (!fs.existsSync(dir)) return null;

    return fs
        .readdirSync(dir)
        .filter((name) => extensions.includes(path.extname(name)))
        .sort()
        .map((name) => `${relativeDir}/${name}`);
}

function firstLine(error) {
    return String(error?.message ?? 'unknown error').split('\n')[0];
}

export function collectCiContractFailures(root) {
    const rulesets = listFiles(root, RULESETS_DIR, ['.json']);
    if (rulesets === null) return [];

    const workflows = listFiles(root, WORKFLOWS_DIR, ['.yml', '.yaml']) ?? [];
    const jobNames = new Set();
    const expressionJobs = [];
    const failures = [];

    for (const relative of workflows) {
        try {
            for (const job of readJobs(fs.readFileSync(path.join(root, relative), 'utf8'))) {
                if (job.expression) expressionJobs.push(`${relative} job "${job.id}"`);
                else jobNames.add(job.name);
            }
        } catch (error) {
            failures.push({ path: relative, reason: `could not be read (${firstLine(error)})` });
        }
    }

    const expressionNote =
        expressionJobs.length > 0
            ? `; not evaluated, so not counted: the expression name of ${expressionJobs.join(', ')}`
            : '';

    for (const relative of rulesets) {
        let contexts;
        try {
            contexts = readRequiredContexts(fs.readFileSync(path.join(root, relative), 'utf8'));
        } catch (error) {
            failures.push({ path: relative, reason: `could not be parsed (${firstLine(error)})` });
            continue;
        }

        for (const context of contexts) {
            if (!jobNames.has(context)) {
                failures.push({
                    path: relative,
                    reason: `required check "${context}" is not the name of any job under ${WORKFLOWS_DIR}${expressionNote}`,
                });
            }
        }
    }

    return failures;
}
