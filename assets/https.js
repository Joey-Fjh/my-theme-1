(function () {
    'use strict';

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

    class ShopifyHttp {
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

            const basePath = String(baseURL || '/');
            const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
            const cleanUrl = String(url || '').startsWith('/') ? String(url).slice(1) : String(url);
            const rawUrl = `${origin}${normalizedBase}${cleanUrl}`;
            const finalUrl = new URL(rawUrl);

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
                const finalUrl = ShopifyHttp.buildURL(url, config.baseURL, config.params);
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

        static debugEnabled = !!window.__Theme__?.httpDebug;

        static debugWarn(message, ...args) {
            if (!this.debugEnabled) return;
            console.warn(`[SectionRefresher] ${message}`, ...args);
        }

        static withAlpineRefresh(target, updater) {
            if (!target || typeof updater !== 'function') return;

            const alpine = window.Alpine;

            if (typeof alpine?.destroyTree === 'function') {
                alpine.destroyTree(target);
            }

            const nextTarget = updater() || target;

            if (typeof alpine?.initTree === 'function' && nextTarget?.isConnected) {
                alpine.initTree(nextTarget);
            }
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
                const virtualSourceEl =
                    doc.querySelector(targetSelector) || doc.body.firstElementChild;

                if (!virtualSourceEl) {
                    this.debugWarn('Virtual source element not found', { key, targetSelector });
                    continue;
                }

                const innerSelectors = Array.isArray(config.innerSelectors)
                    ? config.innerSelectors
                    : [];

                if (innerSelectors.length > 0) {
                    for (const sel of innerSelectors) {
                        if (typeof sel !== 'string' || !sel.trim()) continue;
                        const newChild = virtualSourceEl.querySelector(sel);
                        const oldChild = targetEl.querySelector(sel);
                        if (newChild && oldChild) {
                            this.withAlpineRefresh(oldChild, () => {
                                const nextChild = newChild.cloneNode(true);
                                oldChild.replaceWith(nextChild);
                                return nextChild;
                            });
                        }
                    }
                } else {
                    this.withAlpineRefresh(targetEl, () => {
                        targetEl.innerHTML = virtualSourceEl.innerHTML;
                    });
                }

                window.__Theme__?.Components?.initAll?.(targetEl);
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

    const httpInstance = new ShopifyHttp({
        timeout: 10000,
    });

    httpInstance.addRequestInterceptor((config) => {
        // Reserved hook for request logging/loading state.
        return config;
    });

    httpInstance.addResponseInterceptor((response) => {
        // Reserved hook for global response handling.
        return response;
    });

    window.__Theme__ = window.__Theme__ || {};
    window.ShopifyHttp = httpInstance;
    window.ShopifyHttpError = HttpError;
    window.ShopifySectionRefresher = SectionRefresher;
})();
