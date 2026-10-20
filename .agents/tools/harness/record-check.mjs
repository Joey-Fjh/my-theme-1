#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const RECORD_FILES = ['docs/agent/board.md', 'docs/agent/backlog.md', 'docs/agent/context.md'];
const COMPLETION = /Done:|\*\*Done|done \(/;

export function wordCount(text) {
    const words = text.match(/\S+/g);
    return words ? words.length : 0;
}

function readText(root, relative) {
    return fs.readFileSync(path.join(root, relative), 'utf8');
}

function commitDate(root, relative) {
    const result = spawnSync('git', ['log', '-1', '--format=%cs', '--', relative], {
        cwd: root,
        encoding: 'utf8',
        windowsHide: true,
    });
    if (result.status !== 0) return null;
    const date = (result.stdout || '').trim();
    return date || null;
}

function sectionBody(text, heading) {
    const marker = `## ${heading}\n`;
    const start = text.indexOf(marker);
    if (start < 0) return '';
    const bodyStart = start + marker.length;
    const next = text.indexOf('\n## ', bodyStart);
    return next < 0 ? text.slice(bodyStart) : text.slice(bodyStart, next);
}

function lastUpdated(text, relative, failures) {
    const match = text.match(/^Last updated:\s*(\d{4}-\d{2}-\d{2})/m);
    if (!match) {
        failures.push(`${relative}: missing Last updated date`);
        return;
    }
    return match[1];
}

export function checkRecords(root, options = {}) {
    const failures = [];
    const notes = [];
    for (const relative of RECORD_FILES) {
        const absolute = path.join(root, relative);
        if (!fs.existsSync(absolute)) {
            failures.push(`${relative}: missing`);
            continue;
        }
        const text = readText(root, relative);
        const updated = lastUpdated(text, relative, failures);
        const committed = commitDate(root, relative);
        if (updated && committed && updated < committed) {
            failures.push(`${relative}: Last updated ${updated} is older than commit ${committed}`);
        }
        if (relative.endsWith('board.md')) checkBoard(text, failures);
        if (relative.endsWith('backlog.md')) checkBacklog(text, failures);
        if (relative.endsWith('context.md')) checkContext(text, failures);
    }

    const boardPath = path.join(root, 'docs/agent/board.md');
    const boardWords = fs.existsSync(boardPath)
        ? wordCount(readText(root, 'docs/agent/board.md'))
        : 0;
    const pending = fs.existsSync(boardPath)
        ? sectionBody(readText(root, 'docs/agent/board.md'), 'Pending migration')
              .split('\n')
              .filter((line) => line.startsWith('- ')).length
        : 0;
    const baselinePath = path.join(root, '.agents/tools/harness/records.baseline.json');
    let baseline = null;
    if (fs.existsSync(baselinePath)) {
        baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')).boardWords;
    } else {
        failures.push('records.baseline.json: missing');
    }

    if (options.prune && failures.length === 0 && baseline != null && boardWords < baseline) {
        fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
        fs.writeFileSync(baselinePath, `${JSON.stringify({ boardWords }, null, 4)}\n`);
        baseline = boardWords;
        notes.push(`baseline pruned to ${boardWords}`);
    }

    notes.push(`board words: ${boardWords}`);
    notes.push(`baseline: ${baseline}`);
    notes.push(`pending migration lines: ${pending}`);
    if (baseline != null && boardWords > baseline) {
        notes.push(`prompt: board has ${boardWords} words, above baseline ${baseline}`);
    }
    return { failures, notes, boardWords, baseline, pending };
}

function checkBoard(text, failures) {
    text.split('\n').forEach((line, index) => {
        if (COMPLETION.test(line)) {
            failures.push(`docs/agent/board.md:${index + 1}: completion record`);
        }
    });
}

function checkBacklog(text, failures) {
    let inArea = false;
    text.split('\n').forEach((line, index) => {
        if (line.startsWith('## ')) {
            inArea = true;
            return;
        }
        if (!inArea || !line.startsWith('- ')) return;
        if (!line.includes('Source:') || !line.includes('Surface:')) {
            failures.push(`docs/agent/backlog.md:${index + 1}: item needs Source: and Surface:`);
        }
    });
}

function checkContext(text, failures) {
    const parts = text.split(/^## Batch /m).slice(1);
    let active = 0;
    for (const part of parts) {
        const status = part.match(/\*\*Status:\*\*\s*(.+)/);
        const value = status ? status[1] : '';
        const parked = /executed/i.test(value) && /waiting/i.test(value);
        if (!parked) active += 1;
    }
    if (active > 1) {
        failures.push(`docs/agent/context.md: ${active} plans under execution`);
    }
}

function main() {
    const root = process.cwd();
    const result = checkRecords(root, { prune: process.argv.includes('--prune-baseline') });
    for (const line of result.notes) console.log(line);
    for (const line of result.failures) console.log(`fail: ${line}`);
    process.exit(result.failures.length === 0 ? 0 : 1);
}

const invoked =
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) main();
