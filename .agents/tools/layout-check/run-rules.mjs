/** Pure rules shared by the runner and the harness tests. */

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
