#!/usr/bin/env node
/**
 * Storefront layout check harness. Optional env: LAYOUT_BASE_URL, STOREFRONT_PASSWORD,
 * LAYOUT_INJECT_STYLE (addStyleTag CSS for local regression probes; not for production CI).
 * If `<repo root>/.env` exists, it is loaded at startup (`process.loadEnvFile`); variables
 * already set in the environment keep precedence.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { CHECK_NAMES } from './checks.mjs';
import {
    baselineIdentityKey,
    compareToBaseline,
    consoleRuntimeSelector,
    httpRuntimeSelector,
    isFailedLoadResourceConsoleMessage,
    pageErrorRuntimeSelector,
    runtimeMatchesUrlPattern,
    shouldIgnoreRequestFailure,
} from './runtime-keys.mjs';

import { pickArticleHref, pruneRefusalReason, expectedDocumentStatus, validateConfig } from './run-rules.mjs';
export { baselineIdentityKey, compareToBaseline, normalizeRuntimeMessage } from './runtime-keys.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../..');
const ENV_PATH = path.join(REPO_ROOT, '.env');
if (fs.existsSync(ENV_PATH)) {
    process.loadEnvFile(ENV_PATH);
}
const CONFIG_PATH = path.join(__dirname, 'layout-check.config.json');
const BASELINE_PATH = path.join(__dirname, 'layout-check.baseline.json');
const OUTPUT_DIR = path.join(__dirname, '../../../.tmp-layout-check');
const REPORT_PATH = path.join(OUTPUT_DIR, 'report.json');
const SUMMARY_PATH = path.join(OUTPUT_DIR, 'summary.txt');

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
    const flags = {
        page: null,
        widths: null,
        writeBaseline: false,
        pruneBaseline: false,
    };
    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--write-baseline') flags.writeBaseline = true;
        else if (arg === '--prune-baseline') flags.pruneBaseline = true;
        else if (arg === '--page' && argv[i + 1]) {
            flags.page = argv[++i];
        } else if (arg === '--widths' && argv[i + 1]) {
            flags.widths = argv[++i].split(',').map((w) => Number.parseInt(w, 10));
        }
    }
    return flags;
}

function buildWidthList(config, override) {
    if (override?.length) return override;
    const widths = [];
    for (let w = config.widthMin; w <= config.widthMax; w += config.widthStep) {
        widths.push(w);
    }
    return widths;
}

function issueKey(pageKey, check, selector) {
    return `${pageKey}\0${check}\0${selector}`;
}

function isExcepted(issue, pageKey, config) {
    for (const ex of config.exceptions ?? []) {
        if (!ex.checks.includes(issue.check)) continue;
        if (ex.urlPattern && runtimeMatchesUrlPattern(issue, ex.urlPattern)) return true;
        if (!ex.selector) continue;
        if (issue.selector === ex.selector) return true;
        if (issue.selector.startsWith(`${ex.selector} >`)) return true;
        if (issue.selector.startsWith(`${ex.selector} `)) return true;
    }
    return false;
}

function mergeWidthRanges(widths, step) {
    if (!widths.length) return '';
    const sorted = [...new Set(widths)].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === end + step) {
            end = sorted[i];
        } else {
            ranges.push(start === end ? `${start}` : `${start}–${end}`);
            start = sorted[i];
            end = sorted[i];
        }
    }
    ranges.push(start === end ? `${start}` : `${start}–${end}`);
    return ranges.join(', ');
}

function formatSummaryTable(report) {
    const lines = [];
    lines.push('Layout check summary');
    lines.push('');
    const header = ['Page', ...CHECK_NAMES, 'New', 'Widths'];
    lines.push(header.join('\t'));
    for (const page of report.pages) {
        const counts = CHECK_NAMES.map((c) => page.countsByCheck[c] ?? 0);
        lines.push(
            [
                page.key,
                ...counts,
                page.newCount,
                page.widthSummary || '—',
            ].join('\t'),
        );
    }
    lines.push('');
    lines.push(`Wall time: ${report.wallTimeMs}ms`);
    lines.push(`New issues (not in baseline): ${report.newIssueCount}`);
    return lines.join('\n');
}

async function assertDevServerReachable(baseUrl, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(baseUrl, { signal: controller.signal, redirect: 'manual' });
        clearTimeout(timer);
        if (!res.ok && res.status >= 500) {
            throw new Error(`Dev server returned ${res.status}`);
        }
    } catch (err) {
        clearTimeout(timer);
        const msg =
            err?.name === 'AbortError'
                ? `Could not reach ${baseUrl} within ${timeoutMs / 1000}s. Start the storefront with: npm.cmd run shopify:dev`
                : `Could not reach ${baseUrl}. Start the storefront with: npm.cmd run shopify:dev (${err.message})`;
        console.error(msg);
        process.exit(1);
    }
}

async function handlePasswordPage(page) {
    const url = new URL(page.url());
    if (!url.pathname.includes('password')) return;

    const password = process.env.STOREFRONT_PASSWORD;
    if (!password) {
        throw new Error(
            'Storefront password page detected. Set STOREFRONT_PASSWORD in the environment (never commit it).',
        );
    }

    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"], input[type="submit"]');
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
}

async function discoverPages(page, baseUrl, config) {
    const pages = { ...config.fixedPages };
    for (const alt of config.alternateTemplates ?? []) {
        pages[alt.key] = alt.path;
    }
    for (const pin of config.pinnedUrls ?? []) {
        pages[pin.key] = pin.path;
    }

    const collectionUrl = new URL(config.fixedPages['collection-all'] || '/collections/all', baseUrl).href;
    await page.goto(collectionUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await handlePasswordPage(page);

    const productHref = await page.evaluate(() => {
        const link = document.querySelector(
            'a[href*="/products/"]:not([href*="cdn.shopify"])',
        );
        return link ? link.getAttribute('href') : null;
    });
    if (!productHref) {
        throw new Error('Discovery failed: no product link found on /collections/all.');
    }
    pages.product = normalizeStorePath(productHref);

    const blogPath = await discoverBlogPath(page, baseUrl);
    if (!blogPath) {
        throw new Error('Discovery failed: no blog link found (tried /, /blogs, /collections/all, and sitemap_blogs_1.xml).');
    }
    pages.blog = blogPath;

    await page.goto(new URL(blogPath, baseUrl).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await handlePasswordPage(page);
    const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll('a[href*="/blogs/"]')].map((a) => a.getAttribute('href') || ''),
    );
    const articleHref = pickArticleHref(hrefs);
    if (!articleHref) {
        throw new Error(`Discovery failed: no article link found on blog ${blogPath}.`);
    }
    pages.article = normalizeStorePath(articleHref);
    await page.goto(new URL(pages.article, baseUrl).href, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
    });
    const ogType = await page.evaluate(
        () => document.querySelector('meta[property="og:type"]')?.getAttribute('content') ?? null,
    );
    if (ogType !== 'article') {
        throw new Error(
            `Discovery failed: ${pages.article} is not an article page (og:type is ${ogType ?? 'missing'}).`,
        );
    }

    return pages;
}

function normalizeStorePath(href) {
    if (href.startsWith('http')) {
        const u = new URL(href);
        return u.pathname + u.search;
    }
    return href.startsWith('/') ? href : `/${href}`;
}

async function discoverBlogPath(page, baseUrl) {
    const scanPaths = ['/', '/blogs', '/collections/all'];
    for (const scanPath of scanPaths) {
        await page.goto(new URL(scanPath, baseUrl).href, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });
        await handlePasswordPage(page);
        const href = await page.evaluate(() => {
            for (const a of document.querySelectorAll('a[href*="/blogs/"]')) {
                const raw = a.getAttribute('href') || '';
                const path = raw.split('?')[0].split('#')[0];
                const match = path.match(/\/blogs\/[^/]+/);
                if (match) return match[0];
            }
            return null;
        });
        if (href) return href;
    }

    try {
        const res = await fetch(new URL('/sitemap_blogs_1.xml', baseUrl), {
            signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
            const xml = await res.text();
            const loc = xml.match(/<loc>([^<]+)<\/loc>/);
            if (loc) return new URL(loc[1]).pathname;
        }
    } catch {
        /* try next */
    }

    return null;
}

