const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const { runThemeLint, maskNonExecutableLiquid, isAllowedStylesheetMedia } = require('./lint-theme.js');
const {
    getLiquidSyntaxFailures,
    isRubyCompatibilityFallback,
    runLiquidSyntaxLint,
} = require('./lint-liquid-syntax.js');
const {
    extractBlocks,
    lineAt,
    runEmbeddedCompatLint,
    virtualEmbeddedJsPath,
} = require('./lint-embedded-compat.cjs');

const THEME_LINT_SCRIPT = path.join(__dirname, 'lint-theme.js');
const LIQUID_SYNTAX_SCRIPT = path.join(__dirname, 'lint-liquid-syntax.js');
const EMBEDDED_COMPAT_SCRIPT = path.join(__dirname, 'lint-embedded-compat.cjs');

const MATCHING_ESLINT_CONFIG = `module.exports = [{
  files: ['assets/*.js'],
  languageOptions: { ecmaVersion: 2022, sourceType: 'script' },
  rules: { 'no-alert': 'error' }
}];`;

function writeFile(root, relativePath, content) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function withTempTheme(fn) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-theme-architecture-'));

    try {
        fn(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

async function withTempThemeAsync(fn) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-theme-architecture-'));

    try {
        await fn(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

function runScript(scriptPath, root) {
    return spawnSync(process.execPath, [scriptPath, '--root', root], {
        cwd: path.join(__dirname, '../../../../'),
        encoding: 'utf8',
        env: process.env,
    });
}

function failureMessages(failures) {
    return failures.map((entry) => entry.message).join('\n');
}

test('assign over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div>{% assign product = 'override' %}</div>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not assign over protected Shopify Liquid runtime name "product"/,
        );
    });
});

test('liquid block assign over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% liquid', "assign product = 'override'", '%}', ''].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not assign over protected Shopify Liquid runtime name "product"/,
        );
    });
});

test('capture over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div>{% capture cart %}content{% endcapture %}</div>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not capture over protected Shopify Liquid runtime name "cart"/,
        );
    });
});

test('liquid block capture over protected runtime name fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% liquid', 'capture cart', '  content', 'endcapture', '%}'].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not capture over protected Shopify Liquid runtime name "cart"/,
        );
    });
});

test('content_for_header shadowing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `{% assign content_for_header = 'override' %}\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not assign over protected Shopify Liquid runtime name "content_for_header"/,
        );
    });
});

test('metaobjects shadowing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `{% capture metaobjects %}content{% endcapture %}\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Do not capture over protected Shopify Liquid runtime name "metaobjects"/,
        );
    });
});

test('comment and doc examples do not fail runtime name lint', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% comment %}',
                "{% assign product = 'example' %}",
                '{% endcomment %}',
                '{% doc %}',
                '{% capture cart %}example{% endcapture %}',
                '{% enddoc %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('local assign passes theme lint', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div>{% assign local_value = 'ok' %}</div>\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('tab with literal aria attributes passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" aria-selected="false" aria-controls="panel-1">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('tab with x-bind aria attributes passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" x-bind:aria-selected="isActive" x-bind:aria-controls="panelId">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('tab missing aria-selected fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" aria-controls="panel-1">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /role="tab" is missing aria-selected/);
    });
});

for (const [label, markup, reason] of [
    ['semicolon', `<div @click="close(); reset()"></div>`, /not a single expression/],
    ['declaration', `<div @click="let link = $event.target"></div>`, /not a single expression/],
    ['control flow', `<div @keydown.escape.window="if (open) close()"></div>`, /not a single expression/],
    ['control flow behind a comment', `<div @click="if/*x*/(open) close()"></div>`, /not a single expression/],
    ['unterminated string', `<div @click="say('a; b)"></div>`, /not a single expression/],
    ['arrow function', `<div x-init="$nextTick(() => focus())"></div>`, /contains a function/],
    ['function', `<div x-data="{ toggle: function () {} }"></div>`, /contains a function/],
    ['method shorthand', `<div x-data="{ toggle() { open = !open } }"></div>`, /contains a function/],
    ['comma sequence', `<div @click="close(), reset()"></div>`, /contains a comma sequence/],
    ['wrapper escape', `<div @click="a); if (open) close(); (b"></div>`, /not a single expression/],
    ['wrapper escape into a sum', `<div @click="a) + (b"></div>`, /not a single expression/],
    [
        'comma sequence in the x-for source',
        `<template x-for="item in (items, moreItems)"></template>`,
        /contains a comma sequence/,
    ],
    ['Liquid value', `<p x-text="errors['{{ item.key }}']"></p>`, /contains Liquid/],
    ['bare x-bind', `<div x-bind="close(); reset()"></div>`, /"x-bind" contains statements/],
    ['plugin directive', `<div x-intersect="if (visible) load()"></div>`, /"x-intersect" contains statements/],
    [
        'conditional attribute',
        `<div {% if open %}@click="close(); reset()"{% endif %}></div>`,
        /"@click" contains statements/,
    ],
    [
        'template literal interpolation',
        '<div :class="`item ${list.map((item) => item.id)}`"></div>',
        /contains a function/,
    ],
    ['unreadable entity', `<div @click="say(&#x110000;)"></div>`, /HTML entity this check cannot read/],
    ['unknown named entity', `<div @click="say(&copy;)"></div>`, /HTML entity this check cannot read/],
]) {
    test(`alpine attribute with ${label} fails`, async () => {
        await withTempThemeAsync(async (root) => {
            writeFile(root, 'sections/fixture.liquid', `${markup}\n`);

            const failures = await runThemeLint(root);
            assert.match(failureMessages(failures), reason);
        });
    });
}

test('simple alpine expressions pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                `<div x-data="accordion" data-initial-active="{{ index }}" @click.away="close()">`,
                `    <button @click="onNavClick($event)" :aria-expanded="isActive($el.dataset.index)"></button>`,
                `    <p x-show="errors[$el.dataset.lineKey]" :style="'margin: 0; padding: 0'"></p>`,
                `    <span`,
                `        :class="{`,
                `            'is-selected': selected === $el.dataset.value,`,
                `            'is-unavailable': !available,`,
                `        }"`,
                `    ></span>`,
                `    <span :class="isSuccess ? 'is-success' : available ? 'is-ready' : ''"></span>`,
                `    <button @click="say(&quot;hi&quot;)" x-on:focus="say(&#34;a; b&#34;)"></button>`,
                '    <span :class="`item-${index} is-${state}`" x-text="\'don\\\'t; stop\'"></span>',
                `    <div x-cloak x-ref="panel"></div>`,
                `    <button @click="doThis&nbsp;()" x-on:blur="doThis&NewLine;()" :title="label /* note; () => */"></button>`,
                `    <template x-for="(item, index) in items"><span x-text="item"></span></template>`,
                `    <template x-for="i in 10"></template>`,
                `    <span x-text="await getLabel()" x-init="await load()"></span>`,
                `    <span :class="(open && ready) ? 'is-open' : ''" x-text="(a) + (b)"></span>`,
                `    <div x-data="{ open: false, count: 0 }" @click="open = !open"></div>`,
                `</div>`,
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.equal(failureMessages(failures), '');
    });
});

test('tab missing aria-controls fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<button role="tab" aria-selected="false">Tab</button>\n`,
        );

        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /role="tab" is missing aria-controls/);
    });
});

test('maskNonExecutableLiquid preserves line breaks and length', () => {
    const source = ['line1', '{% comment %}', 'hidden', '{% endcomment %}', 'line5', ''].join('\n');
    const masked = maskNonExecutableLiquid(source);

    assert.equal(masked.split('\n').length, source.split('\n').length);
    assert.equal(masked.length, source.length);
});

test('quoted liquid filter argument name fails syntax lint', () => {
    const invalid = "{{ media | model_viewer_tag: 'camera-controls': true }}";
    const failures = getLiquidSyntaxFailures(invalid);

    assert.equal(failures.length, 1);
});

test('hyphenated liquid filter argument name passes syntax lint', () => {
    const valid = '{{ media | model_viewer_tag: camera-controls: true }}';
    const failures = getLiquidSyntaxFailures(valid);

    assert.equal(failures.length, 0);
});

test('ordinary valid liquid passes syntax lint', () => {
    const valid = `<p>{{ product.title | escape }}</p>`;
    const failures = getLiquidSyntaxFailures(valid);

    assert.equal(failures.length, 0);
});

test('ruby compatibility fallback accepts empty append argument', () => {
    assert.equal(isRubyCompatibilityFallback('product.title | append: '), true);
    assert.equal(getLiquidSyntaxFailures('{{ product.title | append: }}').length, 0);
});

test('ruby compatibility fallback accepts trailing comma before next filter', () => {
    assert.equal(isRubyCompatibilityFallback('value | append: item,'), true);
    assert.equal(getLiquidSyntaxFailures('{{ value | append: item, }}').length, 0);
});

test('liquid syntax lint runs against temp theme root', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `{{ media | model_viewer_tag: 'camera-controls': true }}\n`,
        );

        const failures = await runLiquidSyntaxLint(root);
        assert.equal(failures.length, 1);
    });
});

test('embedded compat extracts stylesheet and javascript blocks', () => {
    const source = [
        '<div>',
        '{% stylesheet %}',
        '.ok { color: red; }',
        '{% endstylesheet %}',
        '{% javascript %}',
        'console.log("ok");',
        '{% endjavascript %}',
        '</div>',
        '',
    ].join('\n');

    assert.equal(extractBlocks(source, 'stylesheet').length, 1);
    assert.equal(extractBlocks(source, 'javascript').length, 1);
});

test('embedded js virtual path matches assets/*.js eslint config', () => {
    assert.equal(
        virtualEmbeddedJsPath('sections/fixture.liquid', 0),
        'assets/__embedded-sections-fixture-liquid-0.js',
    );
});

test('embedded js lint uses matching eslint config and flags alert', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(root, 'stylelint.config.cjs', `module.exports = { rules: {} };`);
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% javascript %}', "alert('x');", '{% endjavascript %}', ''].join('\n'),
        );

        const virtualPath = virtualEmbeddedJsPath('sections/fixture.liquid', 0);
        assert.equal(fs.existsSync(path.join(root, virtualPath)), false);

        const { issues } = await runEmbeddedCompatLint(root);

        assert.ok(issues.length >= 1);
        assert.match(issues[0].message, /no-alert/);
        assert.equal(issues[0].file, 'sections/fixture.liquid');
        assert.equal(issues[0].line, 2);
        assert.equal(fs.existsSync(path.join(root, virtualPath)), false);
    });
});

test('embedded js lint passes valid code with matching eslint config', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(root, 'stylelint.config.cjs', `module.exports = { rules: {} };`);
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% javascript %}', 'console.log("ok");', '{% endjavascript %}', ''].join('\n'),
        );

        const { issues } = await runEmbeddedCompatLint(root);
        assert.equal(issues.length, 0);
    });
});

