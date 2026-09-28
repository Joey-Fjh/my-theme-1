/* eslint-disable no-console */
// Derives phase 4 slices and CAP columns from phase 0 data and the Liquid graph.
// Usage: node derive-slices.js            verify the phase 2 docs match the derivation
//        node derive-slices.js --write    rewrite slice/CAP columns and phase4-slices.md
//        node derive-slices.js --self-test inject conflicts and confirm the check reports them
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../../..');
const P2 = path.join(root, 'docs/migration/phase2');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

// CAP -> slice. P3 = phase 3 framework import; 0 = domain-neutral shared UI.
const CAP_SLICE = {
    'CAP-01': 0, 'CAP-21': 0,
    'CAP-05': 1, 'CAP-08': 1, 'CAP-09': 1, 'CAP-10': 1, 'CAP-11': 1,
    'CAP-02': 2, 'CAP-03': 2, 'CAP-04': 2, 'CAP-20': 2,
    'CAP-12': 3, 'CAP-13': 3,
    'CAP-15': 4, 'CAP-22': 4,
    'CAP-06': 5, 'CAP-07': 5, 'CAP-14': 5, 'CAP-16': 5, 'CAP-17': 5, 'CAP-18': 5, 'CAP-19': 5,
};
const SLICE_TITLES = {
    P3: 'Phase 3 — framework import (not a slice)',
    0: 'Slice 0 — Domain-neutral shared UI (CAP-01, CAP-21)',
    1: 'Slice 1 — Product and cart',
    2: 'Slice 2 — Navigation, search entry, localization',
    3: 'Slice 3 — Collection and search listing, filters',
    4: 'Slice 4 — Carousels and display sections',
    5: 'Slice 5 — The rest',
};
const HEADERS = new Set(['Name', 'Section']); // table header cells, not components
const NEUTRAL = new Set(['CAP-01', 'CAP-21', 'INFRA']);
const FRAMEWORK = new Set(['F', 'F+', 'FX', 'V']);
const rank = (s) => (s === 'P3' ? -1 : Number(s));

// Phase 0 coverage matrix: file -> CAP list.
function phase0Caps() {
    const text = read('docs/migration/phase0/capabilities.md');
    const caps = {};
    let prefix = null;
    for (const line of text.split('\n')) {
        if (line.startsWith('### Sections')) prefix = 'sections/';
        else if (line.startsWith('### Snippets')) prefix = 'snippets/';
        else if (line.startsWith('### Non-vendor')) prefix = 'assets/';
        else if (line.startsWith('## ') || (line.startsWith('### ') && prefix && !/Sections|Snippets|Non-vendor/.test(line))) prefix = null;
        if (!prefix) continue;
        const m = line.match(/^\| ([\w.-]+\.(?:liquid|js)) \| ([^|]+) \|/);
        if (m) caps[prefix + m[1]] = m[2].match(/CAP-\d\d|INFRA/g) || [];
    }
    return caps;
}

