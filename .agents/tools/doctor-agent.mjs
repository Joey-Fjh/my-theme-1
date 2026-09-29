#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hookMode = process.argv.includes('--hook');
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const adapters = [
    { absolute: path.join(repoRoot, 'CLAUDE.md'), relative: 'CLAUDE.md' },
    { absolute: path.join(repoRoot, '.claude', 'skills'), relative: '.claude/skills' },
];

const failures = [];

for (const adapter of adapters) {
    try {
        if (!fs.lstatSync(adapter.absolute).isSymbolicLink()) {
            failures.push({ path: adapter.relative, reason: 'present but not a symlink' });
        }
    } catch (error) {
        const reason = error && error.code === 'ENOENT' ? 'missing' : `could not be inspected (${error?.code ?? 'unknown error'})`;
        failures.push({ path: adapter.relative, reason });
    }
}

// Each client keeps its own MCP config format, so the server lists can drift; CLI mode checks they match.
const mcpConfigs = [
    { relative: '.mcp.json', format: 'json' },
    { relative: '.cursor/mcp.json', format: 'json' },
    { relative: '.codex/config.toml', format: 'toml' },
];

function readMcpServerNames(config, parseToml) {
    const text = fs.readFileSync(path.join(repoRoot, config.relative), 'utf8');
    if (config.format === 'json') {
        return Object.keys(JSON.parse(text).mcpServers ?? {});
    }
    return Object.keys(parseToml(text).mcp_servers ?? {});
}

function collectMcpFailures(parseToml) {
    const mcpFailures = [];
    const namesByConfig = new Map();

    for (const config of mcpConfigs) {
        try {
            namesByConfig.set(config.relative, new Set(readMcpServerNames(config, parseToml)));
        } catch (error) {
            const reason = error && error.code === 'ENOENT' ? 'missing' : `could not be parsed (${error?.message ?? 'unknown error'})`;
            mcpFailures.push({ path: config.relative, reason });
        }
    }

    const allNames = new Set([...namesByConfig.values()].flatMap((names) => [...names]));
    for (const [relative, names] of namesByConfig) {
        const missing = [...allNames].filter((name) => !names.has(name)).sort();
        if (missing.length > 0) {
            mcpFailures.push({ path: relative, reason: `missing MCP server(s): ${missing.join(', ')}` });
        }
    }

    return mcpFailures;
}

function formatFailures(list = failures) {
    return list.map((failure) => `- ${failure.path}: ${failure.reason}`).join('\n');
}

function buildCliRemediation() {
    return `Agent entry adapter check failed:

${formatFailures()}

Do not copy or replace them with duplicated rules or Skills. See README.md for the full procedure.

Quick repair on Windows when adapters materialised as plain files (changes no system setting; run from an elevated shell):

  git config core.symlinks true
  Remove-Item CLAUDE.md, .claude\\skills -Force
  git checkout -- CLAUDE.md .claude/skills

Clone with symlink checkout enabled on a symlink-capable environment:

  git clone -c core.symlinks=true <repo-url>

Windows Developer Mode is optional convenience only, not a prerequisite.

Verify:

  npm.cmd run doctor:agent
  Get-Item CLAUDE.md, .claude\\skills | Select-Object Name, LinkType, Target
`;
}

function buildHookRemediation() {
    return `STOP: Do not continue normal project work in this session.

The tracked entry adapter check failed:

${formatFailures()}

The project rule layer may not be loading correctly.

Tell the user they must repair the local symlink setup before using this mother template. Point them to README.md for the full procedure. The elevated-shell repair (git config core.symlinks true, remove the inert files, git checkout -- CLAUDE.md .claude/skills) changes no system setting; Developer Mode is optional convenience only.

Do not copy, synchronise, or replace these adapters with duplicated rules or Skills.`;
}

if (hookMode) {
    if (failures.length > 0) process.stdout.write(buildHookRemediation());
    process.exit(0);
}

// Hook mode exits above, so a session start never depends on installed tooling.
const { parse: parseToml } = await import('smol-toml');
const mcpFailures = collectMcpFailures(parseToml);

if (failures.length > 0) console.error(buildCliRemediation());

if (mcpFailures.length > 0) {
    console.error(`MCP client configuration check failed:

${formatFailures(mcpFailures)}

Declare the same servers in .mcp.json, .cursor/mcp.json, and .codex/config.toml. See README.md ("MCP servers").
`);
}

process.exit(failures.length > 0 || mcpFailures.length > 0 ? 1 : 0);