test('embedded compat maps stylesheet issue lines back to liquid source', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(
            root,
            'stylelint.config.cjs',
            `module.exports = { rules: { 'color-no-invalid-hex': true } };`,
        );
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<div>',
                '{% stylesheet %}',
                '.bad { color: #zzzzzz; }',
                '{% endstylesheet %}',
                '</div>',
                '',
            ].join('\n'),
        );

        const { issues } = await runEmbeddedCompatLint(root);
        assert.ok(issues.length >= 1);
        assert.equal(issues[0].file, 'sections/fixture.liquid');
        assert.equal(issues[0].line, 3);
    });
});

test('lineAt helper maps offsets to source lines', () => {
    const source = 'a\nb\nc\n';
    assert.equal(lineAt(source, 0), 1);
    assert.equal(lineAt(source, 2), 2);
    assert.equal(lineAt(source, 4), 3);
});

test('multiple stylesheet tags fail', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.one { color: #111111; }',
                '{% endstylesheet %}',
                '{% stylesheet %}',
                '.two { color: #222222; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Only one {% stylesheet %} tag is allowed per file \(found 2\)/,
        );
    });
});

test('multiple javascript tags fail', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% javascript %}',
                "console.log('one');",
                '{% endjavascript %}',
                '{% javascript %}',
                "console.log('two');",
                '{% endjavascript %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Only one {% javascript %} tag is allowed per file \(found 2\)/,
        );
    });
});

test('liquid inside stylesheet block fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.ok { color: {{ settings.color }}; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Liquid output tags are not allowed inside {% stylesheet %} blocks/,
        );
    });
});

test('liquid inside javascript block fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% javascript %}',
                "console.log({{ cart.item_count }});",
                '{% endjavascript %}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        assert.match(
            failureMessages(failures),
            /Liquid output tags are not allowed inside {% javascript %} blocks/,
        );
    });
});

test('theme lint cli accepts --root without auto-running on import', () => {
    withTempTheme((root) => {
        writeFile(root, 'sections/fixture.liquid', `<div>{% assign local_value = 'ok' %}</div>\n`);

        const result = runScript(THEME_LINT_SCRIPT, root);
        const output = `${result.stdout}${result.stderr}`;

        assert.equal(result.status, 0, output);
        assert.match(output, /Theme architecture lint passed\./);
    });
});

test('liquid syntax cli accepts --root without auto-running on import', () => {
    withTempTheme((root) => {
        writeFile(root, 'sections/fixture.liquid', `<p>{{ product.title | escape }}</p>\n`);

        const result = runScript(LIQUID_SYNTAX_SCRIPT, root);
        const output = `${result.stdout}${result.stderr}`;

        assert.equal(result.status, 0, output);
        assert.match(output, /Liquid syntax lint passed\./);
    });
});

test('invalid rgb alpha syntax fails in stylesheet blocks', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<section>',
                '{% stylesheet %}',
                '.muted {',
                '    color: rgb(var(--color-foreground) / 0.8);',
                '}',
                '{% endstylesheet %}',
                '</section>',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'sections/fixture.liquid');
        assert.equal(rgbAlphaFailures[0].line, 4);
    });
});

test('invalid rgb alpha syntax fails in first-party css files', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            ['.muted {', '    color: rgb(var(--color-border) / 0.2);', '}', ''].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'tailwind/fixture.css');
        assert.equal(rgbAlphaFailures[0].line, 2);
    });
});

test('invalid rgb alpha syntax fails for variable alpha', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '.muted {',
                '    color: rgb(var(--color-foreground) / var(--opacity));',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'tailwind/fixture.css');
        assert.equal(rgbAlphaFailures[0].line, 2);
    });
});

test('invalid rgb alpha syntax fails for rgba slash spelling', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '.muted {',
                '    color: rgba(var(--color-foreground) / 0.5);',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 1);
        assert.equal(rgbAlphaFailures[0].file, 'tailwind/fixture.css');
        assert.equal(rgbAlphaFailures[0].line, 2);
    });
});

test('valid rgba scheme color syntax passes rgb alpha lint', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            [
                '.muted {',
                '    color: rgba(var(--color-foreground), 0.8);',
                '    border-color: rgba(var(--color-border), 0.2);',
                '}',
                '',
            ].join('\n'),
        );

        const failures = await runThemeLint(root);
        const rgbAlphaFailures = failures.filter((failure) =>
            failure.message.includes('rgba(var(--color-*), alpha)'),
        );

        assert.equal(rgbAlphaFailures.length, 0);
    });
});

// The layout renders the entry scripts snippet, which holds the import map.
function writeEntryScripts(root, importsJson) {
    writeFile(root, 'layout/theme.liquid', `<head>\n{% render 'scripts' %}\n</head>\n`);
    writeFile(root, 'snippets/scripts.liquid', `<script type="importmap">\n${importsJson}\n</script>\n`);
}

function writeMinimalImportMap(root) {
    writeEntryScripts(root, `{"imports":{"accordion":"{{ 'accordion.js' | asset_url }}"}}`);
}

test('settings chain liquid class font-bold passes (default weight scale; 6-C3 limits weights to loaded faces)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="font-bold">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0, failureMessages(failures));
    });
});

test('settings chain liquid class font-sans fails (default font family)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="font-sans">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain liquid class leading-tight passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="leading-tight">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0, failureMessages(failures));
    });
});

test('settings chain liquid class leading-[2rem] fails (arbitrary)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="leading-[2rem]">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain liquid class tracking-wide passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="tracking-wide">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0, failureMessages(failures));
    });
});

test('settings chain liquid class tracking-[0.2em] fails (arbitrary)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="tracking-[0.2em]">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain liquid class text-white/80 passes the settings chain and fails raw-colour (6-C4)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="text-white/80">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 1, failureMessages(failures));
        assert.equal(failures[0].checkId, 'raw-colour');
    });
});

test('settings chain liquid class text-white with non-numeric modifier fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="text-white/foo">Label</p>
`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain liquid bare leading class fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="leading">Label</p>
`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain liquid bare tracking class fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="tracking">Label</p>
`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain css color rgb space syntax black passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.x {
    color: rgb(0 0 0 / 45%);
}
`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Color property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css color rgb space syntax non-black fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.x {
    color: rgb(0 0 1 / 45%);
}
`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Color property/);
    });
});

test('settings chain css typography malformed unitless line-height fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.x {
    line-height: 1.2.3;
}
`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "line-height"/);
    });
});

test('settings chain liquid class text-red-500 fails (palette colour)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="text-red-500">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /settings typography\/color chain/);
    });
});

test('settings chain liquid class body-md passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="body-md">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('settings chain css typography literal fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    font-size: 18px;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "font-size"/);
    });
});

test('settings chain css typography var passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok { font-size: calc(var(--font-body-size)); }\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
        );
    });
});

test('settings chain css color hex fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    color: #112233;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Color property "color"/);
    });
});

test('settings chain css color literal white passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.ok {\n    color: #fff;\n}\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Color property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css color literal red keyword fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    color: red;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Color property "color"/);
    });
});

test('settings chain css color white black color-mix passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok { color: color-mix(in oklab, #fff 80%, transparent); }\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Color property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css typography literal font-weight 500 passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.ok {\n    font-weight: 500;\n}\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css typography literal font-family fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    font-family: Georgia, serif;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "font-family"/);
    });
});

test('settings chain css typography unitless line-height passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.ok {\n    line-height: 1.25;\n}\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css typography px line-height fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    line-height: 18px;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "line-height"/);
    });
});

test('settings chain css typography em letter-spacing passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.ok {\n    letter-spacing: 0.05em;\n}\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css typography negative em letter-spacing passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.ok {
    letter-spacing: -0.025em;
}
`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css typography calc font token letter-spacing passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok {
    letter-spacing: calc(var(--font-heading-letter-spacing) * 2);
}
`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('settings chain css typography negative px letter-spacing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {
    letter-spacing: -1px;
}
`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "letter-spacing"/);
    });
});

test('settings chain css typography px letter-spacing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    letter-spacing: 2px;\n}\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "letter-spacing"/);
    });
});

test('settings chain css color token passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok { color: rgb(var(--color-foreground)); }\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Color property')).length,
            0,
        );
    });
});

test('heading-h tier on div fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<div class="heading-h2">Title</div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /heading-h\* and title-\* tiers belong on h1–h6/);
    });
});

test('title tier on div fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<div class="title-m">Title</div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /heading-h\* and title-\* tiers belong on h1–h6/);
    });
});

test('heading-h tier on h2 passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="heading-h2">Title</h2>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('title tier on h2 passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="title-m">Title</h2>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('body tier on heading fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="body-md">Title</h2>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /body-\* tiers belong on non-heading/);
    });
});

test('body tier on paragraph passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="body-md">Copy</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('stylesheet directive @apply fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            ['{% stylesheet %}', '@apply text-theme-text;', '{% endstylesheet %}', ''].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /plain CSS only/);
    });
});

for (const [name, css] of [
    ['theme() in a media query', '@media (width >= theme(--breakpoint-pc)) { .x { display: grid; } }'],
    ['--spacing()', '.x { padding: --spacing(4); }'],
    ['--alpha()', '.x { color: --alpha(var(--color-foreground) / 50%); }'],
]) {
    test(`stylesheet Tailwind function ${name} fails`, async () => {
        await withTempThemeAsync(async (root) => {
            writeFile(
                root,
                'sections/fixture.liquid',
                ['{% stylesheet %}', css, '{% endstylesheet %}', ''].join('\n'),
            );
            const failures = await runThemeLint(root);
            assert.match(failureMessages(failures), /not compiled by Tailwind/);
        });
    });
}

test('stylesheet custom properties named like Tailwind functions pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.ok { gap: var(--spacing-gap-md); opacity: var(--alpha-x); --theme-y: 1; }',
                '@media (width >= 64rem) { .ok { gap: calc(var(--spacing) * 4); } }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('stylesheet plain css passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.ok { color: rgb(var(--color-foreground)); }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0);
    });
});

test('liquid style tag fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<style>.x{}</style>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /ad-hoc <style>/);
    });
});

test('executable inline script fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<script>alert(1)</script>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /executable inline <script>/);
    });
});

test('importmap script passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            `<script type="importmap">{"imports":{}}</script>\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('executable inline')).length,
            0,
        );
    });
});

test('raw svg in liquid fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<svg viewBox="0 0 1 1"></svg>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /raw SVG/);
    });
});

test('bare img fails outside image snippet', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<img src="/x" alt="">\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /bare <img>/);
    });
});

test('x-transition fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<div x-transition:enter="open"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /x-transition/);
    });
});

