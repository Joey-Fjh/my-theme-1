const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const LINT_SCRIPT = path.join(__dirname, 'lint-i18n-unused.js');

function withTheme(files, run) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-unused-'));
    try {
        for (const [relative, content] of Object.entries(files)) {
            const target = path.join(root, relative);
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.writeFileSync(
                target,
                typeof content === 'string' ? content : `${JSON.stringify(content, null, 4)}\n`,
                'utf8',
            );
        }
        const result = spawnSync(process.execPath, [LINT_SCRIPT], { cwd: root, encoding: 'utf8' });
        run({ status: result.status, output: `${result.stdout}${result.stderr}` });
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

const emptySchema = { 'locales/en.default.schema.json': {} };

test('unused storefront key fails with file and line', () => {
    withTheme(
        {
            ...emptySchema,
            'locales/en.default.json': { general: { used: 'Used', unused: 'Unused' } },
            'sections/a.liquid': "{{ 'general.used' | t }}\n",
        },
        ({ status, output }) => {
            assert.notEqual(status, 0);
            assert.match(output, /locales\/en\.default\.json:\d+: Locale key "general\.unused"/);
            assert.doesNotMatch(output, /"general\.used"/);
        },
    );
});

test('used storefront keys pass with either quote style', () => {
    withTheme(
        {
            ...emptySchema,
            'locales/en.default.json': { general: { single: 'A', double: 'B' } },
            'snippets/a.liquid': `{{ 'general.single' | t }}\n{%- assign x = "general.double" | t -%}\n`,
        },
        ({ status, output }) => {
            assert.equal(status, 0, output);
        },
    );
});

test('allowlisted recipient form keys pass', () => {
    withTheme(
        {
            ...emptySchema,
            'locales/en.default.json': { recipient: { form: { email: 'Email' } } },
        },
        ({ status, output }) => {
            assert.equal(status, 0, output);
        },
    );
});

test('plural leaves pass when the parent key is used', () => {
    withTheme(
        {
            ...emptySchema,
            'locales/en.default.json': { cart: { item_count: { one: '1 item', other: '{{ count }} items' } } },
            'sections/a.liquid': "{{ 'cart.item_count' | t: count: 2 }}\n",
        },
        ({ status, output }) => {
            assert.equal(status, 0, output);
        },
    );
});

test('unused schema key fails and used schema key passes', () => {
    withTheme(
        {
            'locales/en.default.json': {},
            'locales/en.default.schema.json': { sections: { a: { name: 'A', label: 'Old' } } },
            'sections/a.liquid': '{% schema %}{"name":"t:sections.a.name"}{% endschema %}\n',
        },
        ({ status, output }) => {
            assert.notEqual(status, 0);
            assert.match(output, /en\.default\.schema\.json:\d+: Locale key "sections\.a\.label"/);
            assert.doesNotMatch(output, /"sections\.a\.name"/);
        },
    );
});

test('schema key used only in a section group JSON passes', () => {
    withTheme(
        {
            'locales/en.default.json': {},
            'locales/en.default.schema.json': { general: { header: 'Header' } },
            'sections/header-group.json': '{"type":"header","name":"t:general.header","sections":{},"order":[]}\n',
        },
        ({ status, output }) => {
            assert.equal(status, 0, output);
        },
    );
});
