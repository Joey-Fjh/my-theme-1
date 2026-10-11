/** Pure rules shared by the runner and the harness tests. */

import { runtimeMatchesUrlPattern } from './runtime-keys.mjs';

const RUNTIME_SELECTOR_PREFIX = /^(?:console|pageerror|http):/;

/**
 * A config exception covers an issue by URL pattern, by exact selector, or (CSS selectors only) by a selector prefix
 * ending at a combinator. Runtime selectors (console:, pageerror:, http:) match exactly, so a longer message is not covered.
 */
export function isExcepted(issue, config) {
    for (const ex of config.exceptions ?? []) {
        if (!ex.checks.includes(issue.check)) continue;
        if (ex.urlPattern && runtimeMatchesUrlPattern(issue, ex.urlPattern)) return true;
        if (!ex.selector) continue;
        if (issue.selector === ex.selector) return true;
        if (RUNTIME_SELECTOR_PREFIX.test(ex.selector)) continue;
        if (issue.selector.startsWith(`${ex.selector} >`)) return true;
        if (issue.selector.startsWith(`${ex.selector} `)) return true;
    }
    return false;
}

/** Article links on a blog page: `/blogs/<blog>/<handle>`, never a `/tagged/` listing. */
export function isArticlePath(href) {
    const raw = String(href || '');
    let pathname = raw;
    if (/^https?:/i.test(raw)) {
        try {
            pathname = new URL(raw).pathname;
        } catch {
            return false;
        }
    }
    pathname = pathname.split('?')[0].split('#')[0];
    const match = pathname.match(/^\/blogs\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return false;
    if (match[2] === 'tagged') return false;
    return true;
}

export function pickArticleHref(hrefs) {
    return hrefs.find((href) => isArticlePath(href)) ?? null;
}

/** `--prune-baseline` may only run from a clean run. */
export function pruneRefusalReason({ newIssueCount, documentRetries }) {
    if (newIssueCount > 0) {
        return `--prune-baseline refused: the run had ${newIssueCount} new issue(s); prune only from a clean run.`;
    }
    if (documentRetries > 0) {
        return `--prune-baseline refused: ${documentRetries} document load(s) needed a retry; prune only from a clean run.`;
    }
    return null;
}

/** Expected document status: 404 for the deliberate not-found page, otherwise 200. */
export function expectedDocumentStatus(pageKey) {
    return pageKey === 'not-found' ? 404 : 200;
}

/** Config errors stop the run: every exception needs a reason, a checks array, and a selector or urlPattern. */
export function validateConfig(config) {
    for (const ex of config.exceptions ?? []) {
        if (!ex.reason || !String(ex.reason).trim()) {
            throw new Error(
                `Config error: exception is missing a non-empty "reason" (${ex.selector ?? ex.urlPattern ?? '?'}).`,
            );
        }
        if (!Array.isArray(ex.checks) || ex.checks.length === 0) {
            throw new Error(`Config error: exception must include a checks array.`);
        }
        if (!ex.selector && !ex.urlPattern) {
            throw new Error(`Config error: exception must include selector or urlPattern.`);
        }
    }
}
