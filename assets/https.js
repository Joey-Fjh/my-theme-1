import { mount, unmount } from 'alpine-adapter';
import { scanModules } from 'base';

class HttpError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'HttpError';
        this.status = options.status ?? null;
        this.url = options.url ?? null;
        this.data = options.data ?? null;
        this.response = options.response ?? null;
        this.isTimeout = !!options.isTimeout;
        this.isAbort = !!options.isAbort;
        this.isNetworkError = !!options.isNetworkError;
        if (options.cause) this.cause = options.cause;
    }
}

class Http {
    constructor(config = {}) {
        this.defaults = {
            baseURL: config.baseURL ?? window.Shopify?.routes?.root ?? '/',
            timeout: config.timeout ?? 8000,
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(config.headers || {}),
            },
        };

        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    addRequestInterceptor(fn) {
        if (typeof fn === 'function') this.requestInterceptors.push(fn);
    }

    addResponseInterceptor(fn) {
        if (typeof fn === 'function') this.responseInterceptors.push(fn);
    }

    static _appendParams(searchParams, value, keyPrefix) {
        if (value == null) return;

        if (Array.isArray(value)) {
            value.forEach((item) => this._appendParams(searchParams, item, keyPrefix));
            return;
        }

        if (typeof value === 'object') {
            Object.keys(value).forEach((key) => {
                const nextPrefix = keyPrefix ? `${keyPrefix}[${key}]` : key;
                this._appendParams(searchParams, value[key], nextPrefix);
            });
            return;
        }

        searchParams.append(keyPrefix, String(value));
    }

    static buildURL(url, baseURL, params) {
        const origin = window.location.origin;
        const isAbsolute = /^https?:\/\//i.test(url);

        if (isAbsolute) {
            const finalAbsoluteUrl = new URL(url);
            if (params && typeof params === 'object') {
                Object.keys(params).forEach((key) => {
                    this._appendParams(finalAbsoluteUrl.searchParams, params[key], key);
                });
            }
            return finalAbsoluteUrl.toString();
        }

        const base = new URL(String(baseURL || '/'), origin);
        const normalizedBasePath = base.pathname.endsWith('/')
            ? base.pathname
            : `${base.pathname}/`;
        const relativeUrl = new URL(String(url || ''), origin);
        const baseRootPath = normalizedBasePath.slice(0, -1);
        const isAlreadyRootedAtBase =
            normalizedBasePath !== '/' &&
            (relativeUrl.pathname === baseRootPath ||
                relativeUrl.pathname.startsWith(normalizedBasePath));
        const finalPath = isAlreadyRootedAtBase
            ? relativeUrl.pathname
            : `${normalizedBasePath}${relativeUrl.pathname.replace(/^\//, '')}`;
        const finalUrl = new URL(`${finalPath}${relativeUrl.search}${relativeUrl.hash}`, origin);

        if (params && typeof params === 'object') {
            Object.keys(params).forEach((key) => {
                this._appendParams(finalUrl.searchParams, params[key], key);
            });
        }

        return finalUrl.toString();
    }

