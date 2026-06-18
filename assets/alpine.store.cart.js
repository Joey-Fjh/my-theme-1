(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineStoreGroups = window.__Theme__.AlpineStoreGroups || {};

    const StoreGroups = window.__Theme__.AlpineStoreGroups;

    StoreGroups.cart = {
        items: [],
        total_price: 0,
        item_count: 0,
        loading: false,
        hasFetched: false,
        fetchError: null,

        _errorMessages: {
            generic: '',
            rateLimited: '',
            serverError: '',
            timeout: '',
            networkError: '',
        },

        configure(options) {
            if (options?.errorMessages) {
                Object.assign(this._errorMessages, options.errorMessages);
            }
        },

        _getHttp() {
            return window.ShopifyHttp;
        },

        /**
         * Hydrate store from initial payload (pure function, no DOM coupling).
         * @param {Object} data - Initial cart state
         */
        init(data = {}) {
            if (!data || typeof data !== 'object') return;

            this.items = Array.isArray(data.items) ? data.items : [];
            this.item_count = typeof data.item_count === 'number' ? data.item_count : 0;
            this.total_price = typeof data.total_price === 'number' ? data.total_price : 0;
            this.hasFetched =
                Array.isArray(data.items) ||
                typeof data.item_count === 'number' ||
                typeof data.total_price === 'number';
            this.fetchError = null;
        },

        /**
         * Fetch current cart from /cart.js and update store state.
         * @returns {Promise<Object>} Resolved with cart data or rejects on failure.
         */
        fetchCart() {
            const Http = this._getHttp();

            if (!Http?.getJSON) return Promise.reject(new Error('Http client unavailable'));

            this.loading = true;
            this.fetchError = null;

            return Http.getJSON('/cart.js', {
                credentials: 'same-origin',
            })
                .then((data) => {
                    this.items = Array.isArray(data.items) ? data.items : [];
                    this.item_count = typeof data.item_count === 'number' ? data.item_count : 0;
                    this.total_price = typeof data.total_price === 'number' ? data.total_price : 0;
                    this.hasFetched = true;
                    this.fetchError = null;

                    return data;
                })
                .catch((err) => {
                    this.fetchError = err;
                    throw err;
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        /**
         * Add items via /cart/add.js. On success, renders sections if returned and refetches cart.
         * @param {Array<{id: string|number, quantity: number, [key: string]: *}>} items - Line items (id = variant id).
         * @param {string[]} [sections=[]] - Section IDs to request for Section Rendering API (e.g. ['cart-drawer']).
         * @returns {Promise<Object>} Resolved with add response or rejects on failure.
         */
        add(items, sections = []) {
            const Http = this._getHttp();

            if (!Http?.postJSON) return this._handleError(new Error('Http client unavailable'));

            if (!Array.isArray(items) || items.length === 0)
                return this._handleError(new Error('items required'));

            this.loading = true;
            const body = { items };

            if (Array.isArray(sections) && sections.length > 0) {
                body.sections = sections.join(',');
            }

            return Http.postJSON('/cart/add.js', body, {
                credentials: 'same-origin',
            })
                .then((data) => {
                    if (
                        data.sections &&
                        typeof window.ShopifySectionRefresher?.render === 'function'
                    ) {
                        window.ShopifySectionRefresher.render(data.sections);
                    }
                    return this.fetchCart().then(() => data);
                })
                .catch((err) =>
                    this.fetchCart()
                        .catch(() => {})
                        .then(() => this._handleError(err)),
                )
                .finally(() => {
                    this.loading = false;
                });
        },

        change(lineOrId, quantity, sections = []) {
            const Http = this._getHttp();
            if (!Http?.postJSON) return this._handleError(new Error('Http client unavailable'));
            this.loading = true;
            const bodyData = { quantity: Number(quantity) };
            if (typeof lineOrId === 'string') {
                bodyData.id = lineOrId;
            } else {
                bodyData.line = Number(lineOrId);
            }
            if (Array.isArray(sections) && sections.length > 0) {
                bodyData.sections = sections.join(',');
            }
            return Http.postJSON('/cart/change.js', bodyData, {
                credentials: 'same-origin',
            })
                .then((parsedState) => {
                    if (
                        parsedState.sections &&
                        typeof window.ShopifySectionRefresher?.render === 'function'
                    ) {
                        window.ShopifySectionRefresher.render(parsedState.sections);
                    }
                    this.items = Array.isArray(parsedState.items) ? parsedState.items : [];
                    this.item_count =
                        typeof parsedState.item_count === 'number' ? parsedState.item_count : 0;
                    this.total_price =
                        typeof parsedState.total_price === 'number' ? parsedState.total_price : 0;
                    this.hasFetched = true;
                    this.fetchError = null;
                    return parsedState;
                })
                .catch((err) => this._handleError(err))
                .finally(() => {
                    this.loading = false;
                });
        },

        /**
         * Clear all items from cart.
         * @param {string[]} [sections=[]] - Optional Section Rendering API target IDs.
         * @returns {Promise<Object>}
         */
        clear(sections = []) {
            const Http = this._getHttp();
            if (!Http?.postJSON) return this._handleError(new Error('Http client unavailable'));
            this.loading = true;
            const bodyData = {};
            if (Array.isArray(sections) && sections.length > 0) {
                bodyData.sections = sections.join(',');
            }
            return Http.postJSON('/cart/clear.js', bodyData, {
                credentials: 'same-origin',
            })
                .then((data) => {
                    if (
                        data.sections &&
                        typeof window.ShopifySectionRefresher?.render === 'function'
                    ) {
                        window.ShopifySectionRefresher.render(data.sections);
                    }
                    this.items = Array.isArray(data.items) ? data.items : [];
                    this.item_count = typeof data.item_count === 'number' ? data.item_count : 0;
                    this.total_price = typeof data.total_price === 'number' ? data.total_price : 0;
                    this.hasFetched = true;
                    this.fetchError = null;
                    return data;
                })
                .catch((err) => this._handleError(err))
                .finally(() => {
                    this.loading = false;
                });
        },

        /**
         * Update cart note or attributes via /cart/update.js
         * @param {Object} data - e.g., { note: 'xxx' } or { attributes: { Country: 'China' } }
         * @returns {Promise<Object>}
         */
        update(data) {
            const Http = this._getHttp();
            if (!Http?.postJSON) return this._handleError(new Error('Http client unavailable'));
            this.loading = true;
            return Http.postJSON('/cart/update.js', data, {
                credentials: 'same-origin',
            })
                .catch((err) => this._handleError(err))
                .finally(() => {
                    this.loading = false;
                });
        },

        /**
         * Centralized error interceptor — shows toast and re-throws.
         * @param {Object|Error} err - Shopify API error or native Error
         * @returns {Promise<never>}
         */
        _handleError(err) {
            if (err?.isAbort || err?.name === 'AbortError') {
                return Promise.reject(err);
            }

            const msgs = this._errorMessages;
            const data = err?.data && typeof err.data === 'object' ? err.data : null;
            const status = err?.status ?? data?.status;
            let finalMsg;

            if (typeof data?.description === 'string' && data.description.trim()) {
                finalMsg = data.description.trim();
            } else if (err?.isTimeout) {
                finalMsg = msgs.timeout;
            } else if (err?.isNetworkError) {
                finalMsg = msgs.networkError;
            } else if (status === 429) {
                finalMsg = msgs.rateLimited;
            } else if (status >= 500) {
                finalMsg = msgs.serverError;
            } else {
                finalMsg = msgs.generic;
            }

            if (finalMsg) {
                const toast = window.Alpine?.store('toast');
                if (toast) {
                    toast.show(finalMsg, 'error');
                }
            }
            return Promise.reject(err);
        },
    };
})();
