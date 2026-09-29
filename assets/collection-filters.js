import { define, data } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';
import ShopifyHttp, { SectionRefresher } from 'https';
import {
    buildRelativeUrlFromParams,
    readCollectionFormParams,
    requestCollectionSectionHtml,
    resolveCollectionFilterActionUrl,
    resolveCollectionTabUrl,
    resolveFiltersDialogId,
    resolveFiltersFormId,
    syncCollectionControlPeers,
    syncCollectionControlsFromUrl,
} from './collection-filters-helpers.js';

function normalizeSelectors(selectors) {
    if (!Array.isArray(selectors) && selectors && typeof selectors === 'object') {
        return selectors;
    }
    if (Array.isArray(selectors)) return selectors;
    if (selectors) return [selectors];
    return [];
}

function createPaginationBehavior(sectionId = null, selectors = null) {
    return {
        ...useDisposable(),
        isLoading: false,
        sectionId: sectionId || null,
        selectors: normalizeSelectors(selectors),
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
                    /* invalid JSON */
                }
            }
        },

        _setupHistory() {
            if (!window.history.state || !window.history.state.path) {
                window.history.replaceState(
                    { path: window.location.href },
                    '',
                    window.location.href,
                );
            }
        },

        _setupDebounce() {
            this._debouncedFetch = Utils.debounce((url) => this._executeFetch(url, true), 200);
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

        loadUrl(url) {
            if (!url || !this.sectionId) return;
            this.isLoading = true;
            if (this._debouncedFetch) {
                this._debouncedFetch(url);
            } else {
                this._executeFetch(url, true);
            }
        },

        handlePopState(event) {
            const path = event.state?.path || window.location.href;
            if (!path || !this.sectionId) return;
            if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
            this._setupDebounce();
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

        destroyPagination() {
            if (this._debouncedFetch?.dispose) this._debouncedFetch.dispose();
            if (this.abortController) this.abortController.abort();
            this.dispose();
        },
    };
}

