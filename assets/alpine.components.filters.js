(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    const COLLECTION_FILTERS_FORM_ID = 'CollectionFiltersForm';

    function buildRelativeUrlFromParams(pathname, params) {
        const qs = params.toString();
        return qs ? `${pathname}?${qs}` : pathname;
    }

    function buildAbsoluteUrlFromParams(pathname, params) {
        return buildRelativeUrlFromParams(pathname, params);
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
                ...AlpineComponents.sectionPagination(sectionId, selectors),

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

                            if (typeof window.ScrollTrigger !== 'undefined') {
                                requestAnimationFrame(() => window.ScrollTrigger.refresh());
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

                _buildUrl(params) {
                    return buildRelativeUrlFromParams(window.location.pathname, params);
                },

                syncControlsFromUrl(url) {
                    syncCollectionControlsFromUrl(url);
                },

                _getFormParams() {
                    return readCollectionFormParams();
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