test('js alpine outlet fails outside adapter', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `window.Alpine.start();\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Alpine APIs belong in alpine.adapter.js/);
    });
});

test('js alpine outlet passes in adapter file', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/alpine.adapter.js', `const Alpine = window.Alpine;\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Alpine APIs')).length,
            0,
        );
    });
});

test('js fetch outlet fails outside https', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `fetch('/cart.js');\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /HTTP requests belong in https.js/);
    });
});

test('js fetch outlet passes in https', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/https.js', `await fetch('/cart.js');\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('HTTP requests')).length,
            0,
        );
    });
});

test('js cart route outlet fails outside contract', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `const url = '/cart/add.js';\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Cart routes belong in cart.contract.js/);
    });
});

test('js cart route outlet passes in contract', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/cart.contract.js', `const url = '/cart/add.js';\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Cart routes')).length,
            0,
        );
    });
});

test('js document outlet fails outside core files', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `document.addEventListener('click', () => {});\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /document\/window listeners belong/);
    });
});

test('js document outlet fails for window listeners outside core files', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `window.addEventListener('resize', () => {});\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /document\/window listeners belong/);
    });
});

test('js document outlet allows document reads in components', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `document.querySelector('.x');\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('document/window')).length,
            0,
        );
    });
});

test('js document outlet passes in base', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/base.js', `document.addEventListener('click', () => {});\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('document/window')).length,
            0,
        );
    });
});

test('js user visible copy fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `el.textContent = 'Hello world';\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Hardcoded user-visible copy/);
    });
});

test('js user visible copy passes with dataset', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/fixture.js', `el.textContent = el.dataset.message || '';\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Hardcoded user-visible')).length,
            0,
        );
    });
});

test('module data-module-id missing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must declare data-module-id/);
    });
});

test('module data-module-id present passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div x-data="accordion" data-module-id="accordion"></div>\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId?.startsWith('module-')).length,
            0,
        );
    });
});

test('section color scheme missing on frame fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<div class="section">',
                '  <p>Content</p>',
                '</div>',
                '{% schema %}',
                '{"name":"t:x","settings":[{"type":"color_scheme","id":"color_scheme","label":"t:x"}]}',
                '{% endschema %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /color_scheme setting must apply/);
    });
});

test('section color scheme on frame passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<div class="section color-{{ section.settings.color_scheme }}">',
                '  <p>Content</p>',
                '</div>',
                '{% schema %}',
                '{"name":"t:x","settings":[{"type":"color_scheme","id":"color_scheme","label":"t:x"}]}',
                '{% endschema %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'section-color-scheme').length,
            0,
        );
    });
});

const SECTION_FRAME_FIXTURE_SECTION = [
    "{% render 'section-frame', section: section, children: body %}",
    '{% schema %}',
    '{"name":"t:x","settings":[{"type":"color_scheme","id":"color_scheme","label":"t:x"}]}',
    '{% endschema %}',
    '',
].join('\n');

const SECTION_FRAME_FIXTURE_SNIPPET = [
    '{%- liquid',
    "    assign root_classes = 'section-frame--' | append: width",
    '-%}',
    '<div class="section-frame color-{{ section.settings.color_scheme }} {{ root_classes }}">{{ children }}</div>',
    '',
].join('\n');

async function sectionFrameColorSchemeFailures(snippet, section) {
    let count = 0;
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'snippets/section-frame.liquid', snippet);
        writeFile(root, 'sections/fixture.liquid', section);
        const failures = await runThemeLint(root);
        count = failures.filter((failure) => failure.checkId === 'section-color-scheme').length;
    });
    return count;
}

test('section color scheme via section-frame passes', async () => {
    assert.equal(
        await sectionFrameColorSchemeFailures(SECTION_FRAME_FIXTURE_SNIPPET, SECTION_FRAME_FIXTURE_SECTION),
        0,
    );
});

test("section color scheme via section-frame with scheme_target 'inner' passes", async () => {
    assert.equal(
        await sectionFrameColorSchemeFailures(
            SECTION_FRAME_FIXTURE_SNIPPET,
            SECTION_FRAME_FIXTURE_SECTION.replace('section: section,', "section: section, scheme_target: 'inner',"),
        ),
        0,
    );
});

test("section color scheme with scheme_target 'none' passes when the section applies the class", async () => {
    assert.equal(
        await sectionFrameColorSchemeFailures(
            SECTION_FRAME_FIXTURE_SNIPPET,
            SECTION_FRAME_FIXTURE_SECTION.replace(
                "{% render 'section-frame', section: section, children: body %}",
                [
                    '{% capture body %}<div class="color-{{ section.settings.color_scheme }}"></div>{% endcapture %}',
                    "{% render 'section-frame', section: section, scheme_target: 'none', children: body %}",
                ].join('\n'),
            ),
        ),
        0,
    );
});

test('section color scheme via section-frame rendered inside a liquid tag passes', async () => {
    assert.equal(
        await sectionFrameColorSchemeFailures(
            SECTION_FRAME_FIXTURE_SNIPPET,
            SECTION_FRAME_FIXTURE_SECTION.replace(
                "{% render 'section-frame', section: section, children: body %}",
                "{% liquid\n    render 'section-frame', section: section, children: body\n%}",
            ),
        ),
        0,
    );
});

for (const [name, snippet] of [
    ['drops the class', '<div class="section-frame">{{ children }}</div>\n'],
    [
        'builds the class through a variable',
        [
            '{%- liquid',
            '    assign scheme = section.settings.color_scheme',
            "    assign root_classes = 'section-frame color-' | append: scheme",
            '-%}',
            '<div class="{{ root_classes }}">{{ children }}</div>',
            '',
        ].join('\n'),
    ],
    [
        'keeps the class only in a comment',
        [
            '{% comment %}<div class="color-{{ section.settings.color_scheme }}">{% endcomment %}',
            '<div class="section-frame">{{ children }}</div>',
            '',
        ].join('\n'),
    ],
    [
        'keeps the class outside a class attribute',
        '<div class="section-frame" data-x="color-{{ section.settings.color_scheme }}">{{ children }}</div>\n',
    ],
]) {
    test(`section color scheme via section-frame fails when the frame ${name}`, async () => {
        assert.equal(await sectionFrameColorSchemeFailures(snippet, SECTION_FRAME_FIXTURE_SECTION), 1);
    });
}

for (const [name, from, to] of [
    ['is not the section object', 'section: section,', 'section: section.settings,'],
    ['appears only inside a quoted argument', 'section: section,', "section: other, root_class: 'fake section: section, fake',"],
    ['is missing', 'section: section, ', ''],
    ['is overridden by a later duplicate', 'section: section,', 'section: section, section: other,'],
    ['is overridden by a with alias', "'section-frame',", "'section-frame' with section.settings as section,"],
    ['is overridden by a for alias', "'section-frame',", "'section-frame' for sections as section,"],
    ['has a lookup after whitespace', 'section: section,', 'section: section .settings,'],
    ['has a lookup on the next line', 'section: section,', 'section: section\n    .settings,'],
    ['has a bracket lookup', 'section: section,', "section: section [ 'settings' ],"],
    ["comes with scheme_target 'none'", 'section: section,', "section: section, scheme_target: 'none',"],
    ['comes with a variable scheme_target', 'section: section,', 'section: section, scheme_target: target,'],
    ['comes with a with alias named scheme_target', "'section-frame',", "'section-frame' with target as scheme_target,"],
    ['comes with a for alias named scheme_target', "'section-frame',", "'section-frame' for targets as scheme_target,"],
]) {
    test(`section color scheme via section-frame fails when the section argument ${name}`, async () => {
        assert.equal(
            await sectionFrameColorSchemeFailures(
                SECTION_FRAME_FIXTURE_SNIPPET,
                SECTION_FRAME_FIXTURE_SECTION.replace(from, to),
            ),
            1,
        );
    });
}

test('vendor notice missing fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/vendor-test.js', `export default null;\n`);
        writeFile(root, 'THIRD_PARTY_NOTICES.md', `# Notices\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Missing THIRD_PARTY_NOTICES.md entry/);
    });
});

test('vendor notice present passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'assets/vendor-test.js', `export default null;\n`);
        writeFile(root, 'THIRD_PARTY_NOTICES.md', `# Notices\nassets/vendor-test.js\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'vendor-notices').length,
            0,
        );
    });
});

test('lint-allow without reason fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `{% # lint-allow settings-chain-liquid %}\n<p class="font-medium">X</p>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /lint-allow comments must include/);
    });
});

test('lint-allow with reason suppresses failure', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% # lint-allow settings-chain-liquid: documented fixture exception %}',
                '<p class="font-medium">X</p>',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('settings typography/color chain')).length,
            0,
        );
    });
});

test('embedded compat cli accepts --root without auto-running on import', () => {
    withTempTheme((root) => {
        writeFile(root, 'eslint.config.cjs', MATCHING_ESLINT_CONFIG);
        writeFile(root, 'stylelint.config.cjs', `module.exports = { rules: {} };`);
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.ok { color: #111111; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );

        const result = runScript(EMBEDDED_COMPAT_SCRIPT, root);
        const output = `${result.stdout}${result.stderr}`;

        assert.equal(result.status, 0, output);
        assert.match(output, /Embedded compatibility lint passed/);
    });
});

test('settings chain css typography rejects literal rem font-size (weight literals allowed)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/fixture.css', `.bad {\n    font-weight: bold;\n    font-size: 1rem;\n}\n`);
        const failures = await runThemeLint(root);
        const typography = failures.filter((failure) => failure.message.includes('Typography property'));
        assert.equal(typography.length, 1, failureMessages(failures));
        assert.match(failureMessages(typography), /font-size/);
    });
});

test('settings chain css typography accepts values relative to the inherited size', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'tailwind/fixture.css',
            `.ok {\n    font-size: 0.875em;\n    font-weight: bolder;\n    font-size: calc(var(--font-heading-scale) * 6.5rem);\n}\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('lint-allow applies inside a stylesheet block by file line', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'snippets/fixture.liquid',
            [
                '<div class="fixture"></div>',
                '',
                '{% stylesheet %}',
                '    .fixture {',
                '        /* lint-allow settings-chain-css-typography: fixture zoom floor */',
                '        font-size: max(16px, 1em);',
                '    }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.message.includes('Typography property')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('stylesheet block literal without lint-allow fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'snippets/fixture.liquid',
            ['<div class="fixture"></div>', '{% stylesheet %}', '    .fixture { font-size: max(16px, 1em); }', '{% endstylesheet %}', ''].join(
                '\n',
            ),
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Typography property "font-size"/);
    });
});

test('module data-module-id on a child does not satisfy the x-data root', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div x-data="accordion">\n    <span data-module-id="accordion"></span>\n</div>\n`,
        );
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must declare data-module-id/);
    });
});