export function createCollectionFiltersState(sectionId = null, selectors = null) {
    const pagination = createPaginationBehavior(sectionId, selectors);

    return {
        ...pagination,
        formId: 'CollectionFiltersForm',
        dialogId: 'collection-filters',
        activeFilter: null,

        init() {
            pagination._hydrateFromDataset.call(this);
            const ds = this.$el?.dataset;
            if (ds?.filtersFormId) this.formId = ds.filtersFormId;
            if (ds?.filtersDialogId) this.dialogId = ds.filtersDialogId;

            if (!this.sectionId) return;

            this._setupHistory();
            this._setupDebounce();
            this.on(window, 'popstate', this.handlePopState.bind(this));
        },

        _buildUrl(params) {
            return buildRelativeUrlFromParams(window.location.pathname, params);
        },

        syncControlsFromUrl(url) {
            syncCollectionControlsFromUrl(url, resolveFiltersFormId(this));
        },

        _getFormParams() {
            return readCollectionFormParams(resolveFiltersFormId(this));
        },

        _executeFetch(url, updateHistory) {
            if (!ShopifyHttp || !SectionRefresher || !this.sectionId) return;

            if (this.abortController) this.abortController.abort();
            this.abortController = new AbortController();
            const activeController = this.abortController;

            requestCollectionSectionHtml(ShopifyHttp, url, this.sectionId, activeController.signal)
                .then((html) => {
                    if (typeof html !== 'string' || !html.trim()) return;

                    SectionRefresher.render(html, this.buildDomMap());

                    if (updateHistory) {
                        window.history.pushState({ path: url }, '', url);
                    }

                    this.syncControlsFromUrl(url);
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

        onChange(source) {
            const field = source?.target || source;
            syncCollectionControlPeers(field, resolveFiltersFormId(this));
            const params = this._getFormParams();
            params.delete('page');
            this.loadUrl(this._buildUrl(params));
        },

        buildCollectionTabUrl(targetHref) {
            return resolveCollectionTabUrl(targetHref, this._getFormParams());
        },

        buildFilterActionUrl(targetHref) {
            return resolveCollectionFilterActionUrl(targetHref, this._getFormParams());
        },

        loadFilterAction(event) {
            const link = event?.currentTarget;
            const href = link?.href;
            if (!href) return;
            event.preventDefault();
            this.loadUrl(this.buildFilterActionUrl(href));
        },

        onPaginate(event) {
            const link = event.target.closest('a');
            if (!link) return;
            event.preventDefault();
            const page = new URL(link.href).searchParams.get('page');
            const params = this._getFormParams();
            if (page) params.set('page', page);
            else params.delete('page');
            this.loadUrl(this._buildUrl(params));
        },

        closeHorizontalFilterOutside(event) {
            this.activeFilter = null;
            const details = event?.target?.closest?.('details');
            if (details) details.open = false;
        },

        toggleHorizontalFilterSummary(event) {
            event.preventDefault();
            const summary = event.currentTarget;
            const details = summary.parentElement;
            const shouldOpen = !details.open;
            this.activeFilter = shouldOpen ? summary.dataset.fieldIndex : null;
            this.$root.querySelectorAll('[data-filter-dropdown]').forEach((dropdown) => {
                dropdown.open = dropdown === details && shouldOpen;
            });
        },

        destroy() {
            this.destroyPagination();
        },
    };
}

define('collectionFilters', (sectionId = null, selectors = null) =>
    createCollectionFiltersState(sectionId, selectors),
);

define('collectionFilterField', ({ min = 0, max = 0, ceil = 0 } = {}) => ({
    min: Number(min) || 0,
    max: Number(max) || 0,
    ceil: Math.max(0, Number(ceil) || 0),

    _hydrateFromDataset() {
        const ds = this.$el?.dataset;
        if (!ds) return;
        if (ds.filterMin) this.min = Number(ds.filterMin) || 0;
        if (ds.filterMax) this.max = Number(ds.filterMax) || 0;
        if (ds.filterCeil) this.ceil = Math.max(0, Number(ds.filterCeil) || 0);
    },

    init() {
        this._hydrateFromDataset();
        if (this.ceil <= 0) {
            this.min = 0;
            this.max = 0;
            return;
        }
        this.min = Math.max(0, Math.min(this.min, this.ceil));
        this.max = Math.max(0, Math.min(this.max, this.ceil));
        if (this.min > this.max) this.max = this.min;
    },

    minPct() {
        return this.ceil ? (this.min / this.ceil) * 100 : 0;
    },

    maxPct() {
        return this.ceil ? 100 - (this.max / this.ceil) * 100 : 0;
    },

    clampMin() {
        this.min = Math.max(0, Math.min(Number(this.min) || 0, this.ceil));
        if (this.min > this.max) this.max = this.min;
    },

    clampMax() {
        this.max = Math.min(this.ceil, Math.max(Number(this.max) || 0, 0));
        if (this.max < this.min) this.min = this.max;
    },

    setMinFromInput(value) {
        if (value === '' || value === null || typeof value === 'undefined') {
            this.min = 0;
            this.clampMin();
            return;
        }

        this.min = Number(value) || 0;
        this.clampMin();
    },

    setMaxFromInput(value) {
        if (value === '' || value === null || typeof value === 'undefined') {
            this.max = this.ceil;
            this.clampMax();
            return;
        }

        this.max = Number(value) || 0;
        this.clampMax();
    },

    notifyFilterChange(field) {
        let el = this.$el?.parentElement;
        while (el) {
            const scope = data(el);
            if (scope?.onChange) {
                scope.onChange(field);
                return;
            }
            el = el.parentElement;
        }
    },

    onRangeMinCommit() {
        this.clampMin();
        const input = this.$refs.inputMin;
        if (!input) return;
        input.value = this.min;
        this.notifyFilterChange(input);
    },

    onRangeMaxCommit() {
        this.clampMax();
        const input = this.$refs.inputMax;
        if (!input) return;
        input.value = this.max;
        this.notifyFilterChange(input);
    },

    onNumberMinInput() {
        this.setMinFromInput(this.$refs.inputMin?.value);
        const input = this.$refs.inputMin;
        if (!input) return;
        input.value = this.min;
        this.notifyFilterChange(input);
    },

    onNumberMaxInput() {
        this.setMaxFromInput(this.$refs.inputMax?.value);
        const input = this.$refs.inputMax;
        if (!input) return;
        input.value = this.max;
        this.notifyFilterChange(input);
    },
}));

export { resolveFiltersDialogId, resolveFiltersFormId };
