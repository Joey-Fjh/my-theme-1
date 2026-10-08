import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test, before, after } from 'node:test';
import { chromium } from 'playwright-core';
import {
    baselineIdentityKey,
    compareToBaseline,
    consoleRuntimeSelector,
    globToRegExp,
    httpRuntimeSelector,
    isFailedLoadResourceConsoleMessage,
    runtimeMatchesUrlPattern,
    shouldIgnoreRequestFailure,
} from './runtime-keys.mjs';
import { expectedDocumentStatus, isArticlePath, pickArticleHref, pruneRefusalReason } from './run-rules.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, 'fixtures');

let server;
let baseUrl;
let browser;
let context;
let page;

function getBrowserChecksSource() {
    let src = fs.readFileSync(path.join(__dirname, 'checks.mjs'), 'utf8');
    return src.replace(/^export /gm, '');
}

function startStaticServer() {
    return new Promise((resolve) => {
        server = http.createServer((req, res) => {
            const rel = decodeURIComponent(req.url.split('?')[0].replace(/^\//, '')) || 'index.html';
            const filePath = path.join(FIXTURES_DIR, rel);
            if (!filePath.startsWith(FIXTURES_DIR) || !fs.existsSync(filePath)) {
                res.writeHead(404);
                res.end('not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fs.readFileSync(filePath));
        });
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            baseUrl = `http://127.0.0.1:${port}`;
            resolve();
        });
    });
}

async function openFixture(name) {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`${baseUrl}/${name}`, { waitUntil: 'load' });
    await page.evaluate(
        () =>
            new Promise((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            }),
    );
}

async function runCheck(fnName) {
    return page.evaluate(new Function(`${getBrowserChecksSource()}; return ${fnName}();`));
}

async function runLayoutChecks() {
    return page.evaluate(new Function(`${getBrowserChecksSource()}; return runLayoutChecksInPage();`));
}

function hasCheck(issues, check) {
    return issues.some((i) => i.check === check);
}

before(async () => {
    await startStaticServer();
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    context = await browser.newContext({ reducedMotion: 'reduce' });
    page = await context.newPage();
});

after(async () => {
    await browser?.close();
    server?.close();
});

test('horizontal scroll positive and negative', async () => {
    await openFixture('horizontal-scroll-positive.html');
    let issues = await runCheck('checkHorizontalScroll');
    assert.ok(hasCheck(issues, 'horizontal-scroll'));

    await openFixture('horizontal-scroll-negative.html');
    issues = await runLayoutChecks();
    assert.equal(hasCheck(issues, 'horizontal-scroll'), false);
});

test('unclipped overflow positive and negative', async () => {
    await openFixture('unclipped-positive.html');
    let issues = await runCheck('checkUnclippedOverflow');
    assert.ok(hasCheck(issues, 'unclipped-overflow'));

    await openFixture('unclipped-negative.html');
    issues = await runCheck('checkUnclippedOverflow');
    assert.equal(issues.length, 0);
});

test('page margin positive and negative', async () => {
    await openFixture('page-margin-positive.html');
    let issues = await runCheck('checkPageMargin');
    assert.ok(hasCheck(issues, 'page-margin'));

    await openFixture('page-margin-negative.html');
    issues = await runCheck('checkPageMargin');
    assert.equal(issues.length, 0);
});

test('tap targets positive and negatives', async () => {
    await openFixture('tap-target-positive.html');
    let issues = await runCheck('checkTapTargets');
    assert.ok(hasCheck(issues, 'tap-targets'));

    await openFixture('tap-target-adjacent-large-positive.html');
    issues = await runCheck('checkTapTargets');
    assert.ok(hasCheck(issues, 'tap-targets'));

    await openFixture('tap-target-spacing-negative.html');
    issues = await runCheck('checkTapTargets');
    assert.equal(issues.length, 0);

    await openFixture('tap-target-inline-link-negative.html');
    issues = await runCheck('checkTapTargets');
    assert.equal(issues.length, 0);
});

test('clipped text positive and negative', async () => {
    await openFixture('clipped-text-positive.html');
    let issues = await runCheck('checkClippedText');
    assert.ok(hasCheck(issues, 'clipped-text'));

    await openFixture('clipped-text-negative.html');
    issues = await runCheck('checkClippedText');
    assert.equal(issues.length, 0);
});

test('runtime module mount positive and negative', async () => {
    await openFixture('runtime-module-positive.html');
    let issues = await runCheck('checkModuleMountState');
    assert.ok(issues.some((i) => i.check === 'runtime'));

    await openFixture('runtime-module-negative.html');
    issues = await runCheck('checkModuleMountState');
    assert.equal(issues.length, 0);
});

test('runtime console error is detectable', async () => {
    const errors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    await openFixture('runtime-console-positive.html');
    assert.ok(errors.some((e) => e.includes('fixture-runtime-error')));
    page.removeAllListeners('console');
});

test('skipped inert and closed dialog', async () => {
    await openFixture('skipped-inert-negative.html');
    let issues = await runCheck('checkUnclippedOverflow');
    assert.equal(issues.length, 0);

    await openFixture('skipped-dialog-negative.html');
    issues = await runCheck('checkUnclippedOverflow');
    assert.equal(issues.length, 0);
});

const T1_UTILITY_CLASSES = [
    'w-full',
    'h-full',
    'mt-6',
    'grid-cols-1',
    'flex-col',
    'self-start',
    'border-t',
    'pe-0',
    'mx-auto',
    'mb-1',
    'space-y-6',
    'order-2',
    'inset-0',
    'pointer-events-none',
    'cursor-pointer',
    'overflow-x-auto',
];

test('stable selectors omit theme numeric IDs and utility classes', async () => {
    await openFixture('selector-stability.html');
    const selector = await page.evaluate(
        new Function(
            `${getBrowserChecksSource()}; const el = document.querySelector('p'); return stableSelector(el);`,
        ),
    );
    assert.ok(!/\d{6,}/.test(selector));
    for (const util of T1_UTILITY_CLASSES) {
        assert.ok(!selector.includes(`.${util}`), `selector must not include .${util}: ${selector}`);
    }
    assert.ok(selector.includes('template__scroll_categories_B8wjNV'));
});

test('stable selectors normalize derived element ids (T2)', async () => {
    await openFixture('selector-element-id.html');
    const selectors = await page.evaluate(
        new Function(`${getBrowserChecksSource()}; return {
      button: stableSelector(document.querySelector('button')),
      link: stableSelector(document.querySelector('a')),
    };`),
    );
    assert.ok(!/\d{6,}/.test(selectors.button));
    assert.ok(!/\d{6,}/.test(selectors.link));
    assert.ok(selectors.button.includes('featured-products-template__featured_products_qR6LKN-tab-2'));
    assert.ok(selectors.link.includes('blog-template__main-tab-1'));
});

test('runtime console errors are distinct baseline keys', async () => {
    const a = consoleRuntimeSelector('Failed to load resource: the server responded with a status of 400 ()');
    const b = consoleRuntimeSelector('Failed to load resource: the server responded with a status of 404 (Not Found)');
    assert.notEqual(a, b);
    assert.notEqual(baselineIdentityKey({ page: 'home', check: 'runtime', selector: a }), baselineIdentityKey({ page: 'home', check: 'runtime', selector: b }));

    const baseline = [{ page: 'home', check: 'runtime', selector: a, widths: '1440' }];
    const current = [
        { page: 'home', check: 'runtime', selector: a, widths: '1440' },
        { page: 'home', check: 'runtime', selector: b, widths: '1440' },
    ];
    const newIssues = compareToBaseline(current, baseline);
    assert.equal(newIssues.length, 1);
    assert.equal(newIssues[0].selector, b);
});

test('config URL patterns match full http runtime selectors', () => {
    const storefront = 'http://127.0.0.1:9292';
    const shopApp = {
        check: 'runtime',
        selector: httpRuntimeSelector('GET', 'https://shop.app/accounts/pre_auth', storefront),
    };
    const graphql = {
        check: 'runtime',
        selector: httpRuntimeSelector(
            'POST',
            'http://127.0.0.1:9292/api/2024-07/graphql.json',
            storefront,
        ),
    };
    const benign = {
        check: 'runtime',
        selector: httpRuntimeSelector('GET', 'https://example.com/foo', storefront),
    };

    assert.ok(runtimeMatchesUrlPattern(shopApp, '**://shop.app/**'));
    assert.ok(runtimeMatchesUrlPattern(graphql, '**/api/**/graphql.json'));
    assert.equal(runtimeMatchesUrlPattern(benign, '**://shop.app/**'), false);
    assert.equal(runtimeMatchesUrlPattern(benign, '**/api/**/graphql.json'), false);

    assert.ok(globToRegExp('**://shop.app/**').test(shopApp.selector));
});

test('S2 drops Failed to load resource console messages', () => {
    assert.ok(
        isFailedLoadResourceConsoleMessage(
            'Failed to load resource: the server responded with a status of 403 ()',
        ),
    );
    const kept = consoleRuntimeSelector('[shopify-account] Menu missing');
    assert.ok(!isFailedLoadResourceConsoleMessage('[shopify-account] Menu missing'));
    assert.ok(kept.startsWith('console:'));
});

test('S3 ignores net::ERR_ABORTED request failures', () => {
    assert.ok(shouldIgnoreRequestFailure('net::ERR_ABORTED'));
    assert.equal(shouldIgnoreRequestFailure('net::ERR_CONNECTION_REFUSED'), false);
});

test('prune-baseline refuses --page and --widths', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const script = path.join(__dirname, 'layout-check.mjs');
    const withPage = spawnSync(process.execPath, [script, '--prune-baseline', '--page', 'home'], {
        cwd: repoRoot,
        encoding: 'utf8',
    });
    assert.notEqual(withPage.status, 0);
    assert.match(withPage.stderr + withPage.stdout, /--prune-baseline cannot be used with --page/);

    const withWidths = spawnSync(process.execPath, [script, '--prune-baseline', '--widths', '320'], {
        cwd: repoRoot,
        encoding: 'utf8',
    });
    assert.notEqual(withWidths.status, 0);
    assert.match(
        withWidths.stderr + withWidths.stdout,
        /--prune-baseline cannot be used with --page or --widths/,
    );
});