test('module data-module-id before x-data on the same root passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(
            root,
            'sections/fixture.liquid',
            `<div\n    data-module-id="accordion"\n    class="{{ 'a' | append: 'b' }}"\n    x-data="accordion"\n></div>\n`,
        );
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId?.startsWith('module-')).length,
            0,
            failureMessages(failures),
        );
    });
});

test('layout without the scripts render fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'layout/theme.liquid', `<head></head>\n`);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion" data-module-id="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must render 'scripts'/);
    });
});

test('missing entry scripts snippet fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'layout/theme.liquid', `<head>\n{% render 'scripts' %}\n</head>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /snippets\/scripts\.liquid must exist and hold one parsable/);
    });
});

test('entry scripts snippet without a parsable import map fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /snippets\/scripts\.liquid must exist and hold one parsable/);
    });
});

test('entry scripts in the snippet pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeMinimalImportMap(root);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion" data-module-id="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'module-import-map').length,
            0,
            failureMessages(failures),
        );
    });
});

test('import map entry mapped to another file fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"accordion":"{{ 'dropdown.js' | asset_url }}"}}`);
        writeFile(root, 'assets/accordion.js', `export const id = 'accordion';\n`);
        writeFile(root, 'assets/dropdown.js', `export const id = 'dropdown';\n`);
        writeFile(root, 'sections/fixture.liquid', `<div x-data="accordion" data-module-id="accordion"></div>\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must map to assets\/accordion\.js/);
    });
});

test('import map entry pointing to a missing asset fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"utils":"{{ 'missing.js' | asset_url }}"}}`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /must map to an existing asset/);
    });
});

test('import map entry without a consumer fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"utils":"{{ 'utils.js' | asset_url }}"}}`);
        writeFile(root, 'assets/utils.js', `export const noop = () => {};\n`);
        const failures = await runThemeLint(root);
        assert.match(failureMessages(failures), /Import map entry "utils" is unused/);
    });
});

test('import map entry used by an asset import passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeEntryScripts(root, `{"imports":{"utils":"{{ 'utils.js' | asset_url }}"}}`);
        writeFile(root, 'assets/utils.js', `export const noop = () => {};\n`);
        writeFile(root, 'assets/feature.js', `import { noop } from 'utils';\nnoop();\n`);
        const failures = await runThemeLint(root);
        assert.equal(
            failures.filter((failure) => failure.checkId === 'module-import-map-unused').length,
            0,
            failureMessages(failures),
        );
    });
});

const MIGRATION_TYPOGRAPHY = `@utility heading-base { color: red; }
@utility heading-h2 { @apply heading-base; }
@utility body-sm { font-size: 1rem; }
`;
const MIGRATION_BASELINE = '.agents/skills/check-theme-architecture/scripts/migration-baseline.json';

function writeMigrationTheme(root, sectionMarkup, baseline) {
    writeFile(root, 'tailwind/tailwind.typography.css', MIGRATION_TYPOGRAPHY);
    writeFile(root, 'sections/a.liquid', sectionMarkup);
    if (baseline) writeFile(root, MIGRATION_BASELINE, JSON.stringify(baseline));
}

function runThemeLintArgs(root, args) {
    return spawnSync(process.execPath, [THEME_LINT_SCRIPT, '--root', root, ...args], {
        cwd: path.join(__dirname, '../../../../'),
        encoding: 'utf8',
    });
}

test('migration lint: a count above the baseline fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(root, '<div class="mt-4 gap-6 pc:flex heading-h2"></div>', {
            'legacy-breakpoint': { 'sections/a.liquid': 1 },
            'legacy-type-tier': { 'sections/a.liquid': 1 },
            'raw-spacing': { 'sections/a.liquid': 1 },
        });
        const failures = await runThemeLint(root);
        const migration = failures.filter((f) => f.message.startsWith('[raw-spacing]'));
        assert.equal(migration.length, 1);
        assert.match(migration[0].message, /2 use\(s\), baseline 1/);
        assert.equal(failures.filter((f) => /^\[legacy-/.test(f.message)).length, 0);
    });
});

test('migration lint: a drop passes with a shrink hint', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(root, '<div class="mt-4"></div>', {
            'legacy-breakpoint': {},
            'legacy-type-tier': {},
            'raw-spacing': { 'sections/a.liquid': 3 },
        });
        const notes = [];
        const failures = await runThemeLint(root, notes);
        assert.equal(failures.filter((f) => f.message.startsWith('[')).length, 0);
        assert.match(notes.join('\n'), /--shrink-migration-baseline/);
    });
});

test('migration lint: a file not in the baseline fails on its first use', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(root, '<p class="body-sm"></p>', {
            'legacy-breakpoint': {},
            'legacy-type-tier': {},
            'raw-spacing': {},
        });
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /\[legacy-type-tier\] 1 use\(s\), baseline 0/.test(f.message)));
    });
});

test('migration lint: schema option values, comments and stylesheets are not counted', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(
            root,
            [
                '{% comment %}<div class="mt-4 heading-h2 pc:flex"></div>{% endcomment %}',
                '<!-- <div class="gap-6"></div> -->',
                '{% # pc:mt-2 %}',
                '{% stylesheet %}.x { --a: mt-4; }{% endstylesheet %}',
                '{% schema %}{"settings":[{"type":"select","id":"s","options":[{"value":"heading-h2","label":"x"}],"default":"heading-h2"}]}{% endschema %}',
            ].join('\n'),
            { 'legacy-breakpoint': {}, 'legacy-type-tier': {}, 'raw-spacing': {} },
        );
        const failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.message.startsWith('[')).length, 0);
    });
});

test('migration lint: tiers come from the typography source, not a fixed list', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(root, '<h2 class="heading-h3 heading-base"></h2>', {
            'legacy-breakpoint': {},
            'legacy-type-tier': {},
            'raw-spacing': {},
        });
        let failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.message.startsWith('[legacy-type-tier]')).length, 0);

        writeFile(root, 'tailwind/tailwind.typography.css', `${MIGRATION_TYPOGRAPHY}@utility heading-h3 { font-size: 2rem; }\n`);
        failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.message.startsWith('[legacy-type-tier]')).length, 1);
    });
});

test('migration lint: token aliases, 0, px and auto are not raw spacing', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(root, '<div class="gap-related mt-0 px-px mx-auto pc:gap-group p-[1rem]"></div>', {
            'legacy-breakpoint': { 'sections/a.liquid': 1 },
            'legacy-type-tier': {},
            'raw-spacing': {},
        });
        const failures = await runThemeLint(root);
        const spacing = failures.filter((f) => f.message.startsWith('[raw-spacing]'));
        assert.equal(spacing.length, 1);
        assert.match(spacing[0].message, /1 use\(s\), baseline 0/);
    });
});

test('migration lint: a theme without a baseline fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(root, '<div></div>');
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /Migration baseline is missing/.test(f.message)));
    });
});

test('migration baseline flags: write refuses an existing file; shrink only lowers and removes', () => {
    withTempTheme((root) => {
        writeMigrationTheme(root, '<div class="mt-4 pc:flex"></div>');
        let result = runThemeLintArgs(root, ['--write-migration-baseline']);
        assert.equal(result.status, 0, result.stderr);
        const written = JSON.parse(fs.readFileSync(path.join(root, MIGRATION_BASELINE), 'utf8'));
        assert.deepEqual(written, {
            'legacy-breakpoint': { 'sections/a.liquid': 1 },
            'legacy-type-tier': {},
            'raw-spacing': { 'sections/a.liquid': 1 },
        });

        result = runThemeLintArgs(root, ['--write-migration-baseline']);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /refused/);

        writeFile(root, 'sections/a.liquid', '<div class="mt-4 mb-2 gap-6"></div>');
        writeFile(root, 'sections/b.liquid', '<div class="mt-4"></div>');
        result = runThemeLintArgs(root, ['--shrink-migration-baseline']);
        assert.equal(result.status, 0, result.stderr);
        const shrunk = JSON.parse(fs.readFileSync(path.join(root, MIGRATION_BASELINE), 'utf8'));
        assert.deepEqual(shrunk, {
            'legacy-breakpoint': {},
            'legacy-type-tier': {},
            'raw-spacing': { 'sections/a.liquid': 1 },
        });
    });
});

const STYLESHEET_OWNERSHIP_BASELINE =
    '.agents/skills/check-theme-architecture/scripts/stylesheet-ownership-baseline.json';

function writeStylesheetOwnershipTheme(root, sectionMarkup, baseline) {
    writeFile(root, 'tailwind/tailwind.typography.css', MIGRATION_TYPOGRAPHY);
    writeFile(root, 'assets/tailwind.output.css', '@layer utilities {\n  .flex { display: flex; }\n}\n');
    writeFile(root, 'sections/a.liquid', sectionMarkup);
    if (baseline) writeFile(root, STYLESHEET_OWNERSHIP_BASELINE, JSON.stringify(baseline));
}

test('stylesheet-layer lint: @layer inside stylesheet fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeStylesheetOwnershipTheme(
            root,
            ['{% stylesheet %}', '@layer components { .x { color: red; } }', '{% endstylesheet %}', ''].join('\n'),
            { 'stylesheet-font-size': {}, 'mixed-element': {} },
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /\[stylesheet-layer\]/.test(f.message)));
    });
});

test('stylesheet-font-size lint: new absolute size fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeStylesheetOwnershipTheme(
            root,
            ['{% stylesheet %}', '.new { font-size: 14px; }', '{% endstylesheet %}', ''].join('\n'),
            { 'stylesheet-font-size': {}, 'mixed-element': {} },
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /\[stylesheet-font-size\] 1 use\(s\), baseline 0/.test(f.message)));
    });
});

test('stylesheet-font-size lint: calc with rem in heading scale counts', async () => {
    await withTempThemeAsync(async (root) => {
        writeStylesheetOwnershipTheme(
            root,
            [
                '{% stylesheet %}',
                '.x { font-size: calc(var(--font-heading-scale) * 6.5rem); }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
            { 'stylesheet-font-size': {}, 'mixed-element': {} },
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /\[stylesheet-font-size\] 1 use\(s\), baseline 0/.test(f.message)));
    });
});

test('stylesheet-font-size lint: calc with scale ratio and em passes', async () => {
    const { isAllowedStylesheetFontSize } = require('./lib/stylesheet-ownership-lint');
    assert.equal(isAllowedStylesheetFontSize('calc(var(--font-body-scale) * var(--x-ratio) * 1em)'), true);
});

test('mixed-element lint: new mixed region fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeStylesheetOwnershipTheme(
            root,
            [
                '<div class="widget flex gap-4"></div>',
                '{% stylesheet %}',
                '.widget { display: block; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
            { 'stylesheet-font-size': {}, 'mixed-element': {} },
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /\[mixed-element\] 1 use\(s\), baseline 0/.test(f.message)));
    });
});

