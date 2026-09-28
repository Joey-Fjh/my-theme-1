const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const LINT_SCRIPT = path.join(__dirname, 'lint-i18n.js');

function writeFile(root, relativePath, content) {
    const filePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function writeJson(root, relativePath, value) {
    writeFile(root, relativePath, `${JSON.stringify(value, null, 4)}\n`);
}

function runLint(root) {
    return spawnSync(process.execPath, [LINT_SCRIPT], {
        cwd: root,
        encoding: 'utf8',
        env: process.env,
    });
}

function expectFailure(root, setup, patterns) {
    setup(root);
    const result = runLint(root);
    const output = `${result.stdout}${result.stderr}`;
    const expectedPatterns = Array.isArray(patterns) ? patterns : [patterns];

    assert.notEqual(result.status, 0, `expected failure but lint passed:\n${output}`);

    for (const pattern of expectedPatterns) {
        assert.match(output, pattern, `expected output to match ${pattern}:\n${output}`);
    }
}

function expectPass(root, setup) {
    setup(root);
    const result = runLint(root);
    const output = `${result.stdout}${result.stderr}`;

    assert.equal(result.status, 0, `expected pass but lint failed:\n${output}`);
    assert.match(output, /i18n lint passed\./);
}

function baseLocales() {
    return {
        'locales/en.default.json': {
            general: {
                ok: 'OK',
                translated: 'Translated',
            },
        },
        'locales/en.default.schema.json': {
            sections: {
                fixture: {
                    name: 'Fixture',
                    presets: {
                        default: {
                            name: 'Default',
                        },
                    },
                    settings: {
                        heading: {
                            label: 'Heading',
                        },
                    },
                    blocks: {
                        text: {
                            name: 'Text',
                        },
                    },
                },
            },
        },
    };
}

function writeBaseTheme(root, extra = {}) {
    for (const [file, value] of Object.entries(baseLocales())) {
        if (!(file in extra) || typeof extra[file] !== 'object' || Array.isArray(extra[file])) {
            writeJson(root, file, value);
        }
    }

    for (const [file, content] of Object.entries(extra)) {
        if (typeof content === 'string') {
            writeFile(root, file, content);
        } else {
            writeJson(root, file, content);
        }
    }
}

function withTempTheme(fn) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-i18n-'));

    try {
        fn(root);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

test('duplicate locale JSON key fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeFile(
                    dir,
                    'locales/en.default.json',
                    '{\n  "general": {\n    "dup": "One",\n    "dup": "Two"\n  }\n}\n',
                );
                writeJson(dir, 'locales/en.default.schema.json', { sections: {} });
            },
            /Duplicate translation key "dup"/,
        );
    });
});

test('missing storefront locale key fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.missing' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Missing storefront locale key "general.missing"/,
        );
    });
});

test('missing schema locale key fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.missing.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Missing schema locale key "sections.missing.name"/,
        );
    });
});

test('missing schema locale key in section group JSON fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/header-group.json': `{"type":"header","name":"t:sections.missing_group.name","sections":{},"order":[]}
`,
                });
            },
            /Missing schema locale key "sections.missing_group.name"/,
        );
    });
});

test('existing schema locale key in section group JSON passes', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/header-group.json': `{"type":"header","name":"t:sections.fixture.name","sections":{},"order":[]}
`,
            });
        });
    });
});

test('english hardcoded visible text fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>Buy now</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded visible text "Buy now"/,
        );
    });
});

test('chinese hardcoded visible text fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>立即购买</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded visible text "立即购买"/,
        );
    });
});

test('hardcoded accessible attribute fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<button aria-label="Close dialog">X</button>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded aria-label="Close dialog"/,
        );
    });
});

test('storefront text using | t passes', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/fixture.liquid': `<p>{{ 'general.translated' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
            });
        });
    });
});

test('hardcoded schema translatable label fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"Heading text"}],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded schema text "Heading text"/,
        );
    });
});

test('schema config defaults pass for link_list url and select', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"link_list","id":"footer_menu","label":"t:sections.fixture.settings.heading.label","default":"footer"},{"type":"link_list","id":"main_menu","label":"t:sections.fixture.settings.heading.label","default":"main-menu"},{"type":"url","id":"collection_link","label":"t:sections.fixture.settings.heading.label","default":"/collections"},{"type":"url","id":"all_collection_link","label":"t:sections.fixture.settings.heading.label","default":"/collections/all"},{"type":"select","id":"direction","label":"t:sections.fixture.settings.heading.label","default":"right_to_left","options":[{"value":"right_to_left","label":"t:sections.fixture.settings.heading.label"},{"value":"left_to_right","label":"t:sections.fixture.settings.heading.label"}]}],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
            });
        });
    });
});