// Ownership table rows (the full per-file table).
const OWN_HEADER = '| Path | Class | Reason | CAP | Merchant refs | Depends on F | Slice |';
function ownershipRows(text) {
    const lines = text.split('\n');
    const start = lines.lastIndexOf(OWN_HEADER);
    const rows = {};
    for (let i = start + 2; i < lines.length && lines[i].startsWith('| `'); i++) {
        const c = lines[i].split('|');
        rows[c[1].replace(/[ `]/g, '')] = { i, cls: c[2].replace(/[ *]/g, ''), cap: c[4].trim(), slice: c[7].trim() };
    }
    return { lines, rows };
}

// Liquid graph: file -> rendered snippets, and component/store mounts.
// `overrides` maps a Liquid path to replacement text (self-test injections, never written to disk).
function liquidGraph(overrides = {}) {
    const files = [];
    for (const dir of ['layout', 'sections', 'snippets', 'templates']) {
        for (const f of fs.readdirSync(path.join(root, dir))) if (f.endsWith('.liquid')) files.push(`${dir}/${f}`);
    }
    const renders = {};
    const mounts = {};
    const dynamic = [];
    for (const f of files) {
        // Doc, comment, and HTML comment blocks are prose, not markup; blank them but keep line numbers.
        const blank = (m) => m.replace(/[^\n]/g, ' ');
        const t = (overrides[f] ?? read(f))
            .replace(/\{%-?\s*doc\s*-?%\}[\s\S]*?\{%-?\s*enddoc\s*-?%\}/g, blank)
            .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, blank)
            .replace(/<!--[\s\S]*?-->/g, blank);
        renders[f] = [...t.matchAll(/\b(?:render|include)\s+['"]([\w-]+)['"]/g)].map((m) => `snippets/${m[1]}.liquid`);
        // Renders whose target is a variable (for example `render block`) cannot be resolved statically.
        for (const m of t.matchAll(/(?:\{%-?\s*|^[ \t]*)(?:render|include)\s+(?!['"])([a-z_][\w.]*)/gm)) {
            dynamic.push(`${f}:${t.slice(0, m.index).split('\n').length} render ${m[1]}`);
        }
        const names = new Set();
        // x-data: double, single, or no quotes, optional spaces around `=`.
        for (const m of t.matchAll(/x-data\s*=\s*(["']?)\s*([A-Za-z_]\w*)/g)) names.add(m[2]);
        // $store.name, $store?.name, $store['name'], $store?.['name'].
        for (const m of t.matchAll(/\$store\s*(?:\??\.\s*([A-Za-z_]\w*)|(?:\?\.)?\[\s*['"]([A-Za-z_]\w*)['"]\s*\])/g)) names.add(m[1] || m[2]);
        for (const m of t.matchAll(/Components\.register\(\s*['"]([\w-]+)['"]/g)) names.add(m[1]);
        mounts[f] = names;
    }
    const renderedBy = {};
    for (const [f, list] of Object.entries(renders)) for (const s of list) (renderedBy[s] ||= new Set()).add(f);
    return { files, renderedBy, mounts, dynamic };
}

function derive(ownText, overrides = {}) {
    const caps = phase0Caps();
    const { rows } = ownershipRows(ownText);
    const g = liquidGraph(overrides);
    const slice = {};
    const notes = {};

    const capSlice = (list) => {
        const s = (list || []).filter((c) => !NEUTRAL.has(c)).map((c) => CAP_SLICE[c]);
        return s.length ? Math.min(...s) : 0;
    };
    for (const [f, r] of Object.entries(rows)) {
        if (r.cls === 'K' || r.cls === 'M') slice[f] = '-';
        else if (f.startsWith('sections/')) slice[f] = String(capSlice(caps[f]));
        else if (f.startsWith('templates/')) slice[f] = String(capSlice(caps[f]));
    }
    for (const f of g.files) if (f.startsWith('templates/') && !(f in slice)) slice[f] = '5';

    const layoutReach = new Set();
    const walkUp = (s, seen = new Set()) => {
        if (seen.has(s)) return new Set();
        seen.add(s);
        const out = new Set();
        for (const r of g.renderedBy[s] || []) {
            if (r.startsWith('layout/')) { out.add('P3'); layoutReach.add(s); }
            else if (r.startsWith('snippets/')) for (const x of walkUp(r, seen)) out.add(x);
            else if (slice[r] && slice[r] !== '-') out.add(slice[r]);
        }
        return out;
    };
    for (const [f, r] of Object.entries(rows)) {
        if (f in slice) continue;
        if (FRAMEWORK.has(r.cls)) { slice[f] = 'P3'; continue; }
        if (!f.startsWith('snippets/')) continue;
        const up = walkUp(f);
        const own = caps[f] || [];
        if (up.has('P3')) { slice[f] = '0'; notes[f] = 'rendered from layout'; }
        else if (own.length && own.every((c) => NEUTRAL.has(c))) { slice[f] = '0'; notes[f] = 'CAP-01/CAP-21/INFRA only'; }
        else if (up.size) slice[f] = String(Math.min(...[...up].map(Number)));
        else { slice[f] = String(capSlice(own)); notes[f] = 'no Liquid consumer found; slice from own CAP'; }
    }

    // Components and stores from logic-migration.md.
    const logic = read('docs/migration/phase2/logic-migration.md');
    const comp = {};
    const mountFiles = {};
    for (const line of logic.split('\n')) {
        const m = line.match(/^\| ([A-Za-z_]\w*) \| (.+)\|\s*(\S+)\s*\|\s*$/);
        if (!m || HEADERS.has(m[1])) continue;
        const name = m[1];
        const cells = line.split('|');
        const compCaps = cells[cells.length - 3].match(/CAP-\d\d|INFRA/g) || [];
        const neutral = compCaps.length > 0 && compCaps.every((c) => NEUTRAL.has(c));
        const users = g.files.filter((f) => g.mounts[f].has(name));
        mountFiles[name] = users;
        const ss = users.map((f) => slice[f]).filter((s) => s && s !== '-');
        // Domain-neutral components (CAP-01/CAP-21 only) belong to slice 0 unless phase 3 already provides them.
        if (neutral) ss.push('0');
        // Items replaced by a phase 3 framework file (the adapter or the module entry) land in phase 3.
        if (/alpine\.adapter\.js|(^|[\s`/])base\.js/.test(cells[cells.length - 4])) ss.push('P3');
        comp[name] = ss.length ? ss.reduce((a, b) => (rank(a) <= rank(b) ? a : b)) : null;
    }

    // Remaining non-snippet files (JS, tailwind, locales, schema) keep F/K handling; D files unlock after their components.
    const defFile = {};
    for (const line of logic.split('\n')) {
        const m = line.match(/^\| ([A-Za-z_]\w*) \| `?(assets\/[\w.-]+\.js)/);
        if (m) (defFile[m[2]] ||= []).push(m[1]);
    }
    for (const [f, r] of Object.entries(rows)) {
        if (f in slice) continue;
        if (r.cls === 'D') {
            const ss = (defFile[f] || []).map((n) => comp[n]).filter((s) => s !== null && s !== undefined);
            slice[f] = ss.length ? `after ${ss.reduce((a, b) => (rank(a) >= rank(b) ? a : b))}` : 'after 5';
        } else slice[f] = r.slice; // R assets/tailwind outside the Liquid graph: keep recorded value, listed for review
    }
    const classes = {};
    for (const r of Object.values(rows)) classes[r.cls] = (classes[r.cls] || 0) + 1;
    return { caps, rows, slice, notes, comp, mountFiles, layoutReach, defFile, classes, dynamic: g.dynamic };
}


const LOGIC_ROW = /^\| ([A-Za-z_]\w*) \| (.+)\|\s*(\S+)\s*\|\s*$/;
const REGISTER_ROW = /^\| `(sections\/[\w.-]+\.liquid)` \| `[\w-]+` \| .+\|\s*(\S+)\s*\|\s*$/;

function check(ownText, logicText, p4Text, overrides = {}) {
    const d = derive(ownText, overrides);
    const errs = [];
    const { rows } = ownershipRows(ownText);
    for (const [f, r] of Object.entries(rows)) {
        if (d.caps[f] && r.cap.replace(/\s/g, '') !== d.caps[f].join(',')) errs.push(`CAP ${f}: doc ${r.cap} vs phase0 ${d.caps[f].join(',')}`);
        if (r.slice !== d.slice[f]) errs.push(`slice ${f}: doc ${r.slice} vs derived ${d.slice[f]}`);
    }
    for (const line of logicText.split('\n')) {
        const m = line.match(LOGIC_ROW);
        if (m && !HEADERS.has(m[1]) && d.comp[m[1]] !== undefined) {
            const want = d.comp[m[1]] === null ? m[3] : d.comp[m[1]];
            if (m[3] !== want) errs.push(`component ${m[1]}: doc ${m[3]} vs derived ${want}`);
        }
        // Components.register section scripts ship with their section.
        const r = line.match(REGISTER_ROW);
        if (r && r[2] !== d.slice[r[1]]) errs.push(`register ${r[1]}: doc ${r[2]} vs section slice ${d.slice[r[1]]}`);
    }
    for (const [name, users] of Object.entries(d.mountFiles)) {
        for (const f of users) {
            if (d.comp[name] !== null && rank(d.slice[f]) < rank(d.comp[name])) errs.push(`module ${name} (slice ${d.comp[name]}) is later than its consumer ${f} (${d.slice[f]})`);
        }
    }
    const totals = ownText.slice(ownText.indexOf('## Class totals'), ownText.indexOf('Total rows'));
    for (const m of totals.matchAll(/^\| (\S+) \| (\d+) \|$/gm)) {
        if (m[1] !== 'Class' && Number(m[2]) !== (d.classes[m[1]] || 0)) errs.push(`class total ${m[1]}: doc ${m[2]} vs table ${d.classes[m[1]] || 0}`);
    }
    if (p4Text !== renderPhase4(d)) errs.push('phase4-slices.md differs from the derived rendering');
    return { d, errs };
}

// Pre-delete probe. The pattern holds no quote characters (`.` stands for either quote), so the
// single-quoted command runs unchanged in PowerShell and in POSIX shells.
const GATE_DIRS = ['layout', 'sections', 'snippets', 'templates'];
function gatePattern(names) {
    const alt = names.join('|');
    // \W covers quotes, spaces, `?`, `.`, and `[` without writing any quote character.
    return `x-data\\s*=\\W{0,3}(${alt})\\b|\\$store\\W{1,4}(${alt})\\b`;
}
function gateArgs(f, names) {
    if (!names.length) return ['grep', '-n', '-F', path.basename(f), '--', 'layout', 'assets'];
    return ['grep', '-l', '-P', gatePattern(names), '--', ...GATE_DIRS];
}
function gateCommand(f, names) {
    const args = gateArgs(f, names);
    const i = args.indexOf('--');
    return `git ${args.slice(0, i - 1).join(' ')} '${args[i - 1]}' ${args.slice(i).join(' ')}`;
}

function renderPhase4(d) {
    const order = ['P3', '0', '1', '2', '3', '4', '5'];
    const out = [
        '# Phase 4 — capability slices (derived)',
        '',
        'Generated by `scripts/derive-slices.js --write`. Do not hand-edit; change the rule or the inputs and regenerate.',
        '',
        '## Rule',
        '',
        '- CAP IDs come from `docs/migration/phase0/capabilities.md` (file coverage matrix).',
        '- Sections: the earliest slice among their non-neutral CAPs (table below).',
        '- Snippets: slice 0 when rendered from `layout/` or when their CAPs are only CAP-01, CAP-21, or INFRA; otherwise the earliest slice of the sections that render them (transitively).',
        '- Framework classes (F, F+, FX, V): phase 3 (`P3`). K and M: none.',
        "- Components and stores (`logic-migration.md`): the earliest slice of the Liquid files that mount them (`x-data` in either quote style and with optional spaces around `=`, `$store.name` or `$store['name']`, `Components.register`), so a module never lands after its markup; domain-neutral ones (CAP-01/CAP-21 only) no later than slice 0; ones replaced by `alpine.adapter.js` or `base.js` in phase 3.",
        '- `Components.register` section scripts ship with their section.',
        '- D files: kept as the reference during the slices and deleted after the latest slice of the components they define (gates below). Phase 3 removes only their script tags.',
        '- Slices run in order; later slices reuse earlier work.',
        '',
        '## CAP to slice',
        '',
        '| CAP | Slice |',
        '| --- | --- |',
    ];
    for (const [c, s] of Object.entries(CAP_SLICE).sort()) out.push(`| ${c} | ${s} |`);
    for (const s of order) {
        out.push('', `## ${SLICE_TITLES[s]}`, '');
        const files = Object.keys(d.slice).filter((f) => d.slice[f] === s && d.rows[f]).sort();
        for (const f of files) out.push(`- \`${f}\`${d.notes[f] ? ` — ${d.notes[f]}` : ''}`);
        const comps = Object.keys(d.comp).filter((n) => d.comp[n] === s).sort();
        if (comps.length) out.push('', `Components and stores: ${comps.map((n) => `\`${n}\``).join(', ')}`);
        const del = Object.keys(d.slice).filter((f) => d.slice[f] === `after ${s}`).sort();
        if (del.length) out.push('', `D files deletable after this step: ${del.map((f) => `\`${f}\``).join(', ')}`);
    }
    out.push(
        '',
        '## D-file deletion gates',
        '',
        'Delete a D file only after the step in "Deletable after", and only when its pre-delete command (below the table) lists no file whose markup still mounts the old item instead of the destination module named in `logic-migration.md`. For files that register items, the command lists every file that mounts them ("Current Liquid mounts", comment and doc blocks excluded) and may also list files that only mention an item in a comment; check those by eye. `--self-test` runs every command and confirms it covers every derived mount. Commands use `git grep` (no extra tool) with a single-quoted pattern that holds no quote characters, so they run unchanged in PowerShell and POSIX shells.',
        '',
        '| D file | Registered items (derived step) | Current Liquid mounts | Deletable after |',
        '| --- | --- | ---: | --- |',
    );
    const dFiles = Object.keys(d.slice).filter((x) => d.rows[x] && d.rows[x].cls === 'D').sort();
    for (const f of dFiles) {
        const names = (d.defFile[f] || []).sort();
        const mounts = new Set(names.flatMap((n) => d.mountFiles[n] || []));
        const items = names.length ? names.map((n) => `\`${n}\` (${d.comp[n] ?? 'no mount'})`).join(', ') : 'none registered (loader or helper)';
        out.push(`| \`${f}\` | ${items} | ${names.length ? mounts.size : '-'} | ${d.slice[f].replace('after ', '')} |`);
    }
    out.push('', 'Pre-delete commands:', '', '```text');
    for (const f of dFiles) out.push(`# ${f}`, gateCommand(f, (d.defFile[f] || []).sort()));
    out.push('```');
    const unmounted = Object.keys(d.comp).filter((n) => d.comp[n] === null).sort();
    if (unmounted.length) out.push('', '## Components with no Liquid mount found', '', 'Slice kept as recorded in `logic-migration.md`; review manually: ' + unmounted.map((n) => `\`${n}\``).join(', '));
    if (d.dynamic.length) {
        out.push('', '## Dynamic renders (not resolvable statically)', '', 'These render a variable target; the snippets they may reach are assigned through their other consumers. Review when a slice touches them.', '');
        for (const x of [...d.dynamic].sort()) out.push(`- \`${x}\``);
    }
    return out.join('\n') + '\n';
}

