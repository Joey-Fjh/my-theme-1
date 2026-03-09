(function() {
'use strict';

/**
 * Alpine.js global store definitions (dialog, cart, toast).
 * Only defines and attaches to window.__Theme__.AlpineStores.
 * Registration with Alpine happens in base.js (Main.initAlpine).
 */
window.__Theme__ = window.__Theme__ || {};
window.__Theme__.AlpineStores = {
    toast: {
        messages: [],
        /**
         * Show a toast notification.
         * @param {string} message - Display text
         * @param {'success'|'error'|'info'} type - Visual style (default: 'info')
         * @param {number} duration - Auto-dismiss ms, 0 to persist (default: 3000)
         */
        show(message, type = 'info', duration = 3000) {
            const id = Date.now() + Math.random().toString(36).substring(2);
            this.messages.push({ id, message, type });
            if (duration > 0) {
                setTimeout(() => { this.remove(id); }, duration);
            }
        },
        remove(id) {
            this.messages = this.messages.filter(msg => msg.id !== id);
        }
    },
    dialog: {
        active: null,
        open(id) {
            if (typeof id !== 'string' || !id.trim()) return;
            this.active = id.trim();
            document.body.style.overflow = 'hidden';
        },
        close() {
            this.active = null;
            document.body.style.overflow = '';
        }
    },
    cart: {
        items: [],
        total_price: 0,
        item_count: 0,
        loading: false,

        /** Default request headers for Cart Ajax API */
        _headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/javascript'
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
        },

        /**
         * Fetch current cart from /cart.js and update store state.
         * @returns {Promise<Object>} Resolved with cart data or rejects on failure.
         */
        fetchCart() {
            this.loading = true;
            return fetch('/cart.js', { method: 'GET', headers: this._headers, credentials: 'same-origin' })
                .then((res) => {
                    if (!res.ok) throw new Error('Cart fetch failed');
                    return res.json();
                })
                .then((data) => {
                    this.items = Array.isArray(data.items) ? data.items : [];
                    this.item_count = typeof data.item_count === 'number' ? data.item_count : 0;
                    this.total_price = typeof data.total_price === 'number' ? data.total_price : 0;
                    return data;
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
            if (!Array.isArray(items) || items.length === 0) return Promise.reject(new Error('items required'));
            this.loading = true;
            const body = { items };
            if (Array.isArray(sections) && sections.length > 0) {
                body.sections = sections.join(',');
            }
            return fetch('/cart/add.js', {
                method: 'POST',
                headers: this._headers,
                credentials: 'same-origin',
                body: JSON.stringify(body)
            })
                .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
                .then(({ ok, data }) => {
                    if (!ok) return Promise.reject(data);
                    if (data.sections && typeof window.__Theme__?.SectionRefresher?.render === 'function') {
                        window.__Theme__.SectionRefresher.render(data.sections);
                    }
                    return this.fetchCart().then(() => data);
                })
                .catch(this._handleError)
                .finally(() => {
                    this.loading = false;
                });
        },

        /**
         * Change line quantity via /cart/change.js. On success, renders sections if returned and refetches cart.
         * @param {number} line - 1-based line index.
         * @param {number} quantity - New quantity.
         * @param {string[]} [sections=[]] - Section IDs for Section Rendering API.
         * @returns {Promise<Object>} Resolved with change response or rejects on failure.
         */
        change(line, quantity, sections = []) {
            this.loading = true;
            const body = { line: Number(line), quantity: Number(quantity) };
            if (Array.isArray(sections) && sections.length > 0) {
                body.sections = sections.join(',');
            }
            return fetch('/cart/change.js', {
                method: 'POST',
                headers: this._headers,
                credentials: 'same-origin',
                body: JSON.stringify(body)
            })
                .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
                .then(({ ok, data }) => {
                    if (!ok) return Promise.reject(data);
                    if (data.sections && typeof window.__Theme__?.SectionRefresher?.render === 'function') {
                        window.__Theme__.SectionRefresher.render(data.sections);
                    }
                    return this.fetchCart().then(() => data);
                })
                .catch(this._handleError)
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
            this.loading = true;
            return fetch('/cart/update.js', {
                method: 'POST',
                headers: this._headers,
                credentials: 'same-origin',
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .catch(this._handleError)
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
            const toast = window.Alpine?.store('toast');
            if (toast) {
                const msg = err?.description || err?.message || 'Something went wrong updating your cart.';
                toast.show(msg, 'error');
            }
            return Promise.reject(err);
        }
    }
};

})();