async function waitForSettle(page, settleMs) {
    await page.evaluate(
        () =>
            new Promise((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(resolve));
            }),
    );
    await page.waitForTimeout(settleMs);
}

/** Attach before navigation so load-time console errors are not lost to a race. */
function startRuntimeCollector(page, storefrontOrigin) {
    const consoleErrors = [];
    const pageErrors = [];
    const httpIssues = [];
    const seenHttp = new Set();

    const onConsole = (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        // S2: response listener owns failed network loads; skip duplicate console lines.
        if (isFailedLoadResourceConsoleMessage(text)) return;
        consoleErrors.push(text);
    };
    const onPageError = (err) => pageErrors.push(String(err));
    const onResponse = (response) => {
        if (response.status() < 400) return;
        const request = response.request();
        const selector = httpRuntimeSelector(request.method(), response.url(), storefrontOrigin);
        if (seenHttp.has(selector)) return;
        seenHttp.add(selector);
        httpIssues.push({
            check: 'runtime',
            selector,
            detail: `HTTP ${response.status()}`,
        });
    };
    const onRequestFailed = (request) => {
        const failureText = request.failure()?.errorText || '';
        if (shouldIgnoreRequestFailure(failureText)) return;
        const selector = httpRuntimeSelector(request.method(), request.url(), storefrontOrigin);
        if (seenHttp.has(selector)) return;
        seenHttp.add(selector);
        httpIssues.push({
            check: 'runtime',
            selector,
            detail: failureText || 'request failed',
        });
    };

    page.on('console', onConsole);
    page.on('pageerror', onPageError);
    page.on('response', onResponse);
    page.on('requestfailed', onRequestFailed);

    const stop = () => {
        page.off('console', onConsole);
        page.off('pageerror', onPageError);
        page.off('response', onResponse);
        page.off('requestfailed', onRequestFailed);
    };
    return { consoleErrors, pageErrors, httpIssues, stop };
}