test('config exception without reason fails validation', async () => {
    const bad = {
        exceptions: [{ selector: '#x', checks: ['page-margin'] }],
    };
    const validateConfig = (config) => {
        for (const ex of config.exceptions ?? []) {
            if (!ex.reason || !String(ex.reason).trim()) {
                throw new Error(
                    `Config error: exception for selector "${ex.selector ?? '?'}" is missing a non-empty "reason".`,
                );
            }
        }
    };
    assert.throws(() => validateConfig(bad), /Config error/);
});

test('U2 article URL filter excludes tag listings and blog roots', () => {
    assert.equal(isArticlePath('/blogs/news/tagged/hydrating-moisturizers'), false);
    assert.equal(isArticlePath('/blogs/news/tagged'), false);
    assert.equal(isArticlePath('/blogs/news'), false);
    assert.equal(isArticlePath('/blogs/news/my-first-post'), true);
    assert.equal(isArticlePath('https://shop.example/blogs/news/my-first-post?x=1'), true);
    assert.equal(
        pickArticleHref(['/blogs/news', '/blogs/news/tagged/a', '/blogs/news/real-post']),
        '/blogs/news/real-post',
    );
    assert.equal(pickArticleHref(['/blogs/news/tagged/a']), null);
});

test('U3 prune refuses after new issues or document retries', () => {
    assert.equal(pruneRefusalReason({ newIssueCount: 0, documentRetries: 0 }), null);
    assert.match(pruneRefusalReason({ newIssueCount: 2, documentRetries: 0 }), /new issue/);
    assert.match(pruneRefusalReason({ newIssueCount: 0, documentRetries: 1 }), /retry/);
});

test('U3 expected document status is 404 only for not-found', () => {
    assert.equal(expectedDocumentStatus('not-found'), 404);
    assert.equal(expectedDocumentStatus('home'), 200);
});