test('stylesheet ownership ratchet: drop passes with shrink hint', async () => {
    await withTempThemeAsync(async (root) => {
        writeStylesheetOwnershipTheme(
            root,
            [
                '<div class="widget flex"></div>',
                '{% stylesheet %}',
                '.widget { display: block; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
            { 'stylesheet-font-size': {}, 'mixed-element': { 'sections/a.liquid': 2 } },
        );
        const notes = [];
        const failures = await runThemeLint(root, notes);
        assert.equal(failures.filter((f) => f.message.startsWith('[mixed-element]')).length, 0);
        assert.match(notes.join('\n'), /--shrink-stylesheet-ownership-baseline/);
    });
});

test('stylesheet-layer lint: bare and comment-separated @layer forms fail', async () => {
    for (const css of ['@layer{ .x { color: red; } }', '@layer/**/components{ .x { color: red; } }', '@layer a, b;']) {
        await withTempThemeAsync(async (root) => {
            writeStylesheetOwnershipTheme(root, `{% stylesheet %}\n${css}\n{% endstylesheet %}\n`, {
                'stylesheet-font-size': {},
                'mixed-element': {},
            });
            const failures = await runThemeLint(root);
            assert.ok(
                failures.some((f) => /\[stylesheet-layer\]/.test(f.message)),
                css,
            );
        });
    }
});

test('stylesheet-font-size lint: only type steps, em / % and unitless multipliers pass', () => {
    const { isAllowedStylesheetFontSize } = require('./lib/stylesheet-ownership-lint');
    for (const value of [
        'inherit',
        'var(--type-step-2)',
        '1.2em',
        '90%',
        'calc(var(--font-body-scale) * var(--x-ratio) * 1em)',
        'calc(var(--type-step-1) * var(--font-heading-scale))',
        'clamp(1em, calc(var(--a-scale) * 1em), 2em)',
    ]) {
        assert.equal(isAllowedStylesheetFontSize(value), true, value);
    }
    for (const value of [
        '14px',
        '1rem',
        'var(--font-heading-scale)',
        'var(--font-pagination-size)',
        'calc(var(--font-heading-scale) * 6.5rem)',
        'calc(var(--font-body-scale) * 1cm)',
        'calc(var(--font-body-scale) * 1in)',
        'calc(var(--font-body-scale) * 1dvw)',
        'calc(var(--font-body-size-mobile) * 0.75)',
        'calc(var(--font-body-scale) * 2)',
        'clamp(3rem, 12vw, 7.5rem)',
    ]) {
        assert.equal(isAllowedStylesheetFontSize(value), false, value);
    }
});

test('stylesheet-font-size lint: a drop passes with a shrink hint', async () => {
    await withTempThemeAsync(async (root) => {
        writeStylesheetOwnershipTheme(root, '{% stylesheet %}\n.x { font-size: 14px; }\n{% endstylesheet %}\n', {
            'stylesheet-font-size': { 'sections/a.liquid': 3 },
            'mixed-element': {},
        });
        const notes = [];
        const failures = await runThemeLint(root, notes);
        assert.equal(failures.filter((f) => f.message.startsWith('[stylesheet-font-size]')).length, 0);
        assert.match(notes.join('\n'), /--shrink-stylesheet-ownership-baseline/);
    });
});

test('mixed-element lint: class attributes only, used class captures, compiled utility names', async () => {
    await withTempThemeAsync(async (root) => {
        writeStylesheetOwnershipTheme(
            root,
            [
                '<div data-class="widget flex"></div>',
                '{% capture unused_class %}widget flex{% endcapture %}',
                '<div class="widget w-1/2"></div>',
                '<div class="widget mt-0.5"></div>',
                '<div class="widget {% if x %}flex{% endif %}"></div>',
                '<div class="widget {{ extra }}"></div>',
                '{% capture used_class %}widget flex{% endcapture %}',
                '<div class="{{ used_class }}"></div>',
                '{% stylesheet %}',
                '.widget { display: block; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
            { 'stylesheet-font-size': {}, 'mixed-element': {} },
        );
        writeFile(
            root,
            'assets/tailwind.output.css',
            '@layer utilities {\n  .flex { display: flex; }\n  .w-1\\/2 { width: 50%; }\n  .mt-0\\.5 { margin-top: 0.125rem; }\n  .group-hover\\:flex { &:is(:where(.group):hover *) { display: flex; } }\n}\n',
        );
        const failures = await runThemeLint(root);
        const mixed = failures.find((f) => f.message.startsWith('[mixed-element]'));
        // Counted: w-1/2, mt-0.5, the {% if %} literal, the used capture. Not counted: data-class, unused capture, {{ extra }}.
        assert.ok(mixed, 'expected a mixed-element failure');
        assert.match(mixed.message, /4 use\(s\), baseline 0/);
    });
});

test('mixed-element lint: captures count per element that outputs them; static tokens around Liquid count', () => {
    const { collectStylesheetOwnershipCounts } = require('./lib/stylesheet-ownership-lint');
    const cases = [
        ['{% capture used_class %}flex{% endcapture %}<div class="widget {{ used_class }}"></div>', 1],
        ['{% capture m_class %}widget flex{% endcapture %}<div class="{{ m_class }}"></div><p class="{{ m_class }}"></p>', 2],
        ['{% capture m_class %}widget flex{% endcapture %}<div class="widget flex {{ m_class }}"></div>', 1],
        ['<div class="widget body-lg color-{{ settings.color_scheme }}"></div>', 1],
        ['<div class="widget {{ settings.size }}"></div>', 0],
        ['<div class="widget color-{{ x }}"></div>', 0],
        [
            '{% capture inner_class %}widget flex{% endcapture %}{% capture outer_class %}{{ inner_class }}{% endcapture %}<div class="{{ outer_class }}"></div>',
            1,
        ],
        [
            '{% capture inner_class %}widget flex{% endcapture %}{% capture outer_class %}{{ inner_class }}{% endcapture %}<div class="{{ outer_class }}"></div><p class="{{ outer_class }}"></p>',
            2,
        ],
        [
            '{% capture a_class %}widget {{ b_class }}{% endcapture %}{% capture b_class %}flex {{ a_class }}{% endcapture %}<div class="{{ a_class }}"></div>',
            1,
        ],
        [
            '{% capture d_class %}flex{% endcapture %}{% capture c_class %}{{ d_class }}{% endcapture %}{% capture b_class %}{{ c_class }}{% endcapture %}{% capture a_class %}widget {{ b_class }}{% endcapture %}<div class="{{ a_class }}"></div>',
            1,
        ],
        [
            '{% capture inner_class %}widget flex{% endcapture %}{% capture outer_class %}{{ inner_class }}{% endcapture %}<div class="{{ outer_class }} {{ outer_class }}"></div>',
            1,
        ],
        ['{% capture extra %}flex{% endcapture %}<div class="widget {{ extra }}"></div>', 0],
        [
            '{% capture extra %}flex{% endcapture %}{% capture outer_class %}widget {{ extra }}{% endcapture %}<div class="{{ outer_class }}"></div>',
            0,
        ],
    ];
    for (const [markup, expected] of cases) {
        withTempTheme((root) => {
            writeStylesheetOwnershipTheme(root, `${markup}\n{% stylesheet %}.widget { display: block; }{% endstylesheet %}\n`);
            writeFile(
                root,
                'assets/tailwind.output.css',
                '@layer utilities {\n  .flex { display: flex; }\n  .body-lg { font-size: 1rem; }\n}\n',
            );
            const counts = collectStylesheetOwnershipCounts(root);
            assert.equal(counts['mixed-element']['sections/a.liquid']?.count ?? 0, expected, markup);
        });
    }
});

test('stylesheet ownership baseline flags: write refuses an existing file; shrink only lowers and removes', () => {
    withTempTheme((root) => {
        writeStylesheetOwnershipTheme(
            root,
            [
                '<div class="widget flex"></div>',
                '<div class="widget flex"></div>',
                '{% stylesheet %}',
                '.widget { display: block; font-size: 14px; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        let result = runThemeLintArgs(root, ['--write-stylesheet-ownership-baseline']);
        assert.equal(result.status, 0, result.stderr);
        const written = JSON.parse(fs.readFileSync(path.join(root, STYLESHEET_OWNERSHIP_BASELINE), 'utf8'));
        assert.deepEqual(written, {
            'mixed-element': { 'sections/a.liquid': 2 },
            'stylesheet-font-size': { 'sections/a.liquid': 1 },
        });

        result = runThemeLintArgs(root, ['--write-stylesheet-ownership-baseline']);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /refused/);

        writeFile(
            root,
            'sections/a.liquid',
            [
                '<div class="widget flex"></div>',
                '<div class="widget flex"></div>',
                '<div class="widget flex"></div>',
                '{% stylesheet %}',
                '.widget { display: block; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        result = runThemeLintArgs(root, ['--shrink-stylesheet-ownership-baseline']);
        assert.equal(result.status, 0, result.stderr);
        const shrunk = JSON.parse(fs.readFileSync(path.join(root, STYLESHEET_OWNERSHIP_BASELINE), 'utf8'));
        assert.deepEqual(shrunk, { 'mixed-element': { 'sections/a.liquid': 2 }, 'stylesheet-font-size': {} });
    });
});

test('stylesheet media queries: tokenized widths and the two hover conditions pass', () => {
    for (const prelude of [
        ' (width >= 48rem) ',
        '(width < 64rem)',
        '(width >= 80rem)',
        '(hover: hover) and (pointer: fine)',
        'not ((hover: hover) and (pointer: fine))',
        '(prefers-reduced-motion: reduce)',
        '(width >= 64rem) and (hover: hover) and (pointer: fine)',
    ]) {
        assert.equal(isAllowedStylesheetMedia(prelude), true, prelude);
    }
});

test('stylesheet media queries: px, min/max-width, other numbers and bare hover fail', () => {
    for (const prelude of [
        '(min-width: 768px)',
        '(max-width: 1023px)',
        '(min-width: 64rem)',
        '(width >= 900px)',
        '(width >= 60rem)',
        '(hover: hover)',
        '(hover: none), (pointer: coarse)',
    ]) {
        assert.equal(isAllowedStylesheetMedia(prelude), false, prelude);
    }
});

test('stylesheet media queries: a failing query in a Liquid stylesheet is reported', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/a.liquid',
            '<div></div>\n{% stylesheet %}\n.a { color: red; }\n@media (min-width: 768px) { .a { display: none; } }\n{% endstylesheet %}\n',
        );
        const failures = await runThemeLint(root);
        const media = failures.filter((f) => f.message.includes('Liquid stylesheet media queries'));
        assert.equal(media.length, 1);
        assert.equal(media[0].line, 4);
    });
});

test('unloaded font weights: markup classes, stylesheet weights and @apply fail', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/a.liquid',
            [
                '<p class="font-medium pc:font-semibold">x</p>',
                '<p class="font-normal font-bold">ok</p>',
                '{% comment %}<p class="font-light"></p>{% endcomment %}',
                '{% stylesheet %}',
                '.a { font-weight: 500; }',
                '.b { font-weight: 700; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        writeFile(root, 'tailwind/tailwind.components.css', '.c { @apply body-xl font-medium; }\n.d { font-weight: 400; }\n');
        const failures = (await runThemeLint(root)).filter((f) => f.message.startsWith('Only the regular and bold'));
        assert.deepEqual(
            failures.map((f) => `${f.file}:${f.line}`).sort(),
            ['sections/a.liquid:1', 'sections/a.liquid:1', 'sections/a.liquid:5', 'tailwind/tailwind.components.css:1'],
        );
    });
});