async function runRuntimeCheck(page, settleMs, collector, observeMs = 0) {
    const { consoleErrors, pageErrors, httpIssues } = collector;
    await page.evaluate(async (delayMs) => {
        const vh = window.innerHeight;
        const max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        for (let y = 0; y <= max; y += vh) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, delayMs));
        }
        window.scrollTo(0, 0);
    }, settleMs);
    await waitForSettle(page, settleMs);
    // Fixed observation window so late load-time console errors are seen on short pages too.
    if (observeMs > 0) await page.waitForTimeout(observeMs);

    let mountIssues = await runMountCheckOnPage(page);
    const mountDeadline = Date.now() + 10000;
    while (mountIssues.length > 0 && Date.now() < mountDeadline) {
        await page.waitForTimeout(500);
        mountIssues = await runMountCheckOnPage(page);
    }

    collector.stop();

    const issues = [];
    const seenConsole = new Set();
    for (const text of consoleErrors) {
        const selector = consoleRuntimeSelector(text);
        if (seenConsole.has(selector)) continue;
        seenConsole.add(selector);
        issues.push({ check: 'runtime', selector, detail: text.slice(0, 200) });
    }
    const seenPageError = new Set();
    for (const text of pageErrors) {
        const selector = pageErrorRuntimeSelector(text);
        if (seenPageError.has(selector)) continue;
        seenPageError.add(selector);
        issues.push({ check: 'runtime', selector, detail: text.slice(0, 200) });
    }
    issues.push(...httpIssues);
    for (const m of mountIssues) {
        issues.push(m);
    }
    return issues;
}

let browserChecksBundle;

