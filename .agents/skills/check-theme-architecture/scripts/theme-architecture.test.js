const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const { runThemeLint, maskNonExecutableLiquid } = require('./lint-theme.js');
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

test('settings chain liquid class font-medium passes (default weight scale)', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="font-medium">Label</p>\n`);
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

test('settings chain liquid class text-white/80 passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<p class="text-white/80">Label</p>\n`);
        const failures = await runThemeLint(root);
        assert.equal(failures.length, 0, failureMessages(failures));
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
        assert.match(failureMessages(failures), /heading-h\* tiers belong on h1–h6/);
    });
});

test('heading-h tier on h2 passes', async () => {
    await withTempThemeAsync(async (root) => {
        writeFile(root, 'sections/fixture.liquid', `<h2 class="heading-h2">Title</h2>\n`);
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
                '@media (min-width: 64rem) { .ok { gap: calc(var(--spacing) * 4); } }',
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