    async request(url, options = {}) {
        let config = {
            ...this.defaults,
            ...options,
            headers: {
                ...this.defaults.headers,
                ...(options.headers || {}),
            },
        };

        for (const interceptor of this.requestInterceptors) {
            const nextConfig = await interceptor(config);
            if (nextConfig) config = nextConfig;
        }

        const timeout = config.timeout;
        const ctrl = new AbortController();
        let didTimeout = false;
        const tid = setTimeout(() => {
            didTimeout = true;
            ctrl.abort();
        }, timeout);
        const externalSignal = config.signal;

        const onAbort = () => {
            clearTimeout(tid);
            ctrl.abort();
        };

        if (externalSignal) {
            if (externalSignal.aborted) {
                clearTimeout(tid);
                throw new HttpError('Aborted', { isAbort: true, url });
            }
            externalSignal.addEventListener('abort', onAbort, { once: true });
        }

        let response;
        try {
            const finalUrl = Http.buildURL(url, config.baseURL, config.params);
            const { params, baseURL, timeout: _timeout, ...fetchConfig } = config;

            void params;
            void baseURL;
            void _timeout;

            response = await fetch(finalUrl, {
                ...fetchConfig,
                signal: ctrl.signal,
            });
        } catch (error) {
            if (error?.name === 'AbortError') {
                const isTimeout = didTimeout;
                throw new HttpError(isTimeout ? 'Request Timeout' : 'Request Aborted', {
                    isTimeout,
                    isAbort: !isTimeout,
                    url,
                });
            }
            throw new HttpError(error?.message || 'Network Error', {
                cause: error,
                url,
                isNetworkError: true,
            });
        } finally {
            clearTimeout(tid);
            if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
        }

        for (const interceptor of this.responseInterceptors) {
            const nextResponse = await interceptor(response);
            if (nextResponse) response = nextResponse;
        }

        if (!response.ok) {
            let errorData = null;
            try {
                errorData = await response.clone().json();
            } catch (_) {
                errorData = null;
            }
            throw new HttpError(`HTTP Error ${response.status}`, {
                status: response.status,
                data: errorData,
                url: response.url || url,
                response,
            });
        }

        return response;
    }

    async getJSON(url, options = {}) {
        const res = await this.request(url, {
            ...options,
            method: options.method || 'GET',
        });
        return res.json();
    }

    async postJSON(url, body, options = {}) {
        const res = await this.request(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            body: JSON.stringify(body),
        });
        return res.json();
    }
}

class SectionRefresher {
    static domParser = new DOMParser();

    static debugEnabled =
        typeof window !== 'undefined' &&
        (window.location.search.includes('httpDebug=true') ||
            window.location.search.includes('debug=true'));

    static debugWarn(message, ...args) {
        if (!this.debugEnabled) return;
        console.warn(`[SectionRefresher] ${message}`, ...args);
    }

    /**
     * Carry <style data-section-stylesheet> from the parsed response into the live target.
     * Covered by section-stylesheet-carry.test.js, which extracts and tests this method directly.
     */
    static carryInnerSectionStylesheet(doc, targetEl) {
        const sectionStyle = doc.querySelector('style[data-section-stylesheet]');
        if (!sectionStyle) return;

        const existingStyle = targetEl.querySelector('style[data-section-stylesheet]');
        const nextStyle = sectionStyle.cloneNode(true);

        if (existingStyle) {
            existingStyle.replaceWith(nextStyle);
            return;
        }

        targetEl.insertBefore(nextStyle, targetEl.firstChild);
    }

    /**
     * Describe a focused element so its replacement can be found after a swap. The descriptor
     * also keeps the element itself (`origin`, to tell a swap from a user move) and the dialog
     * it sits in (`scopeSelector`, so focus never leaves an open dialog).
     */
    static descriptorFromElement(el) {
        if (!el || el === document.body) return null;

        let descriptor = null;
        if (el.id) {
            descriptor = { kind: 'id', value: el.id };
        } else if (el.getAttribute('data-focus-key')) {
            descriptor = { kind: 'focusKey', value: el.getAttribute('data-focus-key') };
        } else if (el.getAttribute('name') || el.name) {
            descriptor = {
                kind: 'nameValue',
                name: String(el.getAttribute('name') || el.name),
                value: el.value != null ? String(el.value) : '',
            };
        }
        if (!descriptor) return null;

        descriptor.origin = el;
        const dialogId = el.closest?.('[data-dialog-root][data-dialog-id]')?.dataset.dialogId;
        descriptor.scopeSelector = dialogId
            ? `[data-dialog-root][data-dialog-id="${CSS.escape(dialogId)}"]`
            : '';
        return descriptor;
    }

    static captureFocusDescriptor(container) {
        if (!container) return null;

        const active = document.activeElement;
        if (!active || active === document.body || !container.contains(active)) return null;

        return this.descriptorFromElement(active);
    }