test('cross review C1-C3 F1: the important modifier does not bypass the lints', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(root, '<p class="font-medium! hover:font-semibold! heading-h2! mt-4!">x</p>', {
            'legacy-breakpoint': {},
            'legacy-type-tier': {},
            'raw-spacing': {},
        });
        writeFile(root, 'tailwind/tailwind.components.css', '.c { @apply font-medium!; }\n.d { font-weight: 400.5; }\n');
        const failures = await runThemeLint(root);
        const weight = failures.filter((f) => f.message.startsWith('Only the regular and bold'));
        assert.equal(weight.length, 4, failureMessages(weight));
        assert.ok(failures.some((f) => f.message.startsWith('[legacy-type-tier] 1 use')));
        assert.ok(failures.some((f) => f.message.startsWith('[raw-spacing] 1 use')));
    });
});

test('cross review C1-C3 F2: liquid comment lines and text content are not class usage', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(
            root,
            [
                '{% liquid',
                '  # mt-4 heading-h2 pc:flex font-medium',
                "  assign extra = 'mt-4'",
                '%}',
                '<p>Please remove mt-4 and font-medium from this example.</p>',
                '<div class="{{ extra }} gap-6" data-note="pc:flex"></div>',
            ].join('\n'),
            { 'legacy-breakpoint': {}, 'legacy-type-tier': {}, 'raw-spacing': {} },
        );
        const failures = await runThemeLint(root);
        const spacing = failures.filter((f) => f.message.startsWith('[raw-spacing]'));
        assert.equal(spacing.length, 1, failureMessages(failures));
        assert.match(spacing[0].message, /2 use\(s\), baseline 0; .* Lines: 3, 6\./);
        assert.equal(failures.filter((f) => f.message.startsWith('[legacy-type-tier]')).length, 0);
        assert.equal(failures.filter((f) => f.message.startsWith('Only the regular and bold')).length, 0);
        // Attribute values count, whatever the attribute: pc:flex in data-note is one breakpoint use.
        assert.ok(failures.some((f) => f.message.startsWith('[legacy-breakpoint] 1 use')));
    });
});

test('cross review C1-C3 F3: the media grammar has no placeholder and no half hover pair', () => {
    for (const prelude of ['HOVER', '(hover: hover)', '(pointer: fine)', '(pointer: fine) and (hover: hover)', '']) {
        assert.equal(isAllowedStylesheetMedia(prelude), false, prelude);
    }
});

test('cross review C1-C3 F4: --write-migration-baseline refuses any existing file', () => {
    withTempTheme((root) => {
        writeMigrationTheme(root, '<div class="mt-4"></div>');
        writeFile(root, MIGRATION_BASELINE, 'null');
        const result = runThemeLintArgs(root, ['--write-migration-baseline']);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /refused/);
        assert.equal(fs.readFileSync(path.join(root, MIGRATION_BASELINE), 'utf8'), 'null');
    });
});

test('cross review C1-C3 F2: class lists in {% capture *class* %} blocks are counted, other captures are text', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(
            root,
            [
                '{% capture item_classes %}block px-4 font-medium {% if x %}py-2{% endif %}{% endcapture %}',
                '{% capture intro %}Use px-4 in copy.{% endcapture %}',
            ].join('\n'),
            { 'legacy-breakpoint': {}, 'legacy-type-tier': {}, 'raw-spacing': {} },
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /^\[raw-spacing\] 2 use\(s\)/.test(f.message)), failureMessages(failures));
        assert.equal(failures.filter((f) => f.message.startsWith('Only the regular and bold')).length, 1);
    });
});

test('cross review 2 of C1-C3: a quoted > inside an attribute does not end the tag', async () => {
    await withTempThemeAsync(async (root) => {
        writeMigrationTheme(
            root,
            [
                '<div title="a > b" class="mt-4 font-medium"></div>',
                `<div :class="count > 1 ? 'gap-6' : 'gap-related'"></div>`,
            ].join('\n'),
            { 'legacy-breakpoint': {}, 'legacy-type-tier': {}, 'raw-spacing': {} },
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => /^\[raw-spacing\] 2 use\(s\)/.test(f.message)), failureMessages(failures));
        assert.equal(failures.filter((f) => f.message.startsWith('Only the regular and bold')).length, 1);
    });
});

test('cross review 2 of C1-C3: no-hover stands alone, as documented', () => {
    assert.equal(isAllowedStylesheetMedia('not ((hover: hover) and (pointer: fine))'), true);
    assert.equal(isAllowedStylesheetMedia('not ((hover: hover) and (pointer: fine)) and (width >= 64rem)'), false);
    assert.equal(isAllowedStylesheetMedia('(width >= 64rem) and not ((hover: hover) and (pointer: fine))'), false);
});

// 6-C4 raw-colour: role tokens only.
function rawColourMessages(failures) {
    return failures.filter((f) => f.checkId === 'raw-colour').map((f) => `${f.file}:${f.line} ${f.message}`);
}

test('raw-colour markup: opacity modifiers, black/white and default shadows fail; roles pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<p class="text-theme-text/80 hover:border-theme-border/[0.3]">a</p>',
                '<div class="bg-black can-hover:bg-white shadow shadow-2xl shadow-[0_1px_2px_red]"></div>',
                '<div class="text-muted text-subtle text-faint border-line border-line-strong bg-surface-muted bg-surface-strong bg-veil bg-scrim bg-scrim-strong text-on-scrim text-on-scrim-muted shadow-sm shadow-md shadow-lg shadow-none w-1/2 top-1/2"></div>',
                '',
            ].join('\n'),
        );
        const messages = rawColourMessages(await runThemeLint(root));
        assert.equal(messages.length, 7, messages.join('\n'));
        assert.equal(messages.filter((m) => m.includes(':1 ')).length, 2);
        assert.equal(messages.filter((m) => m.includes(':2 ')).length, 5);
    });
});

test('raw-colour css: numeric alpha, color-mix, literals and direct steps fail; setting-driven alpha passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.a { color: rgba(var(--color-foreground), 0.6); }',
                '.b { border-color: color-mix(in oklab, rgb(var(--color-border)) 20%, transparent); }',
                '.c { background-color: #fff; }',
                '.d { box-shadow: 0 1px 2px rgb(0 0 0 / 0.1); }',
                '.e { color: white; }',
                '.f { opacity: 1; color: rgba(var(--color-foreground), var(--alpha-72)); }',
                '.ok { color: var(--color-muted); box-shadow: 0 0 2px rgba(var(--color-foreground), var(--button-shadow-opacity)); outline-color: rgba(var(--color-focus-ring), var(--focus-ring-opacity, 0.4)); }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const messages = rawColourMessages(await runThemeLint(root));
        assert.equal(messages.length, 6, messages.join('\n'));
        for (const line of [2, 3, 4, 5, 6, 7]) {
            assert.ok(messages.some((m) => m.startsWith(`sections/fixture.liquid:${line} `)), `line ${line}`);
        }
    });
});

test('raw-colour css files: @apply is checked, the token file is exempt, lint-allow needs the check id', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'tailwind/tailwind.components.css', '.c { @apply bg-black/50 text-muted; }\n');
        writeFile(root, 'tailwind/tailwind.input.css', '@theme inline { --color-scrim: rgba(0, 0, 0, var(--alpha-50)); }\n');
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{%- # lint-allow raw-colour: owner 6-C9, card surface scheme role -%}',
                '<div class="bg-white"></div>',
                '',
            ].join('\n'),
        );
        const messages = rawColourMessages(await runThemeLint(root));
        assert.equal(messages.length, 1, messages.join('\n'));
        assert.match(messages[0], /^tailwind\/tailwind\.components\.css:1 .*opacity modifier bg-black\/50/);
    });
});

test('raw-colour review round 1: inline styles, fractional and variable modifiers, calc alpha, color(), currentColor shadows, bridge tokens', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '<div style="color: rgba(var(--color-foreground), .5); background: #fff;"></div>',
                '<div class="text-theme-text/12.5 text-theme-text/(--opacity)"></div>',
                '{% stylesheet %}',
                '.a { color: rgba(var(--color-foreground), calc(.5)); }',
                '.b { color: color(srgb 1 1 1 / .5); }',
                '.c { box-shadow: 0 1px 2px currentColor; }',
                '.d { outline-color: var(--color-theme-text); }',
                '.ok { mask: url("sprite.svg#face"); color: rgba(var(--color-foreground),',
                '    var(--setting-opacity)); }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        writeFile(root, 'tailwind/tailwind.components.css', '.e { @apply text-theme-text/12.5; }\n');
        const messages = rawColourMessages(await runThemeLint(root));
        const lines = messages.map((m) => m.split(' ')[0]);
        assert.deepEqual(
            [...new Set(lines)].sort(),
            [
                'sections/fixture.liquid:1',
                'sections/fixture.liquid:2',
                'sections/fixture.liquid:4',
                'sections/fixture.liquid:5',
                'sections/fixture.liquid:6',
                'sections/fixture.liquid:7',
                'tailwind/tailwind.components.css:1',
            ],
            messages.join('\n'),
        );
        assert.equal(lines.filter((l) => l === 'sections/fixture.liquid:1').length, 2);
        assert.equal(lines.filter((l) => l === 'sections/fixture.liquid:2').length, 2);
    });
});

function writeRoleFiles(root, sourceRoles, runtimeRoles) {
    writeFile(root, 'tailwind/tailwind.input.css', `@theme inline {\n${sourceRoles.join('\n')}\n}\n`);
    writeFile(
        root,
        'snippets/css-variables.liquid',
        [
            '{% style %}',
            '{% for scheme in settings.color_schemes %}',
            '.color-{{ scheme.id }} {',
            '    --color-foreground: {{ scheme.settings.text_color.red }}, 0, 0;',
            ...runtimeRoles,
            '}',
            '{% endfor %}',
            '{% endstyle %}',
            '',
        ].join('\n'),
    );
}

