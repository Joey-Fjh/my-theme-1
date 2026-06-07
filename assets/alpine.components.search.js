(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    ComponentGroups.search = {
        predictiveSearch({ limit = 8, limitScope = 'each' } = {}) {
            const Utils = window.__Theme__?.Utils;

            return {
                ...(Utils ? AlpineComponentsFactory.useDisposable() : {}),
                searchUrl: '/search',
                query: '',
                isOpen: false,
                isLoading: false,
                resultLimit: limit,
                resultLimitScope: limitScope,
                suggestions: [],
                products: [],
                articles: [],
                pages: [],
                activeTab: 'products',
                activeSuggestionId: null,
                hasEmptyState: false,
                hasSearched: false,
                _debouncedFetch: null,
                _abortController: null,
                _initialSearchPerformed: false,
                /** @type {string|null} Last term we scheduled a request for (debounced). */
                _lastScheduledTerm: null,
                /** @type {string|null} Last term we successfully resolved and rendered results for. */
                _lastResolvedTerm: null,
                predictiveEnabled: true,

                init() {
                    this._applyDatasetConfig();

                    if (Utils) {
                        // Slightly longer debounce reduces request spam during continuous typing.
                        this._debouncedFetch = Utils.debounce((term) => this._fetch(term), 500);
                    }

                    this._hydrateInitialQuery();
                },

                _applyDatasetConfig() {
                    const dataset = this.$el?.dataset;
                    if (!dataset) return;

                    if (dataset.predictiveSearchUrl) {
                        this.searchUrl = dataset.predictiveSearchUrl;
                    }

                    if (typeof dataset.predictiveSearchQuery === 'string') {
                        this.query = dataset.predictiveSearchQuery;
                    }

                    if (dataset.searchLimit) {
                        const parsed = Number(dataset.searchLimit);
                        if (Number.isFinite(parsed) && parsed > 0) {
                            this.resultLimit = parsed;
                        }
                    }

                    this._initialSearchPerformed = dataset.predictiveSearchPerformed === 'true';

                    if (dataset.predictiveEnabled === 'false') {
                        this.predictiveEnabled = false;
                    }
                },

                _hydrateInitialQuery() {
                    if (this.query && !this._initialSearchPerformed) {
                        this.openPanel();
                        this.onInput(this.query);
                        return;
                    }

                    this.isOpen = false;
                },

                openPanel() {
                    if (!this.predictiveEnabled || !this.query) {
                        this.closePanel();
                        return;
                    }
                    this.isOpen = true;

                    const term = this.query.trim();
                    if (!term || this.isLoading) return;

                    const hasResults =
                        this.suggestions.length ||
                        this.products.length ||
                        this.articles.length ||
                        this.pages.length;

                    // After landing on search results page, query may exist but panel data is empty.
                    // Trigger one fetch on open so users don't need to type again.
                    if (!hasResults) {
                        this.onInput(term);
                    }
                },

                closePanel() {
                    this.isOpen = false;
                    this.activeSuggestionId = null;
                },

                onInput(value) {
                    this.query = value;
                    const term = value.trim();

                    if (!term) {
                        this._resetResults();
                        this.isOpen = false;
                        this.isLoading = false;
                        this._lastScheduledTerm = null;
                        return;
                    }

                    if (!this.predictiveEnabled) {
                        this._resetResults();
                        this.isOpen = false;
                        this.isLoading = false;
                        this._lastScheduledTerm = null;
                        return;
                    }

                    // If we already have results for this exact term, don't re-request.
                    // This also prevents duplicate calls from IME confirm events (compositionend).
                    if (this._lastResolvedTerm === term) {
                        this.isOpen = true;
                        this.isLoading = false;
                        return;
                    }

                    // If this exact term is already scheduled (debounced), don't schedule again.
                    if (this._lastScheduledTerm === term) {
                        this.isOpen = true;
                        return;
                    }

                    this.isOpen = true;
                    this.isLoading = true;
                    this.hasEmptyState = false;
                    this.hasSearched = true;

                    if (this._debouncedFetch) {
                        this._lastScheduledTerm = term;
                        this._debouncedFetch(term);
                    } else {
                        this._lastScheduledTerm = term;
                        this._fetch(term);
                    }
                },

                _resetResults() {
                    this.suggestions = [];
                    this.products = [];
                    this.articles = [];
                    this.pages = [];
                    this.hasEmptyState = false;
                    this.hasSearched = false;
                },

                _fetch(term) {
                    if (!term) {
                        this.isLoading = false;
                        this._resetResults();
                        return;
                    }

                    if (this._abortController) {
                        this._abortController.abort();
                    }

                    this._abortController = new AbortController();
                    const controller = this._abortController;
                    const requestedTerm = term;

                    const url = new URL('/search/suggest.json', window.location.origin);
                    url.searchParams.set('q', term);
                    url.searchParams.set('resources[type]', 'query,product,article,page');
                    const lim = Math.max(1, Math.min(20, Number(this.resultLimit) || 8));
                    url.searchParams.set('resources[limit]', String(lim));
                    if (this.resultLimitScope) {
                        url.searchParams.set(
                            'resources[limit_scope]',
                            String(this.resultLimitScope),
                        );
                    }

                    const Http = window.ShopifyHttp;

                    if (!Http?.getJSON) {
                        this.isLoading = false;
                        this._resetResults();
                        this.hasEmptyState = true;
                        return;
                    }

                    const request = Http.getJSON(url.toString(), {
                        signal: controller.signal,
                    });

                    request
                        .then((data) => {
                            const results = data?.resources?.results || {};
                            const currency =
                                window.Shopify?.currency?.active ||
                                (window.Shopify && window.Shopify.currency) ||
                                'USD';
                            const fmt = new Intl.NumberFormat(undefined, {
                                style: 'currency',
                                currency,
                            });

                            this.suggestions = (results.queries || [])
                                .map((q) => ({
                                    text: q.text,
                                    url: q.url,
                                }))
                                .filter((q) => q.text);

                            this.products = (results.products || []).map((p) => {
                                let finalPrice = p.price;
                                if (typeof p.price === 'number') {
                                    finalPrice = fmt.format(p.price / 100);
                                }

                                const imageCandidates = [];
                                const pushImage = (image) => {
                                    if (!image) return;
                                    const url = typeof image === 'string' ? image : image?.url;
                                    if (!url) return;
                                    imageCandidates.push({
                                        url,
                                        width:
                                            typeof image === 'object'
                                                ? Number(image?.width) || 0
                                                : 0,
                                        height:
                                            typeof image === 'object'
                                                ? Number(image?.height) || 0
                                                : 0,
                                        alt:
                                            (typeof image === 'object' && image?.alt) ||
                                            p.title ||
                                            '',
                                    });
                                };

                                pushImage(p.featured_image);
                                pushImage(p.image);

                                (p.variants || []).forEach((variant) => {
                                    pushImage(variant?.featured_image);
                                    pushImage(variant?.image);
                                });

                                const seenImageUrls = new Set();
                                const images = imageCandidates.filter((image) => {
                                    if (!image?.url || seenImageUrls.has(image.url)) return false;
                                    seenImageUrls.add(image.url);
                                    return true;
                                });
                                const primaryImage = images[0];
                                const imageAspectRatio =
                                    primaryImage?.width && primaryImage?.height
                                        ? `${primaryImage.width} / ${primaryImage.height}`
                                        : '1 / 1';

                                return {
                                    id: p.id,
                                    title: p.title,
                                    vendor: p.vendor,
                                    priceFormatted: finalPrice,
                                    image:
                                        typeof p.image === 'string'
                                            ? p.image
                                            : p.image?.url || p.featured_image?.url || '',
                                    images,
                                    imageAspectRatio,
                                    url: p.url,
                                };
                            });

                            this.articles = (results.articles || []).map((a) => ({
                                id: a.id,
                                title: a.title,
                                url: a.url,
                            }));

                            this.pages = (results.pages || []).map((pg) => ({
                                id: pg.id,
                                title: pg.title,
                                url: pg.url,
                            }));

                            const hasAny =
                                this.suggestions.length ||
                                this.products.length ||
                                this.articles.length ||
                                this.pages.length;

                            this.hasEmptyState = !hasAny;
                            this._lastResolvedTerm = requestedTerm;

                            if (!this.products.length && this.articles.length) {
                                this.activeTab = 'articles';
                            } else if (!this.products.length && this.pages.length) {
                                this.activeTab = 'pages';
                            } else {
                                this.activeTab = 'products';
                            }
                        })
                        .catch((err) => {
                            if (err?.isAbort || err?.name === 'AbortError') return;
                            console.error(err);
                            const toast = this.$store?.toast || window.Alpine?.store?.('toast');
                            if (toast?.show) {
                                toast.show('Search failed. Please try again.', 'error');
                            }
                            this._resetResults();
                            this.hasEmptyState = true;
                        })
                        .finally(() => {
                            if (this._abortController === controller) {
                                this.isLoading = false;
                                this._abortController = null;
                            }
                        });
                },

                performSearch() {
                    const term = (this.query || '').trim();
                    if (!term) return;

                    // When executing a full search navigation, ensure the predictive panel closes
                    // so the UI doesn't remain open during/after navigation on the search page.
                    this.closePanel();

                    const url = new URL(this.searchUrl, window.location.origin);
                    url.searchParams.set('q', term);
                    window.location.assign(url.toString());
                },

                onSuggestionClick(item) {
                    if (!item) return;
                    this.query = item.text || '';
                    this.closePanel();
                    this.performSearch();
                },

                highlightSuggestion(text) {
                    const term = (this.query || '').trim();
                    if (!term || !text) return this._escapeHtml(text);

                    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(`(${escaped})`, 'ig');
                    return this._escapeHtml(text).replace(
                        regex,
                        '<span class=\"font-bold\">$1</span>',
                    );
                },

                _escapeHtml(str) {
                    return String(str)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;');
                },

                destroy() {
                    if (this._debouncedFetch?.dispose) {
                        this._debouncedFetch.dispose();
                    }
                    if (this._abortController) {
                        this._abortController.abort();
                        this._abortController = null;
                    }
                    if (this.dispose) {
                        this.dispose();
                    }
                },
            };
        },
    };
})();