    /**
     * True when the user moved focus somewhere else while a request was in flight: focus sits
     * on a live element that is neither the captured one nor inside the region being swapped.
     * Focus on `body` means the swap removed the focused element, which is ours to restore.
     */
    static isFocusElsewhere(origin, region = null) {
        const active = document.activeElement;
        if (!active || active === document.body || !active.isConnected) return false;
        if (origin && active === origin) return false;
        if (region && region.contains(active)) return false;
        return true;
    }

    static _focusScope(descriptor) {
        if (!descriptor?.scopeSelector) return null;
        return document.querySelector(descriptor.scopeSelector);
    }

    static findFocusTarget(container, descriptor, options = {}) {
        if (!container || !descriptor) return null;
        const allowGlobal = options.allowGlobal !== false;
        // Inside a dialog, "global" means the dialog, never the page behind it.
        const scope = this._focusScope(descriptor);
        const wide = scope || document;
        const within = (el) => (el && (!scope || scope.contains(el)) ? el : null);

        if (descriptor.kind === 'id') {
            const byId = within(document.getElementById(descriptor.value));
            if (!byId) return null;
            if (container.contains(byId)) return byId;
            return allowGlobal ? byId : null;
        }

        if (descriptor.kind === 'focusKey') {
            const selector = `[data-focus-key="${CSS.escape(descriptor.value)}"]`;
            const inContainer = within(container.querySelector(selector));
            if (inContainer) return inContainer;
            if (!allowGlobal) return null;
            return wide.querySelector(selector);
        }

        if (descriptor.kind === 'nameValue') {
            const name = `[name="${CSS.escape(descriptor.name)}"]`;
            let match = null;
            if (descriptor.value !== '') {
                match = within(
                    container.querySelector(`${name}[value="${CSS.escape(descriptor.value)}"]`),
                );
            }
            return match || within(container.querySelector(name));
        }

        return null;
    }

    static restoreFocus(container, descriptor, config = {}, options = {}) {
        if (!container || !descriptor) return false;
        if (this.isFocusElsewhere(descriptor.origin, container)) return false;

        const allowFallback = options.allowFallback !== false;

        const match = this.findFocusTarget(container, descriptor, { allowGlobal: true });
        if (match && typeof match.focus === 'function') {
            match.focus({ preventScroll: true });
            if (document.activeElement === match) return true;
        }

        if (!allowFallback) return false;

        const scope = this._focusScope(descriptor);
        const fallback =
            typeof config.focusFallback === 'string' && config.focusFallback.trim()
                ? config.focusFallback.trim()
                : '';
        let fallbackEl = null;
        if (fallback) {
            fallbackEl = scope
                ? scope.querySelector(fallback)
                : container.querySelector(fallback) || document.querySelector(fallback);
        }
        // An open dialog keeps focus even when none of the named fallbacks is inside it.
        if (!fallbackEl && scope) {
            fallbackEl = scope.querySelector('button:not([disabled]), a[href], [tabindex="-1"]');
        }
        if (fallbackEl && typeof fallbackEl.focus === 'function') {
            fallbackEl.focus({ preventScroll: true });
            return document.activeElement === fallbackEl;
        }

        return false;
    }

