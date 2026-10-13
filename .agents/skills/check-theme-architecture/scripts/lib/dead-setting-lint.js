/**
 * Dead settings: section/block schema ids and global settings_schema ids must appear
 * in Liquid usage (section closure or theme-wide for globals). Strict: no baseline.
 */

const fs = require('node:fs');
const path = require('node:path');
const fg = require('fast-glob');
const { parseTree, getNodeValue } = require('jsonc-parser');
const { maskNonMarkup } = require('./migration-lint');
const { matchSchemaBlock } = require('./schema-block');

const SETTINGS_SCHEMA = 'config/settings_schema.json';
const CHECK_ID = 'dead-setting';
const CHECK_UNPROVABLE = 'dead-setting-unprovable';

const LIQUID_GLOBS = [
    'layout/**/*.liquid',
    'sections/**/*.liquid',
    'snippets/**/*.liquid',
    'templates/**/*.liquid',
];

const DYNAMIC_SETTINGS_RE = /\b(?:section\.)?settings\s*\[\s*(?!['"][\w-]+['"])/;

function formatPath(file) {
    return file.replaceAll('\\', '/');
}

function lineAt(text, offset) {
    return text.slice(0, offset).split(/\r\n|\r|\n/).length;
}

/**
 * Liquid that can read settings: drops schema, stylesheet, javascript, comment and doc blocks,
 * inline `{% # … %}` comments and `# …` lines inside `{% liquid %}` (shared with the migration lints).
 */
function stripNonMarkupBlocks(text) {
    return maskNonMarkup(text);
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

function idsFromSettingsArray(settings) {
    const ids = [];
    if (!Array.isArray(settings)) return ids;
    for (const entry of settings) {
        if (entry && typeof entry.id === 'string' && entry.id) ids.push(entry.id);
    }
    return ids;
}

function extractSectionSchema(sectionText) {
    const match = matchSchemaBlock(sectionText);
    if (!match) return { sectionIds: [], blockIds: [], schemaLine: null };
    const schema = parseSchemaJson(match[1]);
    if (!schema) return { sectionIds: [], blockIds: [], schemaLine: lineAt(sectionText, match.index ?? 0) };

    const sectionIds = idsFromSettingsArray(schema.settings);
    const blockIds = [];
    if (Array.isArray(schema.blocks)) {
        for (const block of schema.blocks) {
            for (const id of idsFromSettingsArray(block.settings)) {
                blockIds.push(id);
            }
        }
    }
    return { sectionIds, blockIds, schemaLine: lineAt(sectionText, match.index ?? 0) };
}

function extractStaticRenderNames(text) {
    const names = [];
    const re = /{%-?\s*render\s+['"]([\w-]+)['"]/g;
    for (const match of text.matchAll(re)) {
        names.push(match[1]);
    }
    return names;
}

function reachableSnippetMarkup(root, sectionMarkup) {
    const seen = new Set();
    const queue = extractStaticRenderNames(sectionMarkup);
    const parts = [sectionMarkup];

    while (queue.length) {
        const name = queue.shift();
        if (seen.has(name)) continue;
        seen.add(name);
        const file = path.join(root, `snippets/${name}.liquid`);
        if (!fs.existsSync(file)) continue;
        const text = fs.readFileSync(file, 'utf8');
        const markup = stripNonMarkupBlocks(text);
        parts.push(markup);
        for (const child of extractStaticRenderNames(markup)) {
            queue.push(child);
        }
    }

    return parts.join('\n');
}

// Each scope is matched by its own receiver, so a same-named setting in another scope does not count:
// section settings through `section.settings`, global settings through bare `settings`, block settings
// through any other variable (`block`, `image_block`, `testimonial_card_block`, …) except `section`
// and the colour `scheme` loop variable.
function escapeId(id) {
    return id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function settingAccessRe(receiver, id) {
    const escaped = escapeId(id);
    return new RegExp(`${receiver}\\.settings(?:\\.${escaped}\\b|\\s*\\[\\s*['"]${escaped}['"]\\s*\\])`);
}

function usesSectionSetting(markup, id) {
    return settingAccessRe('(?<![\\w.])section', id).test(markup);
}

function usesGlobalSetting(markup, id) {
    const escaped = escapeId(id);
    return new RegExp(`(?<![\\w.])settings(?:\\.${escaped}\\b|\\s*\\[\\s*['"]${escaped}['"]\\s*\\])`).test(markup);
}

function usesBlockSetting(markup, id) {
    return settingAccessRe('(?<![\\w.])(?!(?:section|scheme)\\b)[a-z_][a-z0-9_]*', id).test(markup);
}

function readGlobalSettingIds(root) {
    const file = path.join(root, SETTINGS_SCHEMA);
    if (!fs.existsSync(file)) return [];
    const schema = parseSchemaJson(fs.readFileSync(file, 'utf8'));
    if (!schema || !Array.isArray(schema)) return [];
    const ids = [];
    for (const group of schema) {
        ids.push(...idsFromSettingsArray(group.settings));
    }
    return [...new Set(ids)];
}

function readAllLiquidMarkup(root) {
    const files = fg.sync(LIQUID_GLOBS, { cwd: root, onlyFiles: true }).map(formatPath);
    const byFile = new Map();
    let combined = '';
    for (const file of files) {
        const text = fs.readFileSync(path.join(root, file), 'utf8');
        const markup = stripNonMarkupBlocks(text);
        byFile.set(file, markup);
        combined += `\n${markup}`;
    }
    return { byFile, combined };
}

function entryKey(file, kind, id) {
    return `${file}|${kind}|${id}`;
}

/** Map of key -> { file, line, kind, id } for each dead setting currently in the tree. */
function collectDeadSettingEntries(root) {
    const entries = new Map();
    const unprovableFiles = new Set();

    const sectionFiles = fg.sync('sections/**/*.liquid', { cwd: root, onlyFiles: true }).map(formatPath);

    for (const file of sectionFiles) {
        const fullText = fs.readFileSync(path.join(root, file), 'utf8');
        const schemaBlock = matchSchemaBlock(fullText);
        const sectionMarkup = stripNonMarkupBlocks(schemaBlock ? fullText.slice(0, schemaBlock.index) : fullText);
        const { sectionIds, blockIds, schemaLine } = extractSectionSchema(fullText);
        if (!sectionIds.length && !blockIds.length) continue;

        const closure = reachableSnippetMarkup(root, sectionMarkup);
        if (DYNAMIC_SETTINGS_RE.test(closure)) {
            continue;
        }

        for (const id of sectionIds) {
            if (!usesSectionSetting(closure, id)) {
                entries.set(entryKey(file, 'section', id), {
                    file,
                    line: schemaLine ?? 1,
                    kind: 'section',
                    id,
                });
            }
        }
        for (const id of blockIds) {
            if (!usesBlockSetting(closure, id)) {
                entries.set(entryKey(file, 'block', id), {
                    file,
                    line: schemaLine ?? 1,
                    kind: 'block',
                    id,
                });
            }
        }
    }

    const { byFile, combined } = readAllLiquidMarkup(root);
    for (const [file, markup] of byFile) {
        if (DYNAMIC_SETTINGS_RE.test(markup)) {
            unprovableFiles.add(file);
        }
    }

    const globalIds = readGlobalSettingIds(root);
    for (const id of globalIds) {
        if (!usesGlobalSetting(combined, id)) {
            entries.set(entryKey('config/settings_schema.json', 'global', id), {
                file: SETTINGS_SCHEMA,
                line: 1,
                kind: 'global',
                id,
            });
        }
    }

    return { entries, unprovableFiles };
}

function collectDeadSettingFailures(root, failures, notes = []) {
    const { entries, unprovableFiles } = collectDeadSettingEntries(root);
    for (const file of [...unprovableFiles].sort()) {
        notes.push(
            `[${CHECK_UNPROVABLE}] ${file}: dynamic settings[…] access; dead-setting analysis may miss usages in this file.`,
        );
    }

    for (const meta of entries.values()) {
        failures.push({
            file: meta.file,
            line: meta.line,
            checkId: CHECK_ID,
            message: `[${CHECK_ID}] unused ${meta.kind} setting "${meta.id}".`,
        });
    }
}

module.exports = {
    CHECK_ID,
    CHECK_UNPROVABLE,
    collectDeadSettingEntries,
    collectDeadSettingFailures,
};
