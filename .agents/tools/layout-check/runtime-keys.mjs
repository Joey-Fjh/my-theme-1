/**
 * Runtime issue selectors and baseline keys (Node-side).
 */

export function normalizeRuntimeMessage(text) {
    return String(text || '')
        .replace(/\b\d{2,}\b/g, 'N')
        .replace(/[a-f0-9]{8,}/gi, 'HASH')
        .replace(/\?[^\s)]+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 160);
}

export function consoleRuntimeSelector(message) {
    return `console:${normalizeRuntimeMessage(message)}`;
}

export function pageErrorRuntimeSelector(message) {
    return `pageerror:${normalizeRuntimeMessage(message)}`;
}

/** @param {string} [storefrontOrigin] Page origin; same-origin request URLs use `self` instead of the host. */
export function httpRuntimeSelector(method, url, storefrontOrigin) {
    try {
        const u = new URL(url);
        let originLabel = u.origin;
        if (storefrontOrigin) {
            try {
                if (u.origin === new URL(storefrontOrigin).origin) originLabel = 'self';
            } catch {
                /* keep absolute origin */
            }
        }
        return `http:${method.toUpperCase()}:${originLabel}${u.pathname}`;
    } catch {
        return `http:${method.toUpperCase()}:${url}`;
    }
}

export function isFailedLoadResourceConsoleMessage(text) {
    return String(text || '').includes('Failed to load resource');
}

export function baselineIdentityKey(entry) {
    return `${entry.page}\0${entry.check}\0${entry.selector}`;
}

export function compareToBaseline(allIssues, baselineIssues) {
    const baselineKeys = new Set(baselineIssues.map((e) => baselineIdentityKey(e)));
    const newIssues = [];
    for (const issue of allIssues) {
        if (!baselineKeys.has(baselineIdentityKey(issue))) {
            newIssues.push(issue);
        }
    }
    return newIssues;
}

export function globToRegExp(glob) {
    const GLOBSTAR = '\u0000GLOBSTAR\u0000';
    let s = glob.split('**').join(GLOBSTAR);
    s = s.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    s = s.replace(/\*/g, '[^/]*');
    s = s.split(GLOBSTAR).join('.*');
    return new RegExp(`^${s}$`, 'i');
}

export function runtimeMatchesUrlPattern(issue, pattern) {
    if (!issue.selector?.startsWith('http:')) return false;
    const target = issue.selector.split('?')[0];
    return globToRegExp(pattern).test(target);
}

export function shouldIgnoreRequestFailure(errorText) {
    return String(errorText || '').includes('ERR_ABORTED');
}
