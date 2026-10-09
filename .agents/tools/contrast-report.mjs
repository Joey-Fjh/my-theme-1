#!/usr/bin/env node
// Reports WCAG 2.x contrast for each colour scheme's key pairs (6-C4). Report only: always exits 0.
// Values come from config/settings_data.json (merchant data, read only); text roles are composited
// with the steps declared in snippets/css-variables.liquid.
// Usage: node .agents/tools/contrast-report.mjs [--root <dir>]
import fs from 'node:fs';
import path from 'node:path';

const rootIndex = process.argv.indexOf('--root');
const root = rootIndex > -1 ? path.resolve(process.argv[rootIndex + 1]) : process.cwd();

function readSchemes() {
    const raw = fs.readFileSync(path.join(root, 'config/settings_data.json'), 'utf8');
    // settings_data.json starts with a Shopify comment block, which JSON.parse rejects.
    const data = JSON.parse(raw.replace(/^\s*\/\*[\s\S]*?\*\//, ''));
    return data.current?.color_schemes ?? {};
}

function readStep(name) {
    const css = fs.readFileSync(path.join(root, 'snippets/css-variables.liquid'), 'utf8');
    const match = css.match(new RegExp(`--alpha-${name}:\\s*([\\d.]+);`));
    if (!match) throw new Error(`--alpha-${name} not found in snippets/css-variables.liquid`);
    return Number(match[1]);
}

/** '#rgb', '#rrggbb', '#rrggbbaa' or 'rgba(r,g,b,a)' → [r, g, b, a]; empty → null. */
function parseColour(value) {
    if (!value) return null;
    const text = String(value).trim();
    const fn = text.match(/^rgba?\(([^)]+)\)$/i);
    if (fn) {
        const [r, g, b, a = '1'] = fn[1].split(/[\s,/]+/).filter(Boolean);
        return [Number(r), Number(g), Number(b), Number(a)];
    }
    let hex = text.replace('#', '');
    if (hex.length === 3) hex = [...hex].map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(hex)) return null;
    const channels = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return [...channels, alpha];
}

/** Alpha-composite fg over an opaque bg. */
function over(fg, bg, extraAlpha = 1) {
    const a = fg[3] * extraAlpha;
    return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1);
}

function luminance([r, g, b]) {
    const lin = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

const muted = readStep('80');
const subtle = readStep('72');

// [label, foreground setting, background setting, foreground alpha step, minimum ratio]
const PAIRS = [
    ['text', 'text_color', 'background_color', 1, 4.5],
    ['text-muted', 'text_color', 'background_color', muted, 4.5],
    ['text-subtle', 'text_color', 'background_color', subtle, 4.5],
    ['primary button', 'primary_button_label_color', 'primary_button_background_color', 1, 4.5],
    ['secondary button', 'secondary_button_label_color', 'secondary_button_background_color', 1, 4.5],
    ['badge', 'badge_label_color', 'badge_background_color', 1, 4.5],
    ['success', 'success_foreground_color', 'success_background_color', 1, 4.5],
    ['warning', 'warning_foreground_color', 'warning_background_color', 1, 4.5],
    ['error', 'error_foreground_color', 'error_background_color', 1, 4.5],
    ['info', 'info_foreground_color', 'info_background_color', 1, 4.5],
    ['input text', 'input_text_color', 'input_background_color', 1, 4.5],
    ['input placeholder', 'input_placeholder_color', 'input_background_color', 1, 4.5],
    ['input border (non-text)', 'input_border_color', 'input_background_color', 1, 3],
    ['focus ring (non-text)', 'focus_ring_color', 'background_color', 1, 3],
];

const schemes = readSchemes();
const failing = [];
for (const [id, scheme] of Object.entries(schemes)) {
    const s = scheme.settings ?? {};
    const page = parseColour(s.background_color);
    console.log(`\n${id}  (background ${s.background_color})`);
    for (const [label, fgKey, bgKey, step, min] of PAIRS) {
        const fg = parseColour(s[fgKey]);
        let bg = parseColour(s[bgKey]);
        if (!fg || !bg || !page) {
            console.log(`  ${label.padEnd(26)} n/a (unset)`);
            continue;
        }
        // A translucent background (for example a transparent secondary button) sits on the scheme background.
        bg = over(bg, page);
        const value = ratio(over(fg, bg, step), bg);
        const pass = value >= min;
        if (!pass) failing.push(`${id} ${label} ${value.toFixed(2)} < ${min}`);
        console.log(`  ${label.padEnd(26)} ${value.toFixed(2).padStart(6)}  ${pass ? 'pass' : `FAIL (min ${min})`}`);
    }
}

console.log(`\n${failing.length} failing pair(s).${failing.length ? ` Report only; owner 6-C9.\n- ${failing.join('\n- ')}` : ''}`);