function getBrowserChecksSource() {
    if (!browserChecksBundle) {
        let src = fs.readFileSync(path.join(__dirname, 'checks.mjs'), 'utf8');
        browserChecksBundle = src.replace(/^export /gm, '');
    }
    return browserChecksBundle;
}

async function runChecksOnPage(page) {
    return page.evaluate(new Function(`${getBrowserChecksSource()}; return runLayoutChecksInPage();`));
}

async function runMountCheckOnPage(page) {
    return page.evaluate(new Function(`${getBrowserChecksSource()}; return checkModuleMountState();`));
}

function normalizeBaseline(baseline) {
    return baseline?.issues ?? [];
}

async function main() {
    const flags = parseArgs(process.argv);
    const config = loadJson(CONFIG_PATH);
    validateConfig(config);
    const baseUrl = process.env.LAYOUT_BASE_URL || config.baseUrl;
    const widths = buildWidthList(config, flags.widths);

    if (flags.pruneBaseline && (flags.page || flags.widths)) {
        console.error(
            '--prune-baseline cannot be used with --page or --widths (would drop other pages from the baseline).',
        );
        process.exit(1);
    }

    if (flags.writeBaseline && fs.existsSync(BASELINE_PATH)) {
        console.error('--write-baseline refused: baseline file already exists.');
        process.exit(1);
    }

    if (!flags.writeBaseline && !flags.pruneBaseline) {
        await assertDevServerReachable(baseUrl);
    } else if (flags.pruneBaseline) {
        await assertDevServerReachable(baseUrl);
    }

    const startMs = Date.now();
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    // Dialogs are out of scope for the page sweep: mark the newsletter popup as already shown.
    await context.addInitScript(() => {
        try {
            window.localStorage.setItem('newsletter-overlay-expired', '4102444800000');
        } catch {
            /* storage unavailable */
        }
    });
    const page = await context.newPage();

    let pageMap;
    try {
        pageMap = await discoverPages(page, baseUrl, config);
    } catch (err) {
        await browser.close();
        console.error(err.message);
        process.exit(1);
    }

    if (flags.page) {
        if (!pageMap[flags.page]) {
            console.error(`Unknown page key: ${flags.page}`);
            await browser.close();
            process.exit(1);
        }
        pageMap = { [flags.page]: pageMap[flags.page] };
    }

    const issueMap = new Map();
    const pageReports = [];
    let documentRetries = 0;

    for (const [pageKey, pagePath] of Object.entries(pageMap)) {
        const url = new URL(pagePath, baseUrl).href;
        await page.setViewportSize({
            width: config.defaultViewportWidth,
            height: config.viewportHeight,
        });
        const expectedStatus = expectedDocumentStatus(pageKey);
        let collector = startRuntimeCollector(page, baseUrl);
        let response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
        let documentStatus = response?.status() ?? 0;
        if (documentStatus !== expectedStatus) {
            documentRetries += 1;
            collector.stop();
            collector = startRuntimeCollector(page, baseUrl);
            response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
            documentStatus = response?.status() ?? 0;
        }
        const documentIssues =
            documentStatus === expectedStatus
                ? []
                : [
                      {
                          check: 'runtime',
                          selector: `document:${documentStatus}`,
                          detail: `HTTP ${documentStatus}`,
                      },
                  ];
        await handlePasswordPage(page);
        await waitForSettle(page, config.settleMs);

        const injectStyle = process.env.LAYOUT_INJECT_STYLE;
        if (injectStyle) {
            await page.addStyleTag({ content: injectStyle });
            await waitForSettle(page, config.settleMs);
        }

        const runtimeIssues = [...documentIssues];
        if (!flags.widths || widths.includes(1440) || config.defaultViewportWidth === 1440) {
            runtimeIssues.push(...(await runRuntimeCheck(page, config.settleMs, collector, config.runtimeObserveMs ?? 0)));
        } else {
            collector.stop();
        }
        for (const issue of runtimeIssues) {
            if (isExcepted(issue, pageKey, config)) continue;
            const key = issueKey(pageKey, issue.check, issue.selector);
            const entry = issueMap.get(key) || {
                page: pageKey,
                check: issue.check,
                selector: issue.selector,
                widths: [],
                detail: issue.detail,
            };
            entry.widths.push(config.defaultViewportWidth);
            issueMap.set(key, entry);
        }

        for (const width of widths) {
            await page.setViewportSize({ width, height: config.viewportHeight });
            await waitForSettle(page, config.settleMs);
            const rawIssues = await runChecksOnPage(page);
            for (const issue of rawIssues) {
                if (isExcepted(issue, pageKey, config)) continue;
                const key = issueKey(pageKey, issue.check, issue.selector);
                const entry = issueMap.get(key) || {
                    page: pageKey,
                    check: issue.check,
                    selector: issue.selector,
                    widths: [],
                };
                if (!entry.widths.includes(width)) entry.widths.push(width);
                issueMap.set(key, entry);
            }
        }

        const pageIssues = [...issueMap.values()].filter((i) => i.page === pageKey);
        const countsByCheck = {};
        for (const c of CHECK_NAMES) countsByCheck[c] = 0;
        for (const i of pageIssues) countsByCheck[i.check] = (countsByCheck[i.check] || 0) + 1;

        pageReports.push({
            key: pageKey,
            url,
            countsByCheck,
            issueCount: pageIssues.length,
            newCount: 0,
            widthSummary: '',
        });
    }

    await browser.close();
    const wallTimeMs = Date.now() - startMs;

    const allIssues = [...issueMap.values()].map((i) => ({
        page: i.page,
        check: i.check,
        selector: i.selector,
        widths: mergeWidthRanges(i.widths, config.widthStep),
        detail: i.detail,
    }));

    let baselineIssues = [];
    if (fs.existsSync(BASELINE_PATH)) {
        baselineIssues = normalizeBaseline(loadJson(BASELINE_PATH));
    }

    const newIssues = compareToBaseline(allIssues, baselineIssues);

    if (flags.writeBaseline) {
        const out = { version: 1, issues: allIssues };
        fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(out, null, 4)}\n`, 'utf8');
        console.log(`Baseline written to ${BASELINE_PATH} (${allIssues.length} issues).`);
        process.exit(0);
    }

    if (flags.pruneBaseline) {
        const refusal = pruneRefusalReason({ newIssueCount: newIssues.length, documentRetries });
        if (refusal) {
            console.error(refusal);
            process.exit(1);
        }
        const currentKeys = new Set(allIssues.map((i) => baselineIdentityKey(i)));
        const remaining = baselineIssues.filter((entry) => currentKeys.has(baselineIdentityKey(entry)));
        const out = { version: 1, issues: remaining };
        fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(out, null, 4)}\n`, 'utf8');
        console.log(`Pruned baseline: ${baselineIssues.length} -> ${remaining.length} issues.`);
        process.exit(0);
    }

    for (const pr of pageReports) {
        const pageNew = newIssues.filter((n) => n.page === pr.key).length;
        pr.newCount = pageNew;
        const widthSets = allIssues.filter((i) => i.page === pr.key).map((i) => i.widths);
        pr.widthSummary = widthSets.slice(0, 3).join('; ') + (widthSets.length > 3 ? '…' : '');
    }

    const report = {
        baseUrl,
        wallTimeMs,
        generatedAt: new Date().toISOString(),
        pages: pageReports.map((p) => ({
            key: p.key,
            url: p.url,
            countsByCheck: p.countsByCheck,
            issueCount: p.issueCount,
        })),
        issues: allIssues,
        newIssueCount: newIssues.length,
        newIssues,
    };

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    const summary = formatSummaryTable({
        pages: pageReports,
        wallTimeMs,
        newIssueCount: newIssues.length,
    });
    fs.writeFileSync(SUMMARY_PATH, summary, 'utf8');
    console.log(summary);

    if (newIssues.length > 0) {
        console.error(`\n${newIssues.length} issue(s) not in baseline.`);
        process.exit(1);
    }
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
