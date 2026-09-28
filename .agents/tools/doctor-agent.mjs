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

function formatFailures() {
    return failures.map((failure) => `- ${failure.path}: ${failure.reason}`).join('\n');
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

if (failures.length === 0) {
    process.exit(0);
}

if (hookMode) {
    process.stdout.write(buildHookRemediation());
    process.exit(0);
}

console.error(buildCliRemediation());
process.exit(1);