function write() {
    const ownPath = path.join(P2, 'ownership-map.md');
    const logicPath = path.join(P2, 'logic-migration.md');
    const ownText = fs.readFileSync(ownPath, 'utf8');
    const d = derive(ownText);
    const { lines, rows } = ownershipRows(ownText);
    for (const [f, r] of Object.entries(rows)) {
        const c = lines[r.i].split('|');
        if (d.caps[f]) c[4] = ` ${d.caps[f].join(',')} `;
        c[7] = ` ${d.slice[f]} `;
        lines[r.i] = c.join('|');
    }
    fs.writeFileSync(ownPath, lines.join('\n'));
    const logic = fs.readFileSync(logicPath, 'utf8').split('\n').map((line) => {
        const m = line.match(/^(\| ([A-Za-z_]\w*) \| .+\|)\s*(\S+)\s*\|\s*$/);
        if (m && !HEADERS.has(m[2]) && d.comp[m[2]] !== undefined && d.comp[m[2]] !== null) return `${m[1]} ${d.comp[m[2]]} |`;
        const r = line.match(/^(\| `(sections\/[\w.-]+\.liquid)` \| `[\w-]+` \| .+\|)\s*(\S+)\s*\|\s*$/);
        if (r && d.slice[r[2]]) return `${r[1]} ${d.slice[r[2]]} |`;
        return line;
    });
    fs.writeFileSync(logicPath, logic.join('\n'));
    fs.writeFileSync(path.join(P2, 'phase4-slices.md'), renderPhase4(derive(fs.readFileSync(ownPath, 'utf8'))));
}

