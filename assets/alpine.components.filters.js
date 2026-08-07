(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    const COLLECTION_FILTERS_FORM_ID = 'CollectionFiltersForm';
    const COLLECTION_FILTERS_DIALOG_ID = 'collection-filters';

    function buildRelativeUrlFromParams(pathname, params) {
        const qs = params.toString();
        return qs ? `${pathname}?${qs}` : pathname;
    }

    function buildAbsoluteUrlFromParams(pathname, params) {
        return buildRelativeUrlFromParams(pathname, params);
    }

    function resolveFiltersFormId(instance) {
        return instance?.formId || COLLECTION_FILTERS_FORM_ID;
    }

    function resolveFiltersDialogId(instance) {
        return instance?.dialogId || COLLECTION_FILTERS_DIALOG_ID;
    }

    function getCollectionFilterControls(formId = COLLECTION_FILTERS_FORM_ID) {
        const form = document.getElementById(formId);
        if (!form) return [];

        const controls = [
            ...Array.from(form.elements || []),
            ...Array.from(document.querySelectorAll(`[form="${formId}"]`)),
        ];

        return controls.filter((field, index) => controls.indexOf(field) === index);
    }

    function syncCollectionPriceComponentState(fieldName, nextValue, field) {
        if (!fieldName.endsWith('.gte') && !fieldName.endsWith('.lte')) return;

        const componentRoot = field.closest('[x-data*="collectionFilterField"]');
        const componentData = componentRoot ? window.Alpine?.$data?.(componentRoot) : null;

        if (!componentData) return;

        if (fieldName.endsWith('.gte')) {
            componentData.setMinFromInput?.(nextValue);
            return;
        }

        componentData.setMaxFromInput?.(nextValue);
    }

    function syncCollectionControlsFromUrl(url, formId = COLLECTION_FILTERS_FORM_ID) {
        const targetUrl = new URL(url, window.location.origin);
        const searchParams = targetUrl.searchParams;
        const controls = Array.from(document.querySelectorAll(`[form="${formId}"]`));

        controls.forEach((field) => {
            if (!field?.name) return;

            const values = searchParams.getAll(field.name);

            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = values.includes(field.value);
                return;
            }

            if (field.tagName === 'SELECT' && field.multiple) {
                Array.from(field.options || []).forEach((option) => {
                    option.selected = values.includes(option.value);
                });
                return;
            }

            const nextValue = values.length > 0 ? values[values.length - 1] : '';
            field.value = nextValue;
            syncCollectionPriceComponentState(field.name, nextValue, field);
        });
    }

    function normalizeCollectionSingleValueField(field) {
        const fieldName = field?.name || '';
        const rawValue = typeof field?.value === 'string' ? field.value.trim() : field?.value;

        if (fieldName === 'sort_by') {
            return rawValue || null;
        }

        if (fieldName.endsWith('.gte')) {
            const nextValue = Number(rawValue);
            if (!rawValue || !Number.isFinite(nextValue) || nextValue <= 0) {
                return null;
            }
            return String(nextValue);
        }

        if (fieldName.endsWith('.lte')) {
            const nextValue = Number(rawValue);
            const maxValue = Number(field.getAttribute('max') || field.max);

            if (!rawValue || !Number.isFinite(nextValue)) {
                return null;
            }

            if (Number.isFinite(maxValue) && nextValue >= maxValue) {
                return null;
            }

            return String(nextValue);
        }

        return rawValue ?? null;
    }

    function readCollectionFormParams(formId = COLLECTION_FILTERS_FORM_ID) {
        const form = document.getElementById(formId);
        if (!form) {
            return new URLSearchParams(window.location.search);
        }

        const params = new URLSearchParams();
        const controls = getCollectionFilterControls(formId);
        const isSingleValueField = (fieldName) =>
            fieldName === 'sort_by' || fieldName.endsWith('.gte') || fieldName.endsWith('.lte');

        controls.forEach((field) => {
            if (
                !field ||
                !field.name ||
                field.disabled ||
                field.type === 'submit' ||
                field.type === 'button' ||
                field.type === 'reset' ||
                field.type === 'file'
            ) {
                return;
            }

            if ((field.type === 'checkbox' || field.type === 'radio') && !field.checked) {
                return;
            }

            if (field.tagName === 'SELECT' && field.multiple) {
                Array.from(field.selectedOptions || []).forEach((option) => {
                    params.append(field.name, option.value);
                });
                return;
            }

            if (isSingleValueField(field.name)) {
                const normalizedValue = normalizeCollectionSingleValueField(field);
                if (normalizedValue === null) return;
                params.set(field.name, normalizedValue);
                return;
            }

            params.append(field.name, field.value);
        });

        return params;
    }

    function resolveCollectionTabUrl(targetHref, currentParams) {
        if (!targetHref) return '';

        const targetUrl = new URL(targetHref, window.location.origin);
        const nextParams = new URLSearchParams();
        const sortBy = currentParams.get('sort_by');

        if (sortBy) {
            nextParams.set('sort_by', sortBy);
        }

        return buildAbsoluteUrlFromParams(targetUrl.pathname, nextParams);
    }

    function resolveCollectionFilterActionUrl(targetHref, currentParams) {
        if (!targetHref) return window.location.pathname;

        const targetUrl = new URL(targetHref, window.location.origin);
        const nextParams = new URLSearchParams(targetUrl.search);
        const sortBy = currentParams.get('sort_by');

        if (sortBy && !nextParams.has('sort_by')) {
            nextParams.set('sort_by', sortBy);
        }

        nextParams.delete('page');

        return buildAbsoluteUrlFromParams(targetUrl.pathname, nextParams);
    }

    const SEARCH_CONTEXT_PARAM_KEYS = ['q', 'type', 'options[prefix]'];

    function resolveSearchFilterActionUrl(targetHref, currentParams) {
        const resolved = resolveCollectionFilterActionUrl(targetHref, currentParams);
        const targetUrl = new URL(resolved, window.location.origin);
        const nextParams = new URLSearchParams(targetUrl.search);

        SEARCH_CONTEXT_PARAM_KEYS.forEach((key) => {
            const value = currentParams.get(key);
            if (value && !nextParams.has(key)) {
                nextParams.set(key, value);
            }
        });

        nextParams.delete('page');

        return buildAbsoluteUrlFromParams(targetUrl.pathname, nextParams);
    }

    function requestCollectionSectionHtml(Http, url, sectionId, signal) {
        const sep = url.includes('?') ? '&' : '?';
        const fetchUrl = `${url}${sep}section_id=${encodeURIComponent(sectionId)}`;

        return Http.request(fetchUrl, {
            method: 'GET',
            headers: {
                Accept: 'text/html',
            },
            signal,
        }).then((response) => response.text());
    }

    ComponentGroups.filters = {
        collectionFilters(sectionId = null, selectors = null) {
            return {
                ...ComponentGroups.pagination.sectionPagination(sectionId, selectors),
                formId: COLLECTION_FILTERS_FORM_ID,
                dialogId: COLLECTION_FILTERS_DIALOG_ID,

                init() {
                    const baseInit = ComponentGroups.pagination.sectionPagination().init;
                    if (typeof baseInit === 'function') {
                        baseInit.call(this);
                    }
                    const ds = this.$el?.dataset;
                    if (ds?.filtersFormId) this.formId = ds.filtersFormId;
                    if (ds?.filtersDialogId) this.dialogId = ds.filtersDialogId;
                },

                _executeFetch(url, updateHistory) {
                    const Http = window.ShopifyHttp;
                    const SectionRefresher = window.ShopifySectionRefresher;
                    if (!Http || !SectionRefresher || !this.sectionId) return;

                    if (this.abortController) this.abortController.abort();
                    this.abortController = new AbortController();
                    const activeController = this.abortController;

                    requestCollectionSectionHtml(Http, url, this.sectionId, activeController.signal)
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

                _buildUrl(params) {
                    return buildRelativeUrlFromParams(window.location.pathname, params);
                },

                syncControlsFromUrl(url) {
                    syncCollectionControlsFromUrl(url, resolveFiltersFormId(this));
                },

                _getFormParams() {
                    return readCollectionFormParams(resolveFiltersFormId(this));
                },

                onChange() {
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

                onPaginate(e) {
                    const link = e.target.closest('a');
                    if (!link) return;
                    e.preventDefault();
                    const page = new URL(link.href).searchParams.get('page');
                    const params = this._getFormParams();
                    if (page) params.set('page', page);
                    else params.delete('page');
                    this.loadUrl(this._buildUrl(params));
                },
            };
        },

        /**
         * Search product facets adapter.
         * Reuses collectionFilters fetch/refresh/abort behavior, but:
         * - preserves q / type / options[prefix] on facet remove and clear-all URLs
         * - uses a narrower SectionRefresher boundary while the product drawer stays open
         * - tracks renderedResultType for accurate popstate type-change detection
         * - reconciles dialog focus via public dialog store APIs / force-closes on type switches
         */
        searchFilters(sectionId = null, selectors = null) {
            const PRODUCT_REFRESH_SELECTORS = [
                '[data-search-results-content]',
                '[data-search-drawer-body]',
            ];
            const TYPE_CHANGE_SELECTORS = [
                '[data-search-type-shell]',
                '[data-search-drawer-shell]',
            ];

            const base = ComponentGroups.filters.collectionFilters(sectionId, selectors);

            return {
                ...base,

                /** DOM-rendered result type; not derived from window.location during popstate. */
                renderedResultType: 'product',

                init() {
                    const ds = this.$el?.dataset;
                    const initial = (ds?.searchResultType || 'product').toLowerCase();
                    this.renderedResultType =
                        initial === 'article' || initial === 'page' || initial === 'product'
                            ? initial
                            : 'product';

                    if (typeof base.init === 'function') {
                        base.init.call(this);
                    }
                },

                buildFilterActionUrl(targetHref) {
                    return resolveSearchFilterActionUrl(targetHref, this._getFormParams());
                },

                _getFormParams() {
                    const params = base._getFormParams.call(this);
                    try {
                        const currentSort = new URL(
                            window.location.href,
                            window.location.origin,
                        ).searchParams.get('sort_by');
                        if (currentSort && !params.has('sort_by')) {
                            params.set('sort_by', currentSort);
                        }
                    } catch (_) {
                        /* ignore */
                    }
                    return params;
                },

                _getSearchResultType(url) {
                    try {
                        const parsed = new URL(url, window.location.origin);
                        const type = (parsed.searchParams.get('type') || 'product').toLowerCase();
                        if (type === 'article' || type === 'page' || type === 'product')
                            return type;
                    } catch (_) {
                        /* ignore */
                    }
                    return 'product';
                },

                _getSearchDialogStore() {
                    return window.Alpine?.store?.('dialog') || null;
                },

                _isSearchFilterDialogOpen() {
                    const dialog = this._getSearchDialogStore();
                    return Boolean(dialog?.isOpen?.(resolveFiltersDialogId(this)));
                },

                _hasSearchFilterDialogLifecycle() {
                    const dialog = this._getSearchDialogStore();
                    const dialogId = resolveFiltersDialogId(this);
                    return Boolean(dialog?.isOpen?.(dialogId) || dialog?.isClosing?.(dialogId));
                },

                _getSearchFilterTrigger() {
                    return this.$el?.querySelector?.('[data-search-filter-trigger]') || null;
                },

                _getSearchDialogPanel() {
                    const dialogId = resolveFiltersDialogId(this);
                    return document.querySelector(
                        `[data-dialog-root][data-dialog-id="${dialogId}"] [data-dialog-panel]`,
                    );
                },

                _captureDrawerFocusIntent() {
                    const active = document.activeElement;
                    if (!active || active === document.body) return { kind: 'panel' };

                    const panel = this._getSearchDialogPanel();
                    if (!panel || !panel.contains(active)) return { kind: 'panel' };

                    const name = active.getAttribute?.('name') || active.name;
                    if (!name) return { kind: 'panel' };

                    return {
                        kind: 'control',
                        name,
                        value: active.value || '',
                    };
                },

                _findDrawerFocusTarget(intent) {
                    const panel = this._getSearchDialogPanel();
                    if (!panel) return null;

                    if (intent?.kind === 'control' && intent.name) {
                        let match = null;
                        if (intent.value !== '') {
                            match = panel.querySelector(
                                `[name="${CSS.escape(intent.name)}"][value="${CSS.escape(intent.value)}"]`,
                            );
                        }
                        if (!match) {
                            match = panel.querySelector(`[name="${CSS.escape(intent.name)}"]`);
                        }
                        if (match && panel.contains(match)) return match;
                    }

                    return null;
                },

                _forceCloseSearchFilterDialog() {
                    const dialog = this._getSearchDialogStore();
                    dialog?.forceClose?.(resolveFiltersDialogId(this));
                },

                _parkFocusBeforeTypeChange() {
                    const trigger = this._getSearchFilterTrigger();
                    if (trigger?.isConnected && typeof trigger.focus === 'function') {
                        trigger.focus({ preventScroll: true });
                        return;
                    }

                    const tab =
                        this.$el?.querySelector?.('[role="tab"][aria-selected="true"]') ||
                        this.$el?.querySelector?.('[role="tab"].is-active');
                    if (tab?.isConnected && typeof tab.focus === 'function') {
                        tab.focus({ preventScroll: true });
                    }
                },

                _announceSearchResults() {
                    const live = this.$el?.querySelector?.('[data-search-results-live]');
                    const source = this.$el?.querySelector?.('[data-search-results-status]');
                    if (!live || !source) return;

                    const nextText = (source.textContent || '').trim();
                    if (!nextText) return;

                    if (live.textContent === nextText) {
                        live.textContent = '';
                    }
                    requestAnimationFrame(() => {
                        live.textContent = nextText;
                    });
                },

                _focusActiveSearchTab() {
                    const focusTab = () => {
                        const tab =
                            this.$el?.querySelector?.('[role="tab"][aria-selected="true"]') ||
                            this.$el?.querySelector?.('[role="tab"].is-active');
                        if (tab && typeof tab.focus === 'function' && tab.isConnected) {
                            tab.focus({ preventScroll: true });
                            return true;
                        }
                        return false;
                    };

                    requestAnimationFrame(() => {
                        if (focusTab()) return;
                        requestAnimationFrame(focusTab);
                    });
                },

                _reconcileSearchFilterDialog({
                    nextType,
                    dialogWasOpen,
                    focusIntent,
                    closedDialogForTypeChange,
                }) {
                    if (nextType !== 'product') {
                        this._forceCloseSearchFilterDialog();
                        if (closedDialogForTypeChange) {
                            this._focusActiveSearchTab();
                        }
                        return;
                    }

                    if (!dialogWasOpen) return;

                    const dialog = this._getSearchDialogStore();
                    const dialogId = resolveFiltersDialogId(this);
                    // User started closing (or closed) while the request was in flight — do not revive.
                    if (!dialog?.isOpen?.(dialogId)) return;

                    const trigger = this._getSearchFilterTrigger();
                    const focusElement = this._findDrawerFocusTarget(focusIntent);

                    dialog.refreshOpenContent(dialogId, {
                        returnFocusTo: trigger,
                        focusElement,
                    });
                },

                _executeFetch(url, updateHistory) {
                    const Http = window.ShopifyHttp;
                    const SectionRefresher = window.ShopifySectionRefresher;
                    if (!Http || !SectionRefresher || !this.sectionId) return;

                    if (this.abortController) this.abortController.abort();
                    this.abortController = new AbortController();
                    const activeController = this.abortController;

                    const prevType = this.renderedResultType || 'product';
                    const nextType = this._getSearchResultType(url);
                    const typeChanged = prevType !== nextType;
                    const dialogWasOpen = this._isSearchFilterDialogOpen();
                    const dialogLifecycle = this._hasSearchFilterDialogLifecycle();
                    const focusIntent = dialogWasOpen ? this._captureDrawerFocusIntent() : null;
                    let closedDialogForTypeChange = false;

                    if (dialogLifecycle && nextType !== 'product') {
                        this._forceCloseSearchFilterDialog();
                        closedDialogForTypeChange = true;
                        this._parkFocusBeforeTypeChange();
                    }

                    const previousSelectors = this.selectors;
                    this.selectors =
                        !typeChanged && nextType === 'product'
                            ? PRODUCT_REFRESH_SELECTORS
                            : TYPE_CHANGE_SELECTORS;

                    requestCollectionSectionHtml(Http, url, this.sectionId, activeController.signal)
                        .then((html) => {
                            if (typeof html !== 'string' || !html.trim()) return;
                            if (this.abortController !== activeController) return;

                            SectionRefresher.render(html, this.buildDomMap());
                            this.renderedResultType = nextType;

                            if (updateHistory) {
                                window.history.pushState({ path: url }, '', url);
                            }

                            this.syncControlsFromUrl(url);
                            this._announceSearchResults();
                            this._reconcileSearchFilterDialog({
                                nextType,
                                dialogWasOpen,
                                focusIntent,
                                closedDialogForTypeChange,
                            });
                        })
                        .catch((err) => {
                            if (err?.isAbort || err?.name === 'AbortError') return;
                            if (updateHistory) window.location.href = url;
                        })
                        .finally(() => {
                            if (this.abortController === activeController) {
                                this.selectors = previousSelectors;
                                this.isLoading = false;
                                this.abortController = null;
                            }
                        });
                },
            };
        },

        collectionFilterField({ min = 0, max = 0, ceil = 0 } = {}) {
            return {
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
            };
        },
    };
})();
