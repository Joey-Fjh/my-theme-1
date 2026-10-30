import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { collectCiContractFailures, readJobs } from './ci-contract.mjs';

function readJobNames(yamlText) {
    return readJobs(yamlText).map((job) => job.name);
}

function withTempRepo(files, run) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-contract-'));
    try {
        for (const [relative, content] of Object.entries(files)) {
            const target = path.join(root, relative);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(target, content, 'utf8');
        }
        run(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

function ruleset(...contexts) {
    return JSON.stringify({
        name: 'main',
        rules: [
            { type: 'deletion' },
            {
                type: 'required_status_checks',
                parameters: {
                    required_status_checks: contexts.map((context) => ({ context })),
                },
            },
        ],
    });
}

function yamlLines(...lines) {
    return `${lines.join('\n')}\n`;
}

// Failures for one workflow checked against one required context.
function failuresFor(workflow, context) {
    let failures;
    withTempRepo(
        {
            '.github/workflows/ci.yml': workflow,
            '.github/rulesets/main.json': ruleset(context),
        },
        (root) => {
            failures = collectCiContractFailures(root);
        },
    );
    return failures;
}

const CI_WORKFLOW = `name: CI

on:
    push:

jobs:
    lint:
        name: Lint
        runs-on: ubuntu-latest
        steps:
            - name: Not a job name
              run: npm run lint

    # A comment between jobs.
    theme-check:
        name: 'Theme Check' # quoted, with a trailing comment
        runs-on: ubuntu-latest
`;

test('job names come from name, not from the workflow name or step names', () => {
    assert.deepEqual(readJobNames(CI_WORKFLOW), ['Lint', 'Theme Check']);
});

test('a job without a name is known by its id', () => {
    assert.deepEqual(readJobNames('jobs:\n  build:\n    runs-on: ubuntu-latest\n'), ['build']);
});

test('a workflow without jobs has no names', () => {
    assert.deepEqual(readJobNames('name: Empty\non: push\n'), []);
});

test('required checks that match job names pass', () => {
    withTempRepo(
        {
            '.github/workflows/ci.yml': CI_WORKFLOW,
            '.github/rulesets/main.json': ruleset('Lint', 'Theme Check'),
        },
        (root) => {
            assert.deepEqual(collectCiContractFailures(root), []);
        },
    );
});

test('a renamed job fails and names the missing check', () => {
    const failures = failuresFor(CI_WORKFLOW.replace('name: Lint', 'name: Linting'), 'Lint');
    assert.equal(failures.length, 1);
    assert.equal(failures[0].path, '.github/rulesets/main.json');
    assert.match(failures[0].reason, /required check "Lint" is not the name of any job/);
});

// The next five are the forms a line-based reader got wrong in review rounds 1 to 3.
test('a doubled single quote is part of the name', () => {
    const workflow = yamlLines('jobs:', '  lint:', "    name: 'Lint''s check'");
    assert.deepEqual(readJobNames(workflow), ["Lint's check"]);
    assert.equal(failuresFor(workflow, 'Lint').length, 1);
});

test('a folded name is read as its text', () => {
    const workflow = yamlLines('jobs:', '  lint:', '    name: >-', '      Lint');
    assert.deepEqual(readJobNames(workflow), ['Lint']);
    assert.deepEqual(failuresFor(workflow, 'Lint'), []);
});

test('a plain name continued on the next line is one name', () => {
    const workflow = yamlLines(
        'jobs:',
        '  lint:',
        '    name: Lint',
        '      renamed',
        '    runs-on: ubuntu-latest',
    );
    assert.deepEqual(readJobNames(workflow), ['Lint renamed']);
    assert.equal(failuresFor(workflow, 'Lint').length, 1);
});

test('a quoted name key or a space before the colon still names the job', () => {
    for (const key of ['"name":', 'name :']) {
        const workflow = yamlLines('jobs:', '  lint:', `    ${key} Linting`);
        assert.deepEqual(readJobNames(workflow), ['Linting']);
        assert.equal(failuresFor(workflow, 'lint').length, 1);
    }
});

test('a name from an alias is resolved', () => {
    const workflow = yamlLines(
        'x-shared: &shared',
        '  name: Shared',
        '  runs-on: ubuntu-latest',
        'jobs:',
        '  first: *shared',
    );
    assert.deepEqual(readJobNames(workflow), ['Shared']);
    assert.equal(failuresFor(workflow, 'first').length, 1);
});

// Review round 4.
test('a name that looks like a date stays the text that was written', () => {
    const workflow = yamlLines('jobs:', '  nightly:', '    name: 2026-10-13');
    assert.deepEqual(readJobNames(workflow), ['2026-10-13']);
    assert.deepEqual(failuresFor(workflow, '2026-10-13'), []);
});

test('a name YAML reads as a number or a boolean fails and asks for quotes', () => {
    for (const value of ['1.0', '0x10', 'true']) {
        const failures = failuresFor(yamlLines('jobs:', '  build:', `    name: ${value}`), 'build');
        assert.equal(failures.length, 2);
        assert.equal(failures[0].path, '.github/workflows/ci.yml');
        assert.match(failures[0].reason, /^could not be read \(job "build" has a name YAML reads as /);
    }
    assert.deepEqual(readJobNames(yamlLines('jobs:', '  build:', "    name: '1.0'")), ['1.0']);
});

test('an expression name is not evaluated and is named in the failure', () => {
    const workflow = yamlLines('jobs:', '  lint:', "    name: ${{ 'Lint' }}");
    assert.deepEqual(
        readJobs(workflow).map((job) => job.expression),
        [true],
    );

    const failures = failuresFor(workflow, 'Lint');
    assert.equal(failures.length, 1);
    assert.match(failures[0].reason, /required check "Lint" is not the name of any job/);
    assert.match(failures[0].reason, /not evaluated, so not counted: .*ci\.yml job "lint"/);
});

test('an expression name elsewhere does not fail a satisfied check', () => {
    const workflow = yamlLines(
        'jobs:',
        '  lint:',
        '    name: Lint',
        '  matrix:',
        '    name: Test ${{ matrix.os }}',
    );
    assert.deepEqual(failuresFor(workflow, 'Lint'), []);
});

test('a required check with no workflows directory fails', () => {
    withTempRepo({ '.github/rulesets/main.json': ruleset('Lint') }, (root) => {
        assert.equal(collectCiContractFailures(root).length, 1);
    });
});

test('an unparsable workflow is reported with its path', () => {
    const failures = failuresFor('jobs:\n  lint:\n    name: "unterminated\n', 'Lint');
    assert.equal(failures.length, 2);
    assert.equal(failures[0].path, '.github/workflows/ci.yml');
    assert.match(failures[0].reason, /^could not be read/);
    assert.match(failures[1].reason, /required check "Lint" is not the name of any job/);
});

test('an unparsable ruleset fails', () => {
    withTempRepo(
        {
            '.github/workflows/ci.yml': CI_WORKFLOW,
            '.github/rulesets/main.json': '{ not json',
        },
        (root) => {
            const failures = collectCiContractFailures(root);
            assert.equal(failures.length, 1);
            assert.match(failures[0].reason, /^could not be parsed/);
        },
    );
});

test('a repository without rulesets passes', () => {
    withTempRepo({ '.github/workflows/ci.yml': CI_WORKFLOW }, (root) => {
        assert.deepEqual(collectCiContractFailures(root), []);
    });
});