test('legal machine schema defaults do not false positive', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"select","id":"alignment","label":"t:sections.fixture.settings.heading.label","default":"center","options":[{"value":"left","label":"t:sections.fixture.settings.heading.label"},{"value":"center","label":"t:sections.fixture.settings.heading.label"}]},{"type":"select","id":"direction","label":"t:sections.fixture.settings.heading.label","default":"right_to_left","options":[{"value":"right_to_left","label":"t:sections.fixture.settings.heading.label"},{"value":"left_to_right","label":"t:sections.fixture.settings.heading.label"}]},{"type":"select","id":"ratio","label":"t:sections.fixture.settings.heading.label","default":"portrait_3_4","options":[{"value":"portrait_3_4","label":"t:sections.fixture.settings.heading.label"},{"value":"square","label":"t:sections.fixture.settings.heading.label"}]},{"type":"range","id":"width","label":"t:sections.fixture.settings.heading.label","default":100,"unit":"px"},{"type":"font_picker","id":"type_body_font","label":"t:sections.fixture.settings.heading.label","default":"mono"}],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
            });
        });
    });
});

test('visible schema default copy still requires translation', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"t:sections.fixture.settings.heading.label","default":"Welcome home"}],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded schema text "Welcome home"/,
        );
    });
});

test('lowercase text setting defaults require translation', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"t:sections.fixture.settings.heading.label","default":"welcome"}],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded schema text "welcome"/,
        );
    });
});

test('snake_case text setting defaults require translation', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"t:sections.fixture.settings.heading.label","default":"welcome_message"}],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded schema text "welcome_message"/,
        );
    });
});

test('uppercase visible html text fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<span>SALE</span><button>OK</button>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            [/Hardcoded visible text "SALE"/, /Hardcoded visible text "OK"/],
        );
    });
});

test('chinese hardcoded schema label fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"标题文本"}],"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded schema text "标题文本"/,
        );
    });
});

test('preset name and category t: references pass', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'locales/en.default.schema.json': {
                    sections: {
                        fixture: {
                            name: 'Fixture',
                            presets: {
                                default: {
                                    name: 'Default',
                                    category: 'Content',
                                },
                            },
                        },
                    },
                },
                'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"presets":[{"name":"t:sections.fixture.presets.default.name","category":"t:sections.fixture.presets.default.category"}]}{% endschema %}\n`,
            });
        });
    });
});

test('preset settings literal copy is not flagged as schema text', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"content","label":"t:sections.fixture.settings.heading.label"}],"presets":[{"name":"t:sections.fixture.presets.default.name","settings":{"content":"Pages","name":"Footer heading"}}]}{% endschema %}\n`,
            });
        });
    });
});

test('preset block settings literal copy is not flagged as schema text', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"blocks":[{"type":"text","name":"t:sections.fixture.blocks.text.name"}],"presets":[{"name":"t:sections.fixture.presets.default.name","blocks":[{"type":"text","settings":{"content":"Social","label":"Column label"}}]}]}{% endschema %}\n`,
            });
        });
    });
});

test('preset settings with t: value fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"t:sections.fixture.settings.heading.label"}],"presets":[{"name":"t:sections.fixture.presets.default.name","settings":{"heading":"t:sections.fixture.settings.heading.label"}}]}{% endschema %}\n`,
                });
            },
            /Instance setting "heading" must not use a t: locale key/,
        );
    });
});

test('theme block schema in blocks/*.liquid is checked', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'blocks/text.liquid': `<div>{{ block.settings.text }}</div>\n{% schema %}{"name":"Text block","settings":[{"type":"text","id":"text","label":"t:sections.fixture.settings.heading.label"}],"presets":[{"name":"t:sections.fixture.blocks.text.name"}]}{% endschema %}\n`,
                });
            },
            /Hardcoded schema text "Text block"/,
        );
    });
});

test('section default settings literal copy is not flagged as schema text', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"t:sections.fixture.settings.heading.label"}],"default":{"settings":{"heading":"Welcome","content":"Footer heading"}},"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
            });
        });
    });
});

test('section default block settings literal copy is not flagged as schema text', () => {
    withTempTheme((root) => {
        expectPass(root, (dir) => {
            writeBaseTheme(dir, {
                'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"blocks":[{"type":"text","name":"t:sections.fixture.blocks.text.name"}],"default":{"blocks":[{"type":"text","settings":{"content":"Social","label":"Column label"}}]},"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
            });
        });
    });
});

test('section default settings with t: value fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[{"type":"text","id":"heading","label":"t:sections.fixture.settings.heading.label"}],"default":{"settings":{"heading":"t:sections.fixture.settings.heading.label"}},"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Instance setting "heading" must not use a t: locale key/,
        );
    });
});

test('section default block settings with t: value fails', () => {
    withTempTheme((root) => {
        expectFailure(
            root,
            (dir) => {
                writeBaseTheme(dir, {
                    'sections/fixture.liquid': `<p>{{ 'general.ok' | t }}</p>\n{% schema %}{"name":"t:sections.fixture.name","settings":[],"blocks":[{"type":"text","name":"t:sections.fixture.blocks.text.name"}],"default":{"blocks":[{"type":"text","settings":{"content":"t:sections.fixture.settings.heading.label"}}]},"presets":[{"name":"t:sections.fixture.presets.default.name"}]}{% endschema %}\n`,
                });
            },
            /Instance setting "content" must not use a t: locale key/,
        );
    });
});