const texts = () => ['ownership-map.md', 'logic-migration.md', 'phase4-slices.md'].map((f) => fs.readFileSync(path.join(P2, f), 'utf8'));
const summary = (d) => {
    const counts = {};
    for (const f of Object.keys(d.rows)) counts[d.slice[f]] = (counts[d.slice[f]] || 0) + 1;
    return { files: Object.keys(d.rows).length, classes: d.classes, components: Object.keys(d.comp).length, capRowsFromPhase0: Object.keys(d.caps).length, dynamicRenders: d.dynamic.length, sliceCounts: counts };
};

if (process.argv.includes('--write')) {
    write();
    const [o, l, p] = texts();
    const { d, errs } = check(o, l, p);
    console.log(JSON.stringify({ written: true, ...summary(d), errors: errs }, null, 2));
} else if (process.argv.includes('--self-test')) {
    const [o, l, p] = texts();
    const cases = [];
    // 1. Table cells: move product-card.liquid and productCard (both slice 1) to slice 5.
    const badOwn = o.replace(/(\| `snippets\/product-card\.liquid` \|(?:[^|]*\|){5})\s*\d\s*\|/, '$1 5 |');
    const badLogic = l.replace(/^(\| productCard \| .+\|)\s*\S+\s*\|\s*$/m, '$1 5 |');
    if (badOwn === o || badLogic === l) throw new Error('self-test injection 1 did not apply');
    cases.push({ name: 'table cells moved to slice 5', errs: check(badOwn, badLogic, p).errs });
    // 2 and 3. Graph injections, in memory only: a slice-1 snippet mounts a slice-5 item.
    const card = 'snippets/product-card.liquid';
    const cardText = read(card);
    cases.push({ name: "single-quoted x-data='newsletterBanner()' in product-card.liquid", errs: check(o, l, p, { [card]: `${cardText}\n<div x-data='newsletterBanner()'></div>\n` }).errs });
    cases.push({ name: "$store['newsletterOverlay'] in product-card.liquid", errs: check(o, l, p, { [card]: `${cardText}\n<div x-text="$store['newsletterOverlay']"></div>\n` }).errs });
    cases.push({ name: "spaced x-data = 'newsletterBanner()' in product-card.liquid", errs: check(o, l, p, { [card]: `${cardText}\n<div x-data = 'newsletterBanner()'></div>\n` }).errs });
    cases.push({ name: 'unquoted x-data=newsletterBanner in product-card.liquid', errs: check(o, l, p, { [card]: `${cardText}\n<div x-data=newsletterBanner></div>\n` }).errs });
    cases.push({ name: '$store?.newsletterOverlay in product-card.liquid', errs: check(o, l, p, { [card]: `${cardText}\n<div x-text="$store?.newsletterOverlay"></div>\n` }).errs });
    // A mention inside a doc or comment block is not a mount and must not change any slice.
    cases.push({
        name: 'x-data="newsletterBanner" inside {% comment %} and {% doc %} in product-card.liquid (expects 0 errors)',
        errs: check(o, l, p, { [card]: `${cardText}\n{% comment %}<div x-data="newsletterBanner"></div>{% endcomment %}\n{% doc %}x-data="newsletterBanner"{% enddoc %}\n` }).errs,
        expectClean: true,
    });
    // Every printed D-file gate command runs and lists every file the derivation counts as a mount.
    // git grep cannot skip comments, so it may list extra files that only mention an item; those are reported, not failed.
    const { d } = check(o, l, p);
    const gateErrs = [];
    const extras = [];
    for (const f of Object.keys(d.rows).filter((x) => d.rows[x].cls === 'D')) {
        const names = d.defFile[f] || [];
        let hits = [];
        try {
            hits = require('child_process').execFileSync('git', gateArgs(f, [...names].sort()), { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
        } catch (e) {
            if (e.status !== 1) gateErrs.push(`${f}: command failed: ${e.message.split('\n')[0]}`);
        }
        const want = new Set(names.flatMap((n) => d.mountFiles[n] || []));
        for (const w of want) if (!hits.includes(w)) gateErrs.push(`${f}: command misses mount ${w}`);
        for (const h of hits) if (names.length && !want.has(h)) extras.push(`${f}: ${h} (mention only)`);
    }
    cases.push({ name: 'D-file gate commands run and cover every derived mount (expects 0 problems)', errs: gateErrs, expectClean: true, extras });
    const failed = cases.filter((c) => (c.expectClean ? c.errs.length > 0 : c.errs.length === 0)).map((c) => c.name);
    console.log(JSON.stringify({ cases: cases.map((c) => ({ name: c.name, reported: c.errs.length, first: c.errs[0], ...(c.extras ? { mentionOnlyHits: c.extras } : {}) })), failed }, null, 2));
    process.exitCode = failed.length ? 1 : 0;
} else {
    const [o, l, p] = texts();
    const { d, errs } = check(o, l, p);
    console.log(JSON.stringify({ ...summary(d), errors: errs.length, details: errs }, null, 2));
    process.exitCode = errs.length ? 1 : 0;
}