test('colour-role-sync: scheme-dependent roles must be re-declared per scheme with the same value', async () => {
    const muted = '    --color-muted: rgba(var(--color-foreground), var(--alpha-80));';
    const scrim = '    --color-scrim: rgba(0, 0, 0, var(--alpha-50));';
    const bridge = '    --color-theme-text: rgb(var(--color-foreground));';
    const shadow = '    --shadow-sm: 0 1px 3px rgba(0, 0, 0, var(--alpha-shadow-sm));';
    const sync = (failures) => failures.filter((f) => f.checkId === 'colour-role-sync').map((f) => f.message);

    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [muted, scrim, bridge, shadow], [muted, shadow]);
        assert.deepEqual(sync(await runThemeLint(root)), []);
    });
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [muted, shadow], [muted]);
        assert.match(sync(await runThemeLint(root)).join('\n'), /--shadow-sm depends on the scheme but is not re-declared/);
    });
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [muted], ['    --color-muted: rgba(var(--color-foreground), var(--alpha-72));']);
        assert.match(sync(await runThemeLint(root)).join('\n'), /--color-muted differs/);
    });
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [muted], [muted, '    --color-stale: rgba(var(--color-foreground), var(--alpha-5));']);
        assert.match(sync(await runThemeLint(root)).join('\n'), /--color-stale is re-declared per scheme but is not/);
    });
});

test('raw-colour review round 2: spaced var(), named colours in colour properties, words in strings pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% stylesheet %}',
                '.a { color: rgba(var( --color-foreground ), .5); }',
                '.b { color: orange; }',
                '.c { border: 1px solid tomato; }',
                '.d { --overlay: white; }',
                '.ok { content: "choose white today"; font-family: Gold, serif; animation-name: tan; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const messages = rawColourMessages(await runThemeLint(root));
        const lines = messages.map((m) => m.split(' ')[0]).sort();
        assert.deepEqual(
            lines,
            ['sections/fixture.liquid:2', 'sections/fixture.liquid:3', 'sections/fixture.liquid:4', 'sections/fixture.liquid:5'],
            messages.join('\n'),
        );
    });
});

test('colour-role-sync review round 2: a conditional or repeated per-scheme role fails', async () => {
    const muted = '    --color-muted: rgba(var(--color-foreground), var(--alpha-80));';
    const sync = (failures) => failures.filter((f) => f.checkId === 'colour-role-sync').map((f) => f.message);
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [muted], ['{%- if scheme_brightness < 128 -%}', muted, '{%- endif -%}']);
        assert.match(sync(await runThemeLint(root)).join('\n'), /--color-muted is declared inside a Liquid condition/);
    });
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [muted], [muted, muted]);
        assert.match(sync(await runThemeLint(root)).join('\n'), /--color-muted is declared 2 times/);
    });
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [muted], ['{%- if x -%}', '    --alpha-shadow-sm: 0.3;', '{%- endif -%}', muted]);
        assert.deepEqual(sync(await runThemeLint(root)), []);
    });
});

const DEAD_SETTINGS_BASELINE =
    '.agents/skills/check-theme-architecture/scripts/dead-settings-baseline.json';

function writeJsOutletFixture(root, jsFile, jsBody) {
    writeFile(root, 'assets/events.js', 'export {};\n');
    writeFile(root, 'assets/https.js', 'export {};\n');
    writeFile(root, jsFile, jsBody);
}

function writeDeadSettingSection(root, markup, schema, baseline) {
    writeFile(
        root,
        'sections/fixture.liquid',
        `${markup}\n{% schema %}${JSON.stringify(schema)}{% endschema %}\n`,
    );
    if (baseline !== undefined) {
        writeFile(root, DEAD_SETTINGS_BASELINE, JSON.stringify(baseline));
    }
}

function writeGlobalSettingsSchema(root, settings, baseline) {
    writeFile(root, 'config/settings_schema.json', JSON.stringify([{ name: 'theme', settings }]));
    if (baseline !== undefined) {
        writeFile(root, DEAD_SETTINGS_BASELINE, JSON.stringify(baseline));
    }
}

test('js-custom-event: CustomEvent outside events.js fails; inside passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeJsOutletFixture(root, 'assets/accordion.js', "new CustomEvent('x');\n");
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => f.checkId === 'js-custom-event'));
    });
    await withTempThemeAsync(async (root) => {
        writeJsOutletFixture(root, 'assets/events.js', "export function emit() { new CustomEvent('x'); }\n");
        const failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.checkId === 'js-custom-event').length, 0);
    });
});

test('js-section-mutation: mutations outside https.js fail; inside https.js pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeJsOutletFixture(root, 'assets/accordion.js', 'el.innerHTML = "";\n');
        let failures = await runThemeLint(root);
        assert.ok(failures.some((f) => f.checkId === 'js-section-mutation' && /innerHTML/.test(f.message)));

        writeFile(root, 'assets/accordion.js', 'el.outerHTML = "";\n');
        failures = await runThemeLint(root);
        assert.ok(failures.some((f) => f.checkId === 'js-section-mutation' && /outerHTML/.test(f.message)));

        writeFile(root, 'assets/accordion.js', 'el.replaceWith(next);\n');
        failures = await runThemeLint(root);
        assert.ok(failures.some((f) => f.checkId === 'js-section-mutation' && /replaceWith/.test(f.message)));
    });
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'assets/https.js',
            'target.innerHTML = x; old.outerHTML = y; node.replaceWith(next);\n',
        );
        writeFile(root, 'assets/events.js', 'export {};\n');
        const failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.checkId === 'js-section-mutation').length, 0);
    });
});

test('js-section-mutation: lint-allow suppresses a violation', async () => {
    await withTempThemeAsync(async (root) => {
        writeJsOutletFixture(
            root,
            'assets/accordion.js',
            '/* lint-allow js-section-mutation: fixture probe */\nel.innerHTML = "";\n',
        );
        const failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.checkId === 'js-section-mutation').length, 0);
    });
});

test('dead-setting: unused section setting fails when not baselined', async () => {
    await withTempThemeAsync(async (root) => {
        writeDeadSettingSection(
            root,
            '<div>{{ section.settings.used }}</div>',
            { settings: [{ type: 'text', id: 'used' }, { type: 'text', id: 'unused' }] },
            { 'dead-setting': {} },
        );
        const dead = (await runThemeLint(root)).filter((f) => f.checkId === 'dead-setting');
        assert.equal(dead.length, 1, dead.map((f) => f.message).join('\n'));
        assert.equal(dead[0].file, 'sections/fixture.liquid');
        assert.match(dead[0].message, /unused/);
    });
});

test('dead-setting: setting used only in a rendered snippet passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'snippets/child.liquid', '<span>{{ section.settings.from_snippet }}</span>\n');
        writeDeadSettingSection(
            root,
            "{% render 'child', section: section %}",
            { settings: [{ type: 'text', id: 'from_snippet' }] },
            { 'dead-setting': {} },
        );
        const failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.checkId === 'dead-setting').length, 0);
    });
});

test('dead-setting: setting used through a two-level render chain passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'snippets/mid.liquid', "{% render 'leaf', section: section %}\n");
        writeFile(root, 'snippets/leaf.liquid', '{{ section.settings.deep }}\n');
        writeDeadSettingSection(
            root,
            "{% render 'mid', section: section %}",
            { settings: [{ type: 'text', id: 'deep' }] },
            { 'dead-setting': {} },
        );
        const failures = await runThemeLint(root);
        assert.equal(failures.filter((f) => f.checkId === 'dead-setting').length, 0);
    });
});

test('dead-setting: unused global setting fails when not baselined', async () => {
    await withTempThemeAsync(async (root) => {
        writeGlobalSettingsSchema(
            root,
            [{ type: 'text', id: 'live' }, { type: 'text', id: 'dead_global' }],
            { 'dead-setting': {} },
        );
        writeFile(root, 'sections/fixture.liquid', '{{ settings.live }}\n');
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => f.checkId === 'dead-setting' && /dead_global/.test(f.message)));
    });
});

test('dead-setting: dynamic settings access is reported as unprovable in notes', async () => {
    await withTempThemeAsync(async (root) => {
        writeDeadSettingSection(
            root,
            '{% assign k = "x" %}{{ settings[k] }}',
            { settings: [{ type: 'text', id: 'maybe' }] },
            { 'dead-setting': {} },
        );
        const notes = [];
        const failures = await runThemeLint(root, notes);
        assert.equal(failures.filter((f) => f.checkId === 'dead-setting').length, 0);
        assert.match(notes.join('\n'), /dead-setting-unprovable.*sections\/fixture\.liquid/);
    });
});

test('dead-setting baseline: write refuses an existing file; new dead entry fails the ratchet', async () => {
    await withTempThemeAsync(async (root) => {
        writeDeadSettingSection(
            root,
            '<div></div>',
            { settings: [{ type: 'text', id: 'orphan' }] },
            { 'dead-setting': { 'sections/fixture.liquid|section|orphan': 1 } },
        );
        const refused = runThemeLintArgs(root, ['--write-dead-settings-baseline']);
        assert.notEqual(refused.status, 0);
        assert.match(refused.stderr, /refused/);

        writeFile(
            root,
            'sections/fixture.liquid',
            '<div></div>\n{% schema %}{"settings":[{"type":"text","id":"orphan"},{"type":"text","id":"new_dead"}]}{% endschema %}\n',
        );
        const failures = await runThemeLint(root);
        assert.ok(failures.some((f) => f.checkId === 'dead-setting' && /new_dead/.test(f.message)));
        assert.equal(failures.filter((f) => /orphan/.test(f.message)).length, 0);
    });
});

test('dead-setting: block settings read through any loop variable pass; an unused block setting fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeDeadSettingSection(
            root,
            [
                '{% for card_block in section.blocks %}',
                '  {%- assign quote = card_block.settings.quote -%}',
                "  {{ image_block.settings['image'] }}",
                '{% endfor %}',
            ].join('\n'),
            {
                blocks: [
                    {
                        type: 'card',
                        settings: [
                            { type: 'text', id: 'quote' },
                            { type: 'image_picker', id: 'image' },
                            { type: 'text', id: 'never_read' },
                        ],
                    },
                ],
            },
            { 'dead-setting': {} },
        );
        const dead = (await runThemeLint(root)).filter((f) => f.checkId === 'dead-setting');
        assert.equal(dead.length, 1, dead.map((f) => f.message).join('\n'));
        assert.match(dead[0].message, /never_read/);
    });
});

test('6-V2 review: global-qualified CustomEvent constructors fail outside events.js', async () => {
    for (const spelling of ['new window.CustomEvent', 'new globalThis.CustomEvent', 'new self.CustomEvent']) {
        await withTempThemeAsync(async (root) => {
            writeJsOutletFixture(root, 'assets/accordion.js', `${spelling}('x');\n`);
            const failures = await runThemeLint(root);
            assert.ok(failures.some((f) => f.checkId === 'js-custom-event'), spelling);
        });
    }
});

