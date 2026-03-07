(function() {
'use strict';

/**
 * Alpine.js global store definitions (dialog, cart).
 * Only defines and attaches to window.__Theme__.AlpineStores.
 * Registration with Alpine happens in base.js (Main.initAlpine).
 */
window.__Theme__ = window.__Theme__ || {};
window.__Theme__.AlpineStores = {
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
                .finally(() => {
                    this.loading = false;
                });
        }
    }
};

})();
