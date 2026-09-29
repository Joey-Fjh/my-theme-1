import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ShopifyHttp, { SectionRefresher } from 'https';

define('relatedProducts', () => ({
    ...useDisposable(),
    url: '',
    sectionId: '',
    _observer: null,
    _abortController: null,
    _loadingTimer: null,
    _requestTimeout: null,
    loaded: false,
    uiState: 'idle',
    loadingSeconds: 0,
    requestTimeoutMs: 10000,

    init() {
        this.url = this.$el?.dataset?.relatedProductsUrl || '';
        this.sectionId = this.$el?.dataset?.relatedProductsSectionId || '';

        if (!this.url || this.loaded) return;

        if (!('IntersectionObserver' in window)) {
            this.load();
            return;
        }

        this._observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    this.load();
                    this._observer?.disconnect?.();
                    this._observer = null;
                    break;
                }
            },
            { rootMargin: '200px' },
        );

        this._observer.observe(this.$el);
    },

    _resetLoadingIndicators() {
        if (this._loadingTimer) {
            clearInterval(this._loadingTimer);
            this._loadingTimer = null;
        }
        if (this._requestTimeout) {
            clearTimeout(this._requestTimeout);
            this._requestTimeout = null;
        }
        this.loadingSeconds = 0;
    },

    _startLoadingIndicators(ctrl) {
        this._resetLoadingIndicators();
        this.loadingSeconds = 0;
        this.uiState = 'loading';

        this._loadingTimer = setInterval(() => {
            this.loadingSeconds += 1;
        }, 1000);

        this._requestTimeout = setTimeout(() => {
            if (this._abortController !== ctrl) return;
            this.uiState = 'timeout';
            this.loaded = false;
            ctrl.abort();
        }, this.requestTimeoutMs);
    },

    retry() {
        if (!this.url || this.uiState === 'loading') return;
        this.load();
    },

    load() {
        if (this.loaded || !this.url || this.uiState === 'loading') return;
        this.loaded = true;

        if (this._abortController) this._abortController.abort();
        this._abortController = new AbortController();
        const ctrl = this._abortController;

        if (!ShopifyHttp?.request) {
            this.loaded = false;
            this.uiState = 'error';
            return;
        }

        this._startLoadingIndicators(ctrl);

        const request = ShopifyHttp.request(this.url, {
            method: 'GET',
            headers: { Accept: 'text/html' },
            signal: ctrl.signal,
        });

        request
            .then((res) => res.text())
            .then((html) => {
                if (!SectionRefresher || !this.sectionId) {
                    this.loaded = false;
                    this.uiState = 'error';
                    return;
                }

                const sections = { [this.sectionId]: html };
                const domMap = {
                    [this.sectionId]: {
                        targetSelector: `[data-section-id="${CSS.escape(this.sectionId)}"]`,
                        innerSelectors: ['[data-related-products-content]'],
                    },
                };

                SectionRefresher.render(sections, domMap);
                this.uiState = 'success';
            })
            .catch((err) => {
                if (err?.isAbort || err?.name === 'AbortError') return;
                console.error('Related products load failed:', err);
                this.loaded = false;
                this.uiState = 'error';
            })
            .finally(() => {
                this._resetLoadingIndicators();
                if (this._abortController === ctrl) {
                    this._abortController = null;
                }
            });
    },

    destroy() {
        if (this._observer?.disconnect) this._observer.disconnect();
        this._observer = null;

        if (this._abortController) this._abortController.abort();
        this._abortController = null;
        this._resetLoadingIndicators();

        this.dispose();
    },
}));