test('6-V2 review: a same-named setting in another scope does not count as usage', async () => {
    const deadIds = async (root) =>
        (await runThemeLint(root)).filter((f) => f.checkId === 'dead-setting').map((f) => f.message);

    // Section setting read only as a block setting.
    await withTempThemeAsync(async (root) => {
        writeDeadSettingSection(
            root,
            '{% for block in section.blocks %}{{ block.settings.title }}{% endfor %}',
            { settings: [{ type: 'text', id: 'title' }], blocks: [{ type: 'b', settings: [{ type: 'text', id: 'title' }] }] },
            { 'dead-setting': {} },
        );
        const dead = await deadIds(root);
        assert.equal(dead.length, 1, dead.join('\n'));
        assert.match(dead[0], /section.*title|title.*section/i);
    });
    // Block setting read only as a section setting.
    await withTempThemeAsync(async (root) => {
        writeDeadSettingSection(
            root,
            '{{ section.settings.title }}',
            { settings: [{ type: 'text', id: 'title' }], blocks: [{ type: 'b', settings: [{ type: 'text', id: 'title' }] }] },
            { 'dead-setting': {} },
        );
        const dead = await deadIds(root);
        assert.equal(dead.length, 1, dead.join('\n'));
        assert.match(dead[0], /block/i);
    });
    // Global setting read only as a section setting.
    await withTempThemeAsync(async (root) => {
        writeGlobalSettingsSchema(root, [{ type: 'text', id: 'title' }], { 'dead-setting': {} });
        writeDeadSettingSection(root, '{{ section.settings.title }}', { settings: [{ type: 'text', id: 'title' }] });
        const dead = await deadIds(root);
        assert.equal(dead.length, 1, dead.join('\n'));
        assert.match(dead[0], /global|settings_schema/i);
    });
});

test('page-token-scope: sections must not read --page-width or --page-margin', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/good.liquid',
            `<div class="x">{% stylesheet %}.x { padding-inline: var(--page-inset); }{% endstylesheet %}</div>\n`,
        );
        assert.deepEqual(
            (await runThemeLint(root)).filter((f) => f.checkId === 'page-token-scope'),
            [],
        );
    });
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/bad.liquid',
            `<div>{% stylesheet %}.x { margin-inline: var(--page-margin); }{% endstylesheet %}</div>\n`,
        );
        const failures = (await runThemeLint(root)).filter((f) => f.checkId === 'page-token-scope');
        assert.equal(failures.length, 1);
    });
});

test('screen-height-literal: one-screen heights use var(--screen-height)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/good.liquid',
            `<div>{% stylesheet %}.x { min-height: var(--screen-height); }{% endstylesheet %}</div>\n`,
        );
        assert.deepEqual(
            (await runThemeLint(root)).filter((f) => f.checkId === 'screen-height-literal'),
            [],
        );
    });
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/bad.liquid',
            `<div>{% stylesheet %}.x { min-height: 100svh; }{% endstylesheet %}</div>\n`,
        );
        const failures = (await runThemeLint(root)).filter((f) => f.checkId === 'screen-height-literal');
        assert.equal(failures.length, 1);
    });
});

test('frame-full-allowlist: width full only on allowlisted sections', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/article.liquid', `{% render 'section-frame', width: 'full' %}\n`);
        assert.deepEqual(
            (await runThemeLint(root)).filter((f) => f.checkId === 'frame-full-allowlist'),
            [],
        );
    });
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/featured-collection.liquid', `{% render 'section-frame', width: 'full' %}\n`);
        const failures = (await runThemeLint(root)).filter((f) => f.checkId === 'frame-full-allowlist');
        assert.equal(failures.length, 1);
    });
});

test('6-C5 review: page frame lints resist bypasses and report true lines', async () => {
    const lintIds = async (root, checkId) => (await runThemeLint(root)).filter((f) => f.checkId === checkId);

    // Whitespace inside var( still reads the token; a commented mention does not.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/spaced.liquid', `{% stylesheet %}.x { width: var( --page-width); }{% endstylesheet %}\n`);
        writeFile(root, 'sections/commented.liquid', `{% comment %}var(--page-width){% endcomment %}{%- # var(--page-margin) -%}\n`);
        const failures = await lintIds(root, 'page-token-scope');
        assert.deepEqual(failures.map((f) => f.file), ['sections/spaced.liquid']);
    });

    // CRLF files report the real line.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/crlf.liquid', `${'<div></div>\r\n'.repeat(100)}{% stylesheet %}.x { min-height: 100lvh; }{% endstylesheet %}\r\n`);
        const failures = await lintIds(root, 'screen-height-literal');
        assert.deepEqual(failures.map((f) => f.line), [101]);
    });

    // Only the exact header menu cap is excepted, not another 100dvh or a literal on the same line.
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/header.liquid',
            [
                '{% stylesheet %}',
                '.menu { max-height: calc(100dvh - var(--announcement-bar-height) - var(--header-height)); }',
                '.page { max-height: calc(100dvh - 1rem); }',
                '.menu { max-height: calc(100dvh - var(--announcement-bar-height) - var(--header-height)); height: 100lvh; }',
                '{% endstylesheet %}',
                '',
            ].join('\n'),
        );
        const failures = await lintIds(root, 'screen-height-literal');
        assert.deepEqual(failures.map((f) => f.line), [3, 4]);
    });

    // Layout files are in scope.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'layout/theme.liquid', `<style>.x { min-height: 100vh; }</style>\n`);
        assert.equal((await lintIds(root, 'screen-height-literal')).length, 1);
    });

    // Full width: double quotes and snippets count, other renders and liquid-tag neighbours do not.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/double-quoted.liquid', `{% render "section-frame", width: "full" %}\n`);
        writeFile(root, 'snippets/frame-wrapper.liquid', `{% render 'section-frame',\n    section: section,\n    width: 'full'\n%}\n`);
        writeFile(
            root,
            'sections/other-render.liquid',
            `{% render 'image', width: 'full' %}\n{% liquid\n  render 'section-frame', width: 'page'\n  render 'button', width: 'full'\n%}\n`,
        );
        const failures = await lintIds(root, 'frame-full-allowlist');
        assert.deepEqual(
            failures.map((f) => `${f.file}:${f.line}`).sort(),
            ['sections/double-quoted.liquid:1', 'snippets/frame-wrapper.liquid:3'],
        );
    });
});

test('6-C5 review 2: comment, whitespace and quoting edge cases', async () => {
    const lintIds = async (root, checkId) => (await runThemeLint(root)).filter((f) => f.checkId === checkId);

    // A quoted `/*` cannot hide live CSS: CSS and HTML comments are not masked, so mentions there fail closed.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/quoted.liquid', `{% stylesheet %}.x{content:"/*";height:100svh;width:var(--page-width)} /* note */{% endstylesheet %}\n`);
        assert.equal((await lintIds(root, 'screen-height-literal')).length, 1);
        assert.equal((await lintIds(root, 'page-token-scope')).length, 1);
    });

    // Tag form with deep indentation before `render` keeps the multiline arguments.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/indented.liquid', `{%          render 'section-frame',\n    width: 'full'\n%}\n`);
        assert.deepEqual((await lintIds(root, 'frame-full-allowlist')).map((f) => f.line), [2]);
    });

    // Text inside another quoted argument is not a width argument; `{% liquid %}` comment lines are not code.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/quoted-arg.liquid', `{% render 'section-frame', width: 'page', root_attrs: "width: 'full'" %}\n`);
        writeFile(root, 'sections/liquid-comment.liquid', `{% liquid\n  # render 'section-frame', width: 'full'\n  echo 1\n%}\n`);
        assert.deepEqual(await lintIds(root, 'frame-full-allowlist'), []);
    });

    // page-token-scope stays on sections and snippets, as authorized.
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'layout/theme.liquid', `<style>.x { width: var(--page-width); }</style>\n`);
        assert.deepEqual(await lintIds(root, 'page-token-scope'), []);
    });
});

test('colour-setting: allowlisted global badge colours pass', async () => {
    await withTempThemeAsync(async (root) => {
        writeGlobalSettingsSchema(
            root,
            [
                { type: 'color', id: 'badge_sale_background', default: '#000' },
                { type: 'color', id: 'badge_sale_text', default: '#fff' },
            ],
            {},
        );
        const colour = (await runThemeLint(root)).filter((f) => f.checkId === 'colour-setting');
        assert.equal(colour.length, 0, colour.map((f) => f.message).join('\n'));
    });
});

test('colour-setting: a non-allowlisted colour setting in section schema fails', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{% schema %}',
                '{ "name": "Fixture", "settings": [{ "type": "color", "id": "accent_override", "label": "Accent" }] }',
                '{% endschema %}',
                '',
            ].join('\n'),
        );
        const colour = (await runThemeLint(root)).filter((f) => f.checkId === 'colour-setting');
        assert.equal(colour.length, 1);
        assert.match(colour[0].message, /accent_override/);
    });
});

test('6-C9 review: the badge allowlist is global only, and {%- schema -%} is read', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(
            root,
            'sections/fixture.liquid',
            [
                '{%- schema -%}',
                '{ "name": "Fixture", "settings": [{ "type": "color", "id": "badge_sale_background", "label": "A" }],',
                '  "blocks": [{ "type": "b", "name": "B", "settings": [{ "type": "color_background", "id": "badge_sale_text", "label": "B" }] }] }',
                '{%- endschema -%}',
                '',
            ].join('\n'),
        );
        const colour = (await runThemeLint(root)).filter((f) => f.checkId === 'colour-setting');
        assert.equal(colour.length, 2, colour.map((f) => f.message).join('\n'));
    });
});

test('6-C9 review: colour-role-sync guards the card role', async () => {
    const card = '    --color-card: rgb(var(--color-card-background));';
    const sync = (failures) => failures.filter((f) => f.checkId === 'colour-role-sync').map((f) => f.message);
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [card], [card]);
        assert.deepEqual(sync(await runThemeLint(root)), []);
    });
    await withTempThemeAsync(async (root) => {
        writeRoleFiles(root, [card], []);
        assert.match(sync(await runThemeLint(root)).join('\n'), /--color-card depends on the scheme but is not re-declared/);
    });
});

test('6-V2 review: a setting referenced only in a Liquid comment is dead', async () => {
    for (const markup of [
        '{% comment %}{{ section.settings.note }}{% endcomment %}',
        '{%- # section.settings.note -%}',
        '{% liquid\n  # assign x = section.settings.note\n  echo 1\n%}',
    ]) {
        await withTempThemeAsync(async (root) => {
            writeDeadSettingSection(root, markup, { settings: [{ type: 'text', id: 'note' }] }, { 'dead-setting': {} });
            const dead = (await runThemeLint(root)).filter((f) => f.checkId === 'dead-setting');
            assert.equal(dead.length, 1, markup);
        });
    }
});
