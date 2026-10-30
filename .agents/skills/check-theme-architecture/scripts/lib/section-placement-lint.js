/**
 * Section schema placement: presets require enabled_on or disabled_on; the group rules apply to every
 * section that declares a restriction, with or without presets.
 */

const fs = require('node:fs');
const path = require('node:path');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');
const { pushFailure } = require('./lint-allow');
const { matchSchemaBlock } = require('./schema-block');

const CHECK = {
    PLACEMENT_MISSING: 'section-placement-missing',
    PLACEMENT_BOTH: 'section-placement-both',
    PLACEMENT_DISABLED_GROUPS: 'section-placement-disabled-groups',
    PLACEMENT_ENABLED_GROUPS: 'section-placement-enabled-groups',
};

const REQUIRED_DISABLED_GROUPS = ['header', 'footer', 'custom.overlay'];
const ALLOWED_GROUPS = new Set(REQUIRED_DISABLED_GROUPS);
const CUSTOM_LIQUID_FILE = 'sections/custom-liquid.liquid';
const CUSTOM_LIQUID_DISABLED_GROUPS = ['custom.overlay'];

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

function extractSectionSchema(sectionText) {
    const match = matchSchemaBlock(sectionText);
    if (!match) return null;
    const schema = parseSchemaJson(match[1]);
    if (!schema) return null;
    return { schema, schemaLine: lineAt(sectionText, match.index ?? 0) };
}

function hasNonemptyPresets(schema) {
    return Array.isArray(schema.presets) && schema.presets.length > 0;
}

function sameGroupSet(groups, expected) {
    if (!Array.isArray(groups) || groups.length !== expected.length) return false;
    const left = [...groups].sort();
    const right = [...expected].sort();
    return left.every((value, index) => value === right[index]);
}

function collectSectionPlacementFailures(root, failures) {
    const sectionFiles = fg.sync('sections/*.liquid', { cwd: root, onlyFiles: true });

    for (const relative of sectionFiles.map(formatPath)) {
        const file = relative;
        const text = fs.readFileSync(path.join(root, file), 'utf8');
        const parsed = extractSectionSchema(text);
        if (!parsed) continue;

        const { schema, schemaLine } = parsed;
        const hasEnabled = schema.enabled_on != null;
        const hasDisabled = schema.disabled_on != null;

        if (!hasEnabled && !hasDisabled) {
            if (!hasNonemptyPresets(schema)) continue;
            pushFailure(
                failures,
                new Map(),
                file,
                schemaLine,
                CHECK.PLACEMENT_MISSING,
                'Section presets require enabled_on or disabled_on in the schema.',
            );
            continue;
        }

        if (hasEnabled && hasDisabled) {
            pushFailure(
                failures,
                new Map(),
                file,
                schemaLine,
                CHECK.PLACEMENT_BOTH,
                'Section schema must declare only one of enabled_on or disabled_on.',
            );
            continue;
        }

        if (hasDisabled) {
            const groups = schema.disabled_on?.groups;
            const expected =
                file === CUSTOM_LIQUID_FILE ? CUSTOM_LIQUID_DISABLED_GROUPS : REQUIRED_DISABLED_GROUPS;
            if (!sameGroupSet(groups, expected)) {
                const message =
                    file === CUSTOM_LIQUID_FILE
                        ? 'custom-liquid disabled_on.groups must list only custom.overlay.'
                        : 'Page sections must disable header, footer, and custom.overlay.';
                pushFailure(failures, new Map(), file, schemaLine, CHECK.PLACEMENT_DISABLED_GROUPS, message);
            }
        }

        if (hasEnabled && Array.isArray(schema.enabled_on?.groups)) {
            const groups = schema.enabled_on.groups;
            if (groups.length !== 1 || !ALLOWED_GROUPS.has(groups[0])) {
                pushFailure(
                    failures,
                    new Map(),
                    file,
                    schemaLine,
                    CHECK.PLACEMENT_ENABLED_GROUPS,
                    'Group sections must enable exactly one of header, footer, or custom.overlay.',
                );
            }
        }
    }
}

module.exports = {
    CHECK,
    CUSTOM_LIQUID_DISABLED_GROUPS,
    REQUIRED_DISABLED_GROUPS,
    collectSectionPlacementFailures,
    hasNonemptyPresets,
    sameGroupSet,
};
