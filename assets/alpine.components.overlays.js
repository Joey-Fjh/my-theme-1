(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    ComponentGroups.overlays = {
        newsletterOverlay({
            dialogId = '',
            displayMode = 'enable',
            showInHome = true,
            showForVisitor = true,
            isHomeTemplate = false,
            isVisitor = true,
            delay = 3,
            expired = 7,
            successMessage = 'Thanks for subscribing.',
            errorMessage = 'Subscription failed. Please try again.',
        } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                dialogId,
                displayMode,
                showInHome,
                showForVisitor,
                isHomeTemplate,
                isVisitor,
                delay,
                expired,
                successMessage,
                errorMessage,
                isLoading: false,
                timeId: null,
                storageKey: 'newsletter-overlay-expired',

                _hydrateFromDataset() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;
                    if (ds.newsletterDialogId) this.dialogId = JSON.parse(ds.newsletterDialogId);
                    if (ds.newsletterDisplayMode) this.displayMode = JSON.parse(ds.newsletterDisplayMode);
                    if (ds.newsletterShowInHome) this.showInHome = JSON.parse(ds.newsletterShowInHome);
                    if (ds.newsletterShowForVisitor) this.showForVisitor = JSON.parse(ds.newsletterShowForVisitor);
                    if (ds.newsletterIsHomeTemplate) this.isHomeTemplate = JSON.parse(ds.newsletterIsHomeTemplate);
                    if (ds.newsletterIsVisitor) this.isVisitor = JSON.parse(ds.newsletterIsVisitor);
                    if (ds.newsletterDelay) this.delay = JSON.parse(ds.newsletterDelay);
                    if (ds.newsletterExpired) this.expired = JSON.parse(ds.newsletterExpired);
                    if (ds.newsletterSuccessMessage) this.successMessage = JSON.parse(ds.newsletterSuccessMessage);
                    if (ds.newsletterErrorMessage) this.errorMessage = JSON.parse(ds.newsletterErrorMessage);
                },

                init() {
                    this._hydrateFromDataset();
                    if (this.displayMode === 'test') {
                        this._open();
                        return;
                    }

                    if (!this._canShow()) return;

                    this.timeId = setTimeout(
                        () => {
                            this._open();
                        },
                        Math.max(0, Number(this.delay) * 1000),
                    );
                },

                _canShow() {
                    if (!this.showInHome && this.isHomeTemplate) return false;
                    if (!this.showForVisitor && this.isVisitor) return false;
                    if (!this._isExpired()) return false;
                    return true;
                },

                _isExpired() {
                    const saved = Number(window.localStorage.getItem(this.storageKey));
                    const now = Date.now();
                    return !saved || now > saved;
                },

                _setExpired() {
                    const ttl = Math.max(1, Number(this.expired)) * 24 * 60 * 60 * 1000;
                    window.localStorage.setItem(this.storageKey, String(Date.now() + ttl));
                },

                _open() {
                    if (!this.dialogId) return;
                    this.$store?.dialog?.open?.(this.dialogId);
                },

                hide() {
                    this.$store?.dialog?.close?.();
                    if (this.displayMode === 'enable') {
                        this._setExpired();
                    }
                },

                async submit(event) {
                    if (this.isLoading) return;

                    const form = event?.target;
                    if (!(form instanceof HTMLFormElement)) return;

                    const emailInput = form.querySelector('input[type="email"]');
                    if (!emailInput || !emailInput.value) {
                        window.Alpine?.store('toast')?.show?.(this.errorMessage, 'error');
                        return;
                    }

                    this.isLoading = true;

                    try {
                        const formData = new FormData(form);
                        const Http = window.ShopifyHttp;
                        if (!Http?.request) throw new Error('Http client unavailable');

                        const response = await Http.request(form.action, {
                            method: 'POST',
                            body: formData,
                            headers: { Accept: 'text/html' },
                            credentials: 'same-origin',
                        });

                        window.Alpine?.store('toast')?.show?.(this.successMessage, 'success');
                        form.reset();
                        this.hide();
                    } catch (_) {
                        window.Alpine?.store('toast')?.show?.(this.errorMessage, 'error');
                    } finally {
                        this.isLoading = false;
                    }
                },

                destroy() {
                    if (this.timeId) {
                        clearTimeout(this.timeId);
                        this.timeId = null;
                    }
                    this.dispose();
                },
            };
        },

        cartOverlay({ sections = [] } = {}) {
            return {
                sections: Array.isArray(sections) ? sections : [],
                dialogId: '',
                pending: {},
                _syncPromise: null,
                _lastSyncedAt: 0,

                get cart() {
                    return (
                        this.$store?.cart || {
                            items: [],
                            item_count: 0,
                            total_price: 0,
                            loading: false,
                            hasFetched: false,
                        }
                    );
                },

                get items() {
                    return Array.isArray(this.cart.items) ? this.cart.items : [];
                },

                get isEmpty() {
                    return Number(this.cart.item_count || 0) <= 0;
                },

                get canCheckout() {
                    return !this.isEmpty && !this.cart.loading;
                },

                get hasFetched() {
                    return Boolean(this.cart.hasFetched);
                },

                get hasVisibleItems() {
                    return this.items.length > 0;
                },

                get showInitialLoading() {
                    return Boolean(this.cart.loading && !this.hasVisibleItems);
                },

                get showEmpty() {
                    return Boolean(!this.cart.loading && this.hasFetched && this.isEmpty);
                },

                get showItems() {
                    return this.hasVisibleItems;
                },

                init() {
                    this.dialogId = this.$el?.dataset?.dialogId || '';

                    if (this.sections.length === 0) {
                        const ds = this.$el?.dataset;
                        if (ds?.cartSections) {
                            try {
                                const parsed = JSON.parse(ds.cartSections);
                                if (Array.isArray(parsed)) this.sections = parsed;
                            } catch (_) {}
                        }
                    }

                    this.$watch('isOpen', (isOpen) => {
                        if (isOpen) {
                            this.syncCart({ force: true }).catch(() => {});
                        }
                    });
                },

                get isOpen() {
                    return Boolean(this.dialogId && this.$store?.dialog?.active === this.dialogId);
                },

                syncCart({ force = false } = {}) {
                    if (typeof this.cart.fetchCart !== 'function') return Promise.resolve();
                    if (this.cart.loading) return this._syncPromise || Promise.resolve();

                    const now = Date.now();
                    if (!force && now - this._lastSyncedAt < 1000) {
                        return this._syncPromise || Promise.resolve();
                    }

                    if (this._syncPromise) return this._syncPromise;

                    this._syncPromise = this.cart
                        .fetchCart()
                        .then((data) => {
                            this._lastSyncedAt = Date.now();
                            return data;
                        })
                        .catch((err) => {
                            // Keep the drawer usable if a cart read fails; add/change handlers surface errors.
                            return Promise.reject(err);
                        })
                        .finally(() => {
                            this._syncPromise = null;
                        });

                    return this._syncPromise;
                },

                formatMoney(cents) {
                    const value = Number(cents || 0);
                    if (window.Shopify?.formatMoney) {
                        return window.Shopify.formatMoney(value);
                    }
                    const currency = window.Shopify?.currency?.active || 'USD';
                    return new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency,
                    }).format(value / 100);
                },

                linePrice(item) {
                    if (!item || typeof item !== 'object') return this.formatMoney(0);
                    if (typeof item.final_line_price === 'number')
                        return this.formatMoney(item.final_line_price);
                    const line =
                        Number(item.final_price || item.price || 0) * Number(item.quantity || 0);
                    return this.formatMoney(line);
                },

                maxQty(item) {
                    if (!item?.variant) return null;
                    if (item.variant.inventory_policy === 'continue') return null;
                    const qty = Number(item.variant.inventory_quantity);
                    return Number.isFinite(qty) && qty > 0 ? qty : null;
                },

                onQtyChange(item, qty) {
                    if (!item?.key) return;
                    const quantity = Math.max(0, Number(qty || 0));
                    if (!Number.isFinite(quantity)) return;
                    this.pending[item.key] = true;
                    this.cart.change(item.key, quantity, this.sections).finally(() => {
                        delete this.pending[item.key];
                    });
                },

                remove(item) {
                    this.onQtyChange(item, 0);
                },

                decrement(item) {
                    if (!item) return;
                    this.onQtyChange(item, Math.max(0, Number(item.quantity || 0) - 1));
                },

                increment(item) {
                    if (!item) return;
                    const max = this.maxQty(item);
                    const next = Number(item.quantity || 0) + 1;
                    this.onQtyChange(item, max === null ? next : Math.min(max, next));
                },

                clearCart() {
                    if (this.cart.loading || this.isEmpty) return;
                    this.cart.clear(this.sections);
                },

                goCheckout() {
                    if (!this.canCheckout) return;
                    window.location.assign('/checkout');
                },
            };
        },
    };
})();
