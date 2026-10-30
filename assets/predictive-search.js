import { define, store } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';
import ShopifyHttp from 'https';

define('predictiveSearch', ({ limit = 8, limitScope = 'each' } = {}) => ({
    ...useDisposable(),
    searchUrl: '',
    predictiveSearchUrl: '',
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
    _predictiveEnabled: true,
    _debouncedFetch: null,
    _abortController: null,
    _initialSearchPerformed: false,
    _lastScheduledTerm: null,
    _lastResolvedTerm: null,
    _searchFailedMsg: '',

    init() {
        this._applyDatasetConfig();

        this._debouncedFetch = Utils.debounce((term) => this._fetch(term), 500);

        this._hydrateInitialQuery();
    },

    _applyDatasetConfig() {
        const dataset = this.$el?.dataset;
        if (!dataset) return;

        if (typeof dataset.predictiveSearchEnabled !== 'undefined') {
            this._predictiveEnabled = dataset.predictiveSearchEnabled !== 'false';
        }

        if (dataset.searchUrl) {
            this.searchUrl = dataset.searchUrl;
        }

        if (dataset.predictiveSearchUrl) {
            this.predictiveSearchUrl = dataset.predictiveSearchUrl;
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

        this._searchFailedMsg = dataset.toastSearchFailed || '';
    },

    _hydrateInitialQuery() {
        if (!this._predictiveEnabled) {
            this.isOpen = false;
            return;
        }

        if (this.query && !this._initialSearchPerformed) {
            this.openPanel();
            this.onInput(this.query);
            return;
        }

        this.isOpen = false;
    },

    openPanel() {
        if (!this._predictiveEnabled) return;
        if (!this.query) return;
        this.isOpen = true;

        const term = this.query.trim();
        if (!term || this.isLoading) return;

        const hasResults =
            this.suggestions.length ||
            this.products.length ||
            this.articles.length ||
            this.pages.length;

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

        if (!this._predictiveEnabled) return;

        if (this._lastResolvedTerm === term) {
            this.isOpen = true;
            this.isLoading = false;
            return;
        }

        if (this._lastScheduledTerm === term) {
            this.isOpen = true;
            return;
        }

        this.isOpen = true;
        this.isLoading = true;
        this.hasEmptyState = false;
        this.hasSearched = true;

        this._lastScheduledTerm = term;
        this._debouncedFetch(term);
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

        const url = new URL(this.predictiveSearchUrl, window.location.origin);
        url.searchParams.set('q', term);
        url.searchParams.set('resources[type]', 'query,product,article,page');
        const lim = Math.max(1, Math.min(20, Number(this.resultLimit) || 8));
        url.searchParams.set('resources[limit]', String(lim));
        if (this.resultLimitScope) {
            url.searchParams.set('resources[limit_scope]', String(this.resultLimitScope));
        }

        if (!ShopifyHttp?.getJSON) {
            this.isLoading = false;
            this._resetResults();
            this.hasEmptyState = true;
            return;
        }

        const request = ShopifyHttp.getJSON(url.toString(), {
            signal: controller.signal,
        });

        request
            .then((data) => {
                const results = data?.resources?.results || {};
                const locale = document.documentElement.lang || undefined;
                const currency = window.Shopify?.currency?.active || 'USD';
                const formatPrice = (cents) => {
                    if (typeof window.Shopify?.formatMoney === 'function') {
                        return window.Shopify.formatMoney(cents);
                    }
                    return new Intl.NumberFormat(locale, {
                        style: 'currency',
                        currency,
                        currencyDisplay: 'narrowSymbol',
                    }).format(cents / 100);
                };

                this.suggestions = (results.queries || [])
                    .map((q) => ({
                        text: q.text,
                        url: q.url,
                    }))
                    .filter((q) => q.text);

                this.products = (results.products || []).map((p) => {
                    let finalPrice = p.price;
                    if (typeof p.price === 'number') {
                        finalPrice = formatPrice(p.price);
                    }

                    const imageCandidates = [];
                    const pushImage = (image) => {
                        if (!image) return;
                        const imageUrl = typeof image === 'string' ? image : image?.url;
                        if (!imageUrl) return;
                        imageCandidates.push({
                            url: imageUrl,
                            alt: (typeof image === 'object' && image?.alt) || p.title || '',
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
                if (this._searchFailedMsg) {
                    const toast = store('toast');
                    if (toast?.show) {
                        toast.show(this._searchFailedMsg, 'error');
                    }
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
        this.closePanel();

        const url = new URL(this.searchUrl, window.location.origin);
        url.searchParams.set('options[prefix]', 'last');

        if (term) {
            url.searchParams.set('q', term);
            url.searchParams.set('type', 'product');
        } else {
            url.searchParams.delete('q');
            url.searchParams.delete('type');
        }

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
        return this._escapeHtml(text).replace(regex, '<span class="font-bold">$1</span>');
    },

    onSearchInputKeydown(event) {
        if (event?.key === 'ArrowDown' && this.suggestions.length) {
            event.preventDefault();
            this.activeSuggestionId = this.suggestions[0]?.text || null;
            return;
        }
        if (event?.key === 'Escape') {
            this.closePanel();
        }
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
        this.dispose();
    },
}));
