#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const RECORD_FILES = ['docs/agent/board.md', 'docs/agent/backlog.md', 'docs/agent/context.md'];
const COMPLETION = /Done:|\*\*Done|done \(/;
const TOPIC_STATUSES = new Set(['discussing', 'awaiting user']);
const PLAN_FIELDS = ['Estimate', 'Checkpoint', 'Bar'];
const TOPIC_LINE =
    /^Status:\s*(.+?)\s*·\s*Opened:\s*(\d{4}-\d{2}-\d{2})\s*·\s*Updated:\s*(\d{4}-\d{2}-\d{2})\s*$/;

// A real calendar date: the parsed date prints back as the same string.
function isCalendarDate(value) {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
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

// Board topics: each `### ` heading under `## Topics`, with the status line that follows it.
export function boardTopics(text) {
    const topics = [];
    let current = null;
    for (const line of sectionBody(text, 'Topics').split('\n')) {
        if (line.startsWith('### ')) {
            current = { title: line.slice(4).trim(), line: null };
            topics.push(current);
        } else if (current && current.line === null && line.trim()) {
            current.line = line.trim();
            const match = current.line.match(TOPIC_LINE);
            if (match) [, current.status, current.opened, current.updated] = match;
        }
    }
    return topics;
}

export function checkRecords(root) {
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
    const boardText = fs.existsSync(boardPath) ? readText(root, 'docs/agent/board.md') : '';
    const pending = sectionBody(boardText, 'Pending migration')
        .split('\n')
        .filter((line) => line.startsWith('- ')).length;
    const topics = boardTopics(boardText);

    notes.push(`board topics: ${topics.length}`);
    notes.push(`pending migration lines: ${pending}`);
    return { failures, notes, topics, pending };
}

function checkBoard(text, failures) {
    text.split('\n').forEach((line, index) => {
        if (COMPLETION.test(line)) {
            failures.push(`docs/agent/board.md:${index + 1}: completion record`);
        }
    });
    for (const topic of boardTopics(text)) {
        const where = `docs/agent/board.md: topic "${topic.title}"`;
        if (!topic.status) {
            failures.push(`${where}: needs "Status: <status> · Opened: <date> · Updated: <date>"`);
        } else if (!TOPIC_STATUSES.has(topic.status)) {
            failures.push(`${where}: status "${topic.status}" is not discussing or awaiting user`);
        } else if (!isCalendarDate(topic.opened) || !isCalendarDate(topic.updated)) {
            failures.push(`${where}: Opened and Updated must be real dates`);
        } else if (topic.updated < topic.opened) {
            failures.push(`${where}: Updated ${topic.updated} is older than Opened ${topic.opened}`);
        }
    }
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
    const parts = text.split(/^## (?:Batch|Plan) /m).slice(1);
    let active = 0;
    for (const part of parts) {
        const title = part.split('\n', 1)[0].trim();
        for (const field of PLAN_FIELDS) {
            if (!new RegExp(`^\\*\\*${field}:\\*\\*[ \\t]*\\S`, 'm').test(part)) {
                failures.push(`docs/agent/context.md: plan "${title}" needs **${field}:**`);
            }
        }
        const status = part.match(/\*\*Status[:.]\*\*\s*(.+)/);
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
    const result = checkRecords(root);
    for (const line of result.notes) console.log(line);
    for (const line of result.failures) console.log(`fail: ${line}`);
    process.exit(result.failures.length === 0 ? 0 : 1);
}

const invoked =
    process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invoked) main();
