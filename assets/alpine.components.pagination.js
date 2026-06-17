(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    ComponentGroups.pagination = {
        sectionPagination(sectionId = null, selectors = null) {
            return {
                ...(window.__Theme__?.AlpineComponentsFactory?.useDisposable?.() || {}),
                isLoading: false,
                sectionId: sectionId || null,
                /** @type {string[]|Object<string,string[]>} per-section map or shared array */
                selectors:
                    !Array.isArray(selectors) && selectors && typeof selectors === 'object'
                        ? selectors
                        : Array.isArray(selectors)
                          ? selectors
                          : selectors
                            ? [selectors]
                            : [],
                abortController: null,
                /** @type {Function|null} debounced wrapper, created in init */
                _debouncedFetch: null,

                _hydrateFromDataset() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;
                    if (!this.sectionId && ds.paginationSectionId) {
                        this.sectionId = ds.paginationSectionId;
                    }
                    if (this.selectors.length === 0 && ds.paginationSelectors) {
                        try {
                            const parsed = JSON.parse(ds.paginationSelectors);
                            if (Array.isArray(parsed)) this.selectors = parsed;
                        } catch (_) {}
                    }
                },

                init() {
                    this._hydrateFromDataset();
                    if (!this.sectionId) return;

                    if (!window.history.state || !window.history.state.path) {
                        window.history.replaceState(
                            { path: window.location.href },
                            '',
                            window.location.href,
                        );
                    }

                    const Utils = window.__Theme__?.Utils;
                    if (Utils) {
                        this._debouncedFetch = Utils.debounce(
                            (url) => this._executeFetch(url, true),
                            200,
                        );
                    }
                    if (this.on) {
                        this.on(window, 'popstate', this.handlePopState.bind(this));
                    }
                },

                buildDomMap() {
                    const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
                    const perSection =
                        !Array.isArray(this.selectors) &&
                        this.selectors &&
                        typeof this.selectors === 'object';
                    const map = {};
                    for (const id of ids) {
                        const config = {
                            targetSelector: `#shopify-section-${id}`,
                        };
                        const sels = perSection ? this.selectors[id] : this.selectors;
                        if (Array.isArray(sels) && sels.length > 0) {
                            config.innerSelectors = sels;
                        }
                        map[id] = config;
                    }
                    return map;
                },

                /**
                 * Core Fetch → Render → Push pipeline.
                 * Called via debounce wrapper (loadUrl) or directly (popstate).
                 * @param {string} url
                 * @param {boolean} updateHistory
                 */
                _executeFetch(url, updateHistory) {
                    const Http = window.ShopifyHttp;
                    const SectionRefresher = window.ShopifySectionRefresher;
                    if (!Http || !SectionRefresher) return;

                    if (this.abortController) this.abortController.abort();
                    this.abortController = new AbortController();
                    const activeController = this.abortController;

                    const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
                    const sep = url.includes('?') ? '&' : '?';
                    const fetchUrl =
                        url + sep + 'sections=' + ids.map(encodeURIComponent).join(',');

                    Http.getJSON(fetchUrl, {
                        signal: activeController.signal,
                    })
                        .then((data) => {
                            const sections = data?.sections ?? data;
                            if (!sections || typeof sections !== 'object') return;

                            SectionRefresher.render(sections, this.buildDomMap());

                            if (updateHistory) {
                                window.history.pushState({ path: url }, '', url);
                            }
                        })
                        .catch((err) => {
                            if (err?.isAbort || err?.name === 'AbortError') return;
                            if (updateHistory) window.location.href = url;
                        })
                        .finally(() => {
                            if (this.abortController === activeController) {
                                this.isLoading = false;
                                this.abortController = null;
                            }
                        });
                },

                /**
                 * Public entry point: show loading immediately, debounce 200ms before fetching.
                 * Accepts every call without blocking — debounce absorbs intermediate invocations.
                 */
                loadUrl(url) {
                    if (!url || !this.sectionId) return;
                    this.isLoading = true;
                    if (this._debouncedFetch) {
                        this._debouncedFetch(url);
                    } else {
                        this._executeFetch(url, true);
                    }
                },

                /**
                 * Browser back/forward: cancel pending debounce and fetch immediately.
                 * Fallback: uses current href when state is empty, ensuring the initial page is refreshed on return.
                 */
                handlePopState(event) {
                    const path = event.state?.path || window.location.href;
                    if (!path || !this.sectionId) return;
                    if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
                    this.isLoading = true;
                    this._executeFetch(path, false);
                },

                /**
                 * Compare current URL against a target href (pathname + query params).
                 * Trailing-slash insensitive, case insensitive, query-param order insensitive.
                 * @param {string} targetHref
                 * @returns {boolean}
                 */
                isUrlMatch(targetHref) {
                    const current = new URL(window.location.href);
                    const target = new URL(targetHref, window.location.origin);
                    const normalizePath = (p) => p.replace(/\/$/, '').toLowerCase();
                    if (normalizePath(current.pathname) !== normalizePath(target.pathname))
                        return false;
                    const sortParams = (sp) => new URLSearchParams([...sp].sort()).toString();
                    return sortParams(current.searchParams) === sortParams(target.searchParams);
                },

                destroy() {
                    if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
                    if (this.abortController) this.abortController.abort();
                    if (this.dispose) this.dispose();
                },
            };
        },
    };
})();
