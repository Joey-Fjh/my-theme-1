const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const ROOT = path.resolve(__dirname, '../../../..');
const HTTPS_PATH = path.join(ROOT, 'assets/https.js');

function loadProductionCarryInnerSectionStylesheet() {
    const httpsSource = fs.readFileSync(HTTPS_PATH, 'utf8');
    const marker = 'static carryInnerSectionStylesheet(doc, targetEl) {';
    const start = httpsSource.indexOf(marker);

    if (start === -1) {
        throw new Error('carryInnerSectionStylesheet not found in assets/https.js');
    }

    let index = start + marker.length;
    let depth = 1;

    while (index < httpsSource.length && depth > 0) {
        const char = httpsSource[index];
        if (char === '{') depth += 1;
        else if (char === '}') depth -= 1;
        index += 1;
    }

    const body = httpsSource.slice(start + marker.length, index - 1);
    return new Function('doc', 'targetEl', body);
}

function createStyleNode(text) {
    const node = {
        tagName: 'STYLE',
        textContent: text,
        attributes: { 'data-section-stylesheet': '' },
        cloneNode() {
            const clone = createStyleNode(text);
            clone.attributes = { ...node.attributes };
            return clone;
        },
    };

    return node;
}

function attachChild(parent, child) {
    child.parentNode = parent;
    child.replaceWith = (next) => {
        const index = parent.childNodes.indexOf(child);
        parent.childNodes[index] = next;
        attachChild(parent, next);
        if (parent.firstChild === child) {
            parent.firstChild = next;
        }
    };
}

function createElement({ children = [] } = {}) {
    const el = {
        tagName: 'DIV',
        childNodes: [...children],
        firstChild: children[0] ?? null,
        querySelector(sel) {
            if (sel === 'style[data-section-stylesheet]') {
                return findStyle(this);
            }

            return null;
        },
        querySelectorAll(sel) {
            if (sel !== 'style[data-section-stylesheet]') return [];
            const matches = [];
            collectStyles(this, matches);
            return matches;
        },
        insertBefore(child) {
            this.childNodes.unshift(child);
            this.firstChild = child;
            attachChild(this, child);
        },
    };

    for (const child of children) {
        attachChild(el, child);
    }

    return el;
}

function findStyle(node) {
    if (node.tagName === 'STYLE' && node.attributes?.['data-section-stylesheet'] !== undefined) {
        return node;
    }

    for (const child of node.childNodes ?? []) {
        const match = findStyle(child);
        if (match) return match;
    }

    return null;
}

function collectStyles(node, matches) {
    if (node.tagName === 'STYLE' && node.attributes?.['data-section-stylesheet'] !== undefined) {
        matches.push(node);
    }

    for (const child of node.childNodes ?? []) {
        collectStyles(child, matches);
    }
}

const carryInnerSectionStylesheet = loadProductionCarryInnerSectionStylesheet();

test('carryInnerSectionStylesheet inserts when target has no section stylesheet', () => {
    const style = createStyleNode('.ok { color: red; }');

    const doc = {
        querySelector(sel) {
            if (sel === 'style[data-section-stylesheet]') return style;
            return null;
        },
    };

    const targetEl = createElement();
    carryInnerSectionStylesheet(doc, targetEl);

    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 1);
    assert.equal(targetEl.firstChild.textContent, '.ok { color: red; }');
});

test('carryInnerSectionStylesheet replaces on repeated refresh without accumulation', () => {
    const firstStyle = createStyleNode('.v1 { color: red; }');
    const secondStyle = createStyleNode('.v2 { color: blue; }');

    const targetEl = createElement({
        children: [firstStyle],
    });

    const doc = {
        querySelector(sel) {
            if (sel === 'style[data-section-stylesheet]') return secondStyle;
            return null;
        },
    };

    carryInnerSectionStylesheet(doc, targetEl);

    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 1);
    assert.equal(targetEl.querySelector('style[data-section-stylesheet]').textContent, '.v2 { color: blue; }');

    const thirdStyle = createStyleNode('.v3 { color: green; }');
    doc.querySelector = (sel) => (sel === 'style[data-section-stylesheet]' ? thirdStyle : null);

    carryInnerSectionStylesheet(doc, targetEl);

    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 1);
    assert.equal(targetEl.querySelector('style[data-section-stylesheet]').textContent, '.v3 { color: green; }');
});

test('carryInnerSectionStylesheet is a no-op when response has no section stylesheet', () => {
    const targetEl = createElement();
    carryInnerSectionStylesheet({ querySelector: () => null }, targetEl);

    assert.equal(targetEl.querySelectorAll('style[data-section-stylesheet]').length, 0);
});