    /**
     * Replace a region through the adapter lifecycle: tear the old tree down, swap the
     * markup, start downloading the modules the new markup declares, then initialize it.
     * Component roots whose modules are still loading are held by the runtime's init
     * interceptor and mount when their module arrives.
     */
    static replaceRegion(target, updater, config = {}) {
        if (!target || typeof updater !== 'function') return;

        const localDescriptor = this.captureFocusDescriptor(target);
        let retainedDescriptor = config.focusDescriptor || null;
        // A descriptor captured when the request started is dropped once the user has moved on.
        if (!localDescriptor && retainedDescriptor) {
            if (this.isFocusElsewhere(retainedDescriptor.origin, target)) retainedDescriptor = null;
        }
        const focusDescriptor = localDescriptor || retainedDescriptor || null;

        unmount(target);

        const nextTarget = updater() || target;

        if (!nextTarget?.isConnected) return;

        scanModules(nextTarget);
        mount(nextTarget);
        if (!focusDescriptor) return;

        const canRestoreHere = Boolean(
            localDescriptor ||
            (retainedDescriptor &&
                this.findFocusTarget(nextTarget, retainedDescriptor, { allowGlobal: true })),
        );
        if (!canRestoreHere) return;

        // Controls that disable themselves while a request runs (cart quantity) come back
        // disabled; wait up to about 30 frames for them before falling back.
        const restore = (frame = 0) => {
            const match = this.findFocusTarget(nextTarget, focusDescriptor, { allowGlobal: true });
            if (match?.disabled && frame < 30) {
                requestAnimationFrame(() => restore(frame + 1));
                return;
            }
            this.restoreFocus(nextTarget, focusDescriptor, config, {
                allowFallback: Boolean(localDescriptor || retainedDescriptor),
            });
        };
        requestAnimationFrame(() => requestAnimationFrame(() => restore()));
    }

    static render(data, domMap = {}) {
        if (!data) return;
        if (!domMap || typeof domMap !== 'object') domMap = {};

        let htmlMap;
        if (typeof data === 'string') {
            const sectionKey = Object.keys(domMap)[0];
            if (!sectionKey) return;
            htmlMap = { [sectionKey]: data };
        } else if (typeof data === 'object') {
            htmlMap = data;
        } else {
            return;
        }

        for (const key of Object.keys(htmlMap)) {
            const html = htmlMap[key];
            if (html == null || typeof html !== 'string') continue;

            const config = domMap[key] || {};
            const targetSelector =
                typeof config.targetSelector === 'string' && config.targetSelector.trim()
                    ? config.targetSelector.trim()
                    : `#shopify-section-${key}`;

            const targetEl = document.querySelector(targetSelector);
            if (!targetEl) {
                this.debugWarn('Target element not found', { key, targetSelector });
                continue;
            }

            const doc = this.domParser.parseFromString(html, 'text/html');
            const virtualSourceEl = doc.querySelector(targetSelector) || doc.body.firstElementChild;

            if (!virtualSourceEl) {
                this.debugWarn('Virtual source element not found', { key, targetSelector });
                continue;
            }

            const innerSelectors = Array.isArray(config.innerSelectors)
                ? config.innerSelectors
                : [];

            if (innerSelectors.length > 0) {
                this.carryInnerSectionStylesheet(doc, targetEl);

                for (const sel of innerSelectors) {
                    if (typeof sel !== 'string' || !sel.trim()) continue;
                    const newChild = virtualSourceEl.querySelector(sel);
                    const oldChild = targetEl.querySelector(sel);
                    if (newChild && oldChild) {
                        this.replaceRegion(
                            oldChild,
                            () => {
                                const nextChild = newChild.cloneNode(true);
                                oldChild.replaceWith(nextChild);
                                return nextChild;
                            },
                            config,
                        );
                    }
                }
            } else {
                this.replaceRegion(
                    targetEl,
                    () => {
                        targetEl.innerHTML = virtualSourceEl.innerHTML;
                        return targetEl;
                    },
                    config,
                );
            }
        }
    }

    static updateText(updates = []) {
        if (!Array.isArray(updates)) return;
        for (const item of updates) {
            if (!item || typeof item.selector !== 'string' || !item.selector.trim()) continue;
            const text = item.text != null ? String(item.text) : '';
            document.querySelectorAll(item.selector).forEach((el) => {
                el.textContent = text;
            });
        }
    }
}

const ShopifyHttp = new Http({
    timeout: 10000,
});

ShopifyHttp.addRequestInterceptor((config) => {
    // Reserved hook for request logging/loading state.
    return config;
});

ShopifyHttp.addResponseInterceptor((response) => {
    // Reserved hook for global response handling.
    return response;
});

export { ShopifyHttp, HttpError, SectionRefresher };
export default ShopifyHttp;
