/**
 * Rejects color / color_background settings outside the scheme group except the named global badge allowlist.
 */

const fs = require('node:fs');
const path = require('node:path');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');

const CHECK_ID = 'colour-setting';
const SETTINGS_SCHEMA = 'config/settings_schema.json';
const COLOUR_SETTING_TYPES = new Set(['color', 'color_background']);

/** Global product badge colours: same on every scheme (6-C9). */
const ALLOWLIST = new Map([
    ['badge_sale_background', 'global sale badge background'],
    ['badge_sale_text', 'global sale badge text'],
    ['badge_sold_out_background', 'global sold out badge background'],
    ['badge_sold_out_text', 'global sold out badge text'],
    ['badge_custom_1_background', 'global custom badge 1 background'],
    ['badge_custom_1_text', 'global custom badge 1 text'],
    ['badge_custom_2_background', 'global custom badge 2 background'],
    ['badge_custom_2_text', 'global custom badge 2 text'],
]);

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

function parseSchemaJson(schemaText) {
    try {
        const tree = parseTree(schemaText);
        if (tree.errors?.length) return null;
        return getNodeValue(tree);
    } catch {
        return null;
    }
}

function walkSettings(settings, file, lineOffset, failures, inSchemeGroupDefinition) {
    if (!Array.isArray(settings)) return;
    for (const entry of settings) {
        if (!entry || typeof entry !== 'object') continue;
        if (entry.type === 'color_scheme_group' && Array.isArray(entry.definition)) {
            walkSettings(entry.definition, file, lineOffset, failures, true);
            continue;
        }
        if (COLOUR_SETTING_TYPES.has(entry.type) && typeof entry.id === 'string') {
            if (inSchemeGroupDefinition) continue;
            if (file === SETTINGS_SCHEMA && ALLOWLIST.has(entry.id)) continue;
            failures.push({
                file,
                line: lineOffset,
                checkId: CHECK_ID,
                message: `Colour setting "${entry.id}" is not allowlisted. Use a scheme role or add an allowlist reason in colour-setting-lint.js.`,
            });
        }
        if (Array.isArray(entry.settings)) {
            walkSettings(entry.settings, file, lineOffset, failures, inSchemeGroupDefinition);
        }
        if (Array.isArray(entry.blocks)) {
            for (const block of entry.blocks) {
                walkSettings(block.settings, file, lineOffset, failures, inSchemeGroupDefinition);
            }
        }
    }
}

function collectFromGlobalSchema(root, failures) {
    const file = SETTINGS_SCHEMA;
    const full = path.join(root, file);
    if (!fs.existsSync(full)) return;
    const text = fs.readFileSync(full, 'utf8');
    const schema = parseSchemaJson(text);
    if (!schema) return;
    for (const group of schema) {
        walkSettings(group.settings, file, 1, failures, false);
    }
}

function collectFromSectionSchemas(root, failures) {
    const files = fg.sync('sections/**/*.liquid', { cwd: root, onlyFiles: true });
    for (const rel of files) {
        const file = formatPath(rel);
        const text = fs.readFileSync(path.join(root, rel), 'utf8');
        const match = text.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
        if (!match) continue;
        const schema = parseSchemaJson(match[1]);
        if (!schema) continue;
        const schemaLine = lineAt(text, match.index ?? 0);
        walkSettings(schema.settings, file, schemaLine, failures, false);
        if (Array.isArray(schema.blocks)) {
            for (const block of schema.blocks) {
                walkSettings(block.settings, file, schemaLine, failures, false);
            }
        }
    }
}

function collectColourSettingFailures(root, failures) {
    collectFromGlobalSchema(root, failures);
    collectFromSectionSchemas(root, failures);
}

module.exports = {
    CHECK_ID,
    ALLOWLIST,
    collectColourSettingFailures,
};
