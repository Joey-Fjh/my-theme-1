import { define, data } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';
import ShopifyHttp, { SectionRefresher } from 'https';

define('sectionPagination', () => ({
    ...useDisposable(),
    isLoading: false,
    sectionId: null,
    selectors: [],
    abortController: null,
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
            } catch (_) {
                /* ignore invalid JSON */
            }
        }
        if (ds.blogTabInitialIndex !== undefined && ds.blogTabInitialIndex !== '') {
            this._blogTabInitialIndex = Number(ds.blogTabInitialIndex);
        }
    },

    _blogTabInitialIndex: null,

    _tabControlEl() {
        return this.$el?.querySelector('[data-module-id="tab-control"]');
    },

    _tabScope() {
        return data(this._tabControlEl());
    },

    init() {
        this._hydrateFromDataset();
        if (!this.sectionId) return;

        if (!window.history.state || !window.history.state.path) {
            window.history.replaceState({ path: window.location.href }, '', window.location.href);
        }

        this._debouncedFetch = Utils.debounce((url) => this._executeFetch(url, true), 200);

        this.on(window, 'popstate', (event) => {
            this.handlePopState(event);
            this._syncBlogTabsFromUrl();
        });

        const tabControl = this._tabControlEl();
        if (tabControl) {
            this.on(tabControl, 'click', this._onTabControlClick.bind(this));
        }

        if (Number.isFinite(this._blogTabInitialIndex) && this._blogTabInitialIndex >= 0) {
            this.$nextTick(() => {
                const scope = this._tabScope();
                if (scope?.setActive) {
                    scope.setActive(this._blogTabInitialIndex);
                }
            });
        }
    },

    _onTabControlClick(event) {
        const tab = event.target.closest('[data-blog-pagination-tab]');
        if (!(tab instanceof HTMLAnchorElement)) return;
        event.preventDefault();
        this.onBlogTabClick(event);
    },

    buildDomMap() {
        const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
        const perSection =
            !Array.isArray(this.selectors) && this.selectors && typeof this.selectors === 'object';
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

    _executeFetch(url, updateHistory) {
        if (!ShopifyHttp || !SectionRefresher) return;

        if (this.abortController) this.abortController.abort();
        this.abortController = new AbortController();
        const activeController = this.abortController;

        const ids = Array.isArray(this.sectionId) ? this.sectionId : [this.sectionId];
        const sep = url.includes('?') ? '&' : '?';
        const fetchUrl = url + sep + 'sections=' + ids.map(encodeURIComponent).join(',');

        ShopifyHttp.getJSON(fetchUrl, {
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

    loadUrl(url) {
        if (!url || !this.sectionId) return;
        this.isLoading = true;
        if (this._debouncedFetch) {
            this._debouncedFetch(url);
        } else {
            this._executeFetch(url, true);
        }
    },

    onNavClick(event) {
        const link = event.target.closest('[data-pagination-nav] a');
        if (!link) return;
        event.preventDefault();
        this.loadUrl(link.href);
    },

    onBlogTabClick(event) {
        const link =
            event.currentTarget instanceof HTMLAnchorElement
                ? event.currentTarget
                : event.target.closest('[data-blog-pagination-tab]');
        if (!(link instanceof HTMLAnchorElement)) return;
        event.preventDefault();
        this.loadUrl(link.href);
        const scope = this._tabScope();
        if (scope?.setActive) {
            scope.setActive(scope.tabIndexFor(link));
        }
    },

    _syncBlogTabsFromUrl() {
        const scope = this._tabScope();
        if (!scope) return;
        this.$el.querySelectorAll('a[role="tab"]').forEach((tab) => {
            if (tab instanceof HTMLAnchorElement && this.isUrlMatch(tab.href)) {
                scope.setActive(scope.tabIndexFor(tab));
            }
        });
    },

    handlePopState(event) {
        const path = event.state?.path || window.location.href;
        if (!path || !this.sectionId) return;
        if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
        this.isLoading = true;
        this._executeFetch(path, false);
    },

    isUrlMatch(targetHref) {
        const current = new URL(window.location.href);
        const target = new URL(targetHref, window.location.origin);
        const normalizePath = (p) => p.replace(/\/$/, '').toLowerCase();
        if (normalizePath(current.pathname) !== normalizePath(target.pathname)) return false;
        const sortParams = (sp) => new URLSearchParams([...sp].sort()).toString();
        return sortParams(current.searchParams) === sortParams(target.searchParams);
    },

    destroy() {
        if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
        if (this.abortController) this.abortController.abort();
        this.dispose();
    },
}));
