import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';
import ShopifyHttp, { SectionRefresher } from 'https';

define('PickupAvailability', () => ({
    ...useDisposable(),
    sectionId: '',
    variantId: null,
    rootUrl: '/',
    loadingText: '',
    errorText: '',
    retryText: '',
    isLoading: false,
    hasContent: false,
    showError: false,
    _abortController: null,
    _eventScope: null,

    init() {
        const dataset = this.$el?.dataset || {};
        this.sectionId = this.sectionId || dataset.sectionId || '';
        this.rootUrl = dataset.rootUrl || this.rootUrl || '/';
        this.variantId = Number(dataset.variantId || this.variantId || 0) || null;
        this.loadingText = dataset.loadingText || this.loadingText;
        this.errorText = dataset.errorText || this.errorText;
        this.retryText = dataset.retryText || this.retryText;

        const events = ThemeEvents.events;
        this._eventScope = ThemeEvents.createScope();

        const onVariantChange = (e) => {
            if (e.detail?.sectionId !== this.sectionId) return;
            const nextVariantId = Number(e.detail?.variant?.id || 0) || null;
            if (nextVariantId === this.variantId) return;

            this.variantId = nextVariantId;
            this.load();
        };

        this._eventScope.on(events.PRODUCT_VARIANT_CHANGED, onVariantChange);

        this.load();
    },

    get requestUrl() {
        if (!this.variantId) return '';
        const normalizedRoot = String(this.rootUrl || '/').replace(/\/?$/, '/');
        return `${normalizedRoot}variants/${this.variantId}/?section_id=pickup-availability`;
    },

    retry() {
        if (this.isLoading) return;
        this.load();
    },

    get contentTarget() {
        return this.$el?.querySelector('[data-pickup-availability-content]') || null;
    },

    buildDomMap() {
        if (!this.sectionId) return {};
        return {
            'pickup-availability': {
                targetSelector: `[data-pickup-availability-root="${CSS.escape(this.sectionId)}"]`,
                innerSelectors: ['[data-pickup-availability-content]'],
            },
        };
    },

    clearContent() {
        this.hasContent = false;
        this.showError = false;
        this.contentTarget?.replaceChildren();
    },

    load() {
        const requestUrl = this.requestUrl;
        if (!requestUrl) {
            if (this._abortController) this._abortController.abort();
            this._abortController = null;
            this.isLoading = false;
            this.clearContent();
            return;
        }

        if (this._abortController) this._abortController.abort();
        this._abortController = new AbortController();
        const ctrl = this._abortController;

        this.isLoading = true;
        this.showError = false;

        ShopifyHttp.request(requestUrl, {
            method: 'GET',
            headers: { Accept: 'text/html' },
            signal: ctrl.signal,
        })
            .then((res) => res.text())
            .then((html) => {
                if (this._abortController !== ctrl || ctrl.signal.aborted) return;

                const doc = new DOMParser().parseFromString(html, 'text/html');
                const rendered = doc.querySelector('[data-pickup-availability-content]');
                const isEmpty = rendered?.dataset?.empty === 'true';

                if (!rendered || isEmpty) {
                    this.clearContent();
                    return;
                }

                SectionRefresher.render({ 'pickup-availability': html }, this.buildDomMap());
                this.hasContent = true;
                this.showError = false;
            })
            .catch((err) => {
                if (err?.isAbort || err?.name === 'AbortError') return;
                if (this._abortController !== ctrl) return;

                console.error('Pickup availability load failed:', err);
                this.showError = true;
            })
            .finally(() => {
                if (this._abortController !== ctrl) return;

                this._abortController = null;
                this.isLoading = false;
            });
    },

    destroy() {
        this._eventScope?.dispose?.();
        this._eventScope = null;
        if (this._abortController) this._abortController.abort();
        this._abortController = null;
        this.isLoading = false;
        this.dispose();
    },
}));
