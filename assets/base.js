(function() {
'use strict';

class Base {
    static initialized = false;

    static announcementBar = null; 
    static header = null;  

    static setCSSVar(name,value){
        document.documentElement.style.setProperty(name,value);
    }

    static init(){
        if (this.initialized) return;
        this.initialized = true;

        this.announcementBar = document.querySelector('.announcement-bar');
        this.header = document.querySelector('.header');

        this.updateLayout();

        this.rafUpdateLayout = window.__Theme__.Utils.rafThrottle(this.updateLayout.bind(this));

        window.addEventListener('resize', this.rafUpdateLayout);
        window.addEventListener('scroll', this.rafUpdateLayout, { passive: true });

        [
            'shopify:section:load',
            'shopify:section:reorder',
            'shopify:section:unload'
        ].forEach(evt =>
            document.addEventListener(evt, this.rafUpdateLayout)
        );
    }

    static updateLayout(){
        this.updateAnnouncementBarHeight();
        this.updateHeaderHeight();
    }

    static updateAnnouncementBarHeight(){
        if (!this.announcementBar) return this.setCSSVar('--announcement-bar-height', `0px`);

        const rect = this.announcementBar.getBoundingClientRect();
        const announcementHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
        
        this.setCSSVar('--announcement-bar-height', `${announcementHeight}px`);    
    }

    static updateHeaderHeight(){ 
        const headerHeight = this.header
            ? this.header.offsetHeight
            : 0;

        this.setCSSVar('--header-height', `${headerHeight}px`);
    }

    static destroy(){
        if (!this.initialized) return;

        window.removeEventListener('resize', this.rafUpdateLayout);
        window.removeEventListener('scroll', this.rafUpdateLayout);

        [
            'shopify:section:load',
            'shopify:section:reorder',
            'shopify:section:unload'
        ].forEach(evt =>
            document.removeEventListener(evt, this.rafUpdateLayout)
        );

        if (typeof this.rafUpdateLayout?.dispose === 'function') {
            this.rafUpdateLayout.dispose();
        }

        this.initialized = false;
    }
}

/**
 * Components
 * ----------------------------------------
 * A lightweight Vue-like component runtime for Shopify themes.
 *
 * Responsibilities:
 * - Register component types
 * - Create/destroy instances bound to DOM nodes
 * - Handle Theme Editor lifecycle events
 * - Support lazy initialization via IntersectionObserver
 * - Auto-cleanup when DOM nodes are removed
 *
 * Each component instance is bound to:
 *   data-component-type
 *   data-component-id
 *
 * Optional:
 *   data-component-kind="section|block"
 */
class Components {
    /** Registered component */
    static registry = new Map();
    /** Active component instances */
    static instances = new Map();
    /** Ensure lifecycle hooks are only installed once */
    static lifecycleSetup = false;

    /** DOM mutation observer for auto cleanup */
    static observer = null;
    /** IntersectionObserver for lazy init */
    static io = null;
    /** Global lazy loading switch */
    static lazyLoad = true;

    static ATTR = {
        type: 'data-component-type',
        id: 'data-component-id',
        kind: 'data-component-kind'
    };

    static get SELECTOR() {
        return `[${this.ATTR.type}][${this.ATTR.id}]`;
    }

    static sectionSelector() {
        return `[${this.ATTR.kind}="section"]${this.SELECTOR}`;
    }

    static blockSelector() {
        return `[${this.ATTR.kind}="block"]${this.SELECTOR}`;
    }

    /**
     * Register a component type.
     * Called once per component.
     */
    static register(type, handlers = {}, options = {}){
        if(typeof type !== 'string' || !type.trim()) return;

        const key = type.trim();

        if (this.registry.has(key)) return;

        this.registry.set(key, {
            init: typeof handlers.init === 'function' ? handlers.init : null,
            destroy: typeof handlers.destroy === 'function' ? handlers.destroy : null,
            select: typeof handlers.select === 'function' ? handlers.select : null,
            deselect: typeof handlers.deselect === 'function' ? handlers.deselect : null,
            lazy: options.lazy !== undefined ? !!options.lazy : true
        });
    }

    static _getMetaFromEl(el){
        if(!el) return null;

        const type = el.getAttribute(this.ATTR.type);
        const id = el.getAttribute(this.ATTR.id);

        if (!type || !id) return null;

        const trimmedType = type.trim();

        return {
            type: trimmedType,
            id,
            instanceKey: `${trimmedType}:${id}`
        };
    }

    /** Initialize one component instance */
    static initElement(el){
        if (!el) return;

        const meta = this._getMetaFromEl(el);

        if (!meta) return;

        const handlers = this.registry.get(meta.type);

        if (!handlers || !handlers.init) return;
        if (this.instances.has(meta.instanceKey)) {
            const existing = this.instances.get(meta.instanceKey);
            if (existing.el === el) return;
            this.destroyElement(existing.el);
        }
        
        if (el.__componentInited) {
            delete el.__componentInited;
        }

        const result = handlers.init(el);
        const state = result === undefined ? {} : result;

        el.__componentInited = true;
        this.instances.set(meta.instanceKey, {
            el,
            type: meta.type,
            id: meta.id,
            state,
            destroy: handlers.destroy,
            select: handlers.select,
            deselect: handlers.deselect
        });
    }

    /** Destroy a single component instance */
    static destroyElement(el) {
        if (!el) return;

        const meta = this._getMetaFromEl(el);
        
        if (!meta) return;

        const record = this.instances.get(meta.instanceKey);
        
        if (!record) return;
        if (record.el !== el) return;

        try {
            if (typeof record.destroy === 'function') {
                record.destroy(record.el, record.state);
            }
        } catch (e) {
            console.error('Component destroy error:', e);
        }

        /**
         * Important:
         * Stop observing element if it was waiting for lazy init.
         * Prevents memory leaks during Theme Editor reload cycles.
         */
        if (this.io && el.__componentObserved) {
            try { this.io.unobserve(el); } catch (_) { /* ignore */ }
            delete el.__componentObserved;
        }

        delete el.__componentInited;
        this.instances.delete(meta.instanceKey);
    }

    static initAll(container = document) {
        container.querySelectorAll(this.SELECTOR).forEach((el) => {
            const meta = this._getMetaFromEl(el);
            
            if (!meta) return;

            const record = this.registry.get(meta.type);

            const shouldLazy = this.io &&
                            this.lazyLoad &&
                            record &&
                            record.lazy !== false;
            
            if (shouldLazy) {
                if (!el.__componentObserved) {
                    this.io.observe(el);
                    el.__componentObserved = true;
                }
            } else {
                this.initElement(el);
            }
        });
    }

    static destroyAll(container = document) {
        container
            .querySelectorAll(this.SELECTOR)
            .forEach((el) => this.destroyElement(el));
    }

    static _handleSelect(event, selector) {
        const root = event.target.closest?.(selector);
        
        if (!root) return;
        
        this.initElement(root);
        const meta = this._getMetaFromEl(root);
        
        if (!meta) return;
        
        const inst = this.instances.get(meta.instanceKey);
        
        if (inst && typeof inst.select === 'function') {
            inst.select(inst.el, inst.state);
        }
    }

    static _handleDeselect(event, selector) {
        const root = event.target.closest?.(selector);
        
        if (!root) return;
        
        this.initElement(root);
        const meta = this._getMetaFromEl(root);
        
        if (!meta) return;
        
        const inst = this.instances.get(meta.instanceKey);
        if (inst && typeof inst.deselect === 'function') {
            inst.deselect(inst.el, inst.state);
        }
    }

    static handleSectionSelect(e) {
        this._handleSelect(e, this.sectionSelector());
    }

    static handleSectionDeselect(e) {
        this._handleDeselect(e, this.sectionSelector());
    }

    static handleBlockSelect(e) {
        this._handleSelect(e, this.blockSelector());
    }

    static handleBlockDeselect(e) {
        this._handleDeselect(e, this.blockSelector());
    }

    /**
     * Observe DOM removal to auto destroy components
     * Works for section reload and dynamic DOM updates.
     */
    static setupMutationObserver() {
        if (this.observer || !document.body) return;

        this.observer = new MutationObserver((mutations) => {
            const toDestroy = new Set();
            const unmountEvent = new CustomEvent('unmount', { bubbles: false });

            mutations.forEach((m) => {
                m.removedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;
                    
                    if (node.matches?.(this.SELECTOR)) {
                        toDestroy.add(node);
                    }
                    node
                        .querySelectorAll?.(this.SELECTOR)
                        .forEach((el) => toDestroy.add(el));

                    node.querySelectorAll?.('[x-data]').forEach(el => {
                        el.dispatchEvent(unmountEvent);
                    });
                    if (node.hasAttribute?.('x-data')) {
                        node.dispatchEvent(unmountEvent);
                    }
                });
            });

            toDestroy.forEach((el) => this.destroyElement(el));
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Lazy-load components when visible.
     * Similar to Vue async component mounting.
     */
    static setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        this.io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const el = entry.target;

                this.initElement(el);
                this.io.unobserve(el);
                delete el.__componentObserved;
            });
        }, { rootMargin: '200px' });
    }

    /**
     * Install Shopify lifecycle listeners.
     * Runs only once.
     */
    static setupLifecycle() {
        if (this.lifecycleSetup) return;

        this.lifecycleSetup = true;
        this.setupIntersectionObserver();

        document.addEventListener('DOMContentLoaded', () => {
            this.setupMutationObserver();
            this.initAll(document);
        });

        document.addEventListener('shopify:section:load', (e) => {
            this.initAll(e.target || document);
        });

        document.addEventListener('shopify:section:reorder', (e) => {
            this.initAll(e.target || document);
        });

        document.addEventListener('shopify:section:unload', (e) => {
            this.destroyAll(e.target || document);
        });

        document.addEventListener('shopify:section:select',this.handleSectionSelect.bind(this));
        document.addEventListener('shopify:section:deselect',this.handleSectionDeselect.bind(this));
        document.addEventListener('shopify:block:select',this.handleBlockSelect.bind(this));
        document.addEventListener('shopify:block:deselect',this.handleBlockDeselect.bind(this));
    }
}

/**
 * ThemeRequest
 * ----------------------------------------
 * Unified partial-rendering network layer.
 * Handles Section Rendering API (GET ?sections=id) and Cart Ajax API (POST /cart/add.js etc.)
 * JSON responses. Supports AbortSignal-based cancellation of superseded requests.
 */
class ThemeRequest {
    /**
     * Fetch with timeout and external abort support.
     * When an external signal is provided, prior requests can be cancelled.
     * @param {string} url
     * @param {Object} options - fetch options; may include signal (AbortSignal), timeout (ms)
     * @returns {Promise<Response>}
     */
    static async fetchWithTimeout(url, options = {}) {
        const timeout = options.timeout ?? 8000;
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), timeout);
        const externalSignal = options.signal;
        const onAbort = () => {
            clearTimeout(tid);
            ctrl.abort();
        };
        if (externalSignal) {
            if (externalSignal.aborted) {
                clearTimeout(tid);
                throw new DOMException('Aborted', 'AbortError');
            }
            externalSignal.addEventListener('abort', onAbort, { once: true });
        }
        try {
            const res = await fetch(url, { ...options, signal: ctrl.signal });
            return res;
        } finally {
            clearTimeout(tid);
            if (externalSignal) externalSignal.removeEventListener('abort', onAbort);
        }
    }

    /**
     * Request JSON, suitable for SRA and Cart API JSON responses.
     * Pass options.signal to cancel superseded requests (e.g. debounce-based cancellation).
     * @param {string} url
     * @param {Object} options - { signal?: AbortSignal, timeout?: number, headers?: Object, method?: string, body?: string }
     * @returns {Promise<Object>} Shopify JSON payload (sections, cart, etc.)
     */
    static async getJSON(url, options = {}) {
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers
        };
        const res = await this.fetchWithTimeout(url, { ...options, headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }
}

/**
 * SectionRefresher
 * ----------------------------------------
 * Unified partial-rendering engine — full-featured DOM replacement dispatcher + data-binding helper.
 *
 * Design principles:
 * 1. No hard-coded shopify-section-xxx; target containers are fully driven by the external domMap config.
 * 2. HTML is parsed in-memory via DOMParser; raw innerHTML assignment of the full response is forbidden.
 * 3. Supports precise child-node replacement (innerSelectors) and full inner-content replacement (shell-stripping to prevent nesting).
 * 4. Dual-mode updates: render() for HTML replacement, updateText() for JSON data binding.
 */
class SectionRefresher {
    /**
     * @typedef {Object} DomMapConfig
     * @property {string}   [targetSelector]  - CSS selector for the real DOM target.
     *                                          Falls back to #shopify-section-${key} if omitted.
     * @property {string[]} [innerSelectors]  - Array of CSS selectors for precise child replacement
     *                                          (e.g. ['.tab-content', '.pagination']).
     *                                          If omitted or empty → full innerHTML replacement of the target.
     */

    /**
     * Full-featured DOM replacement dispatcher.
     *
     * Pipeline:
     *   1. Iterate over htmlMap keys
     *   2. Read config { targetSelector, innerSelectors } from domMap for the current key
     *   3. Resolve the real DOM target: config.targetSelector ?? `#shopify-section-${key}`
     *   4. Parse HTML via DOMParser → virtual Document
     *   5. Locate the virtual source element:
     *      - Prefer doc.querySelector(targetSelector) if it matches
     *      - Fallback to doc.body.firstElementChild (SRA responses are single-root)
     *   6. Replacement strategy:
     *      - With innerSelectors → replaceWith only matching children (minimal repaint)
     *      - Without innerSelectors → copy virtualSourceEl.innerHTML into the target
     *        (shell-stripping prevents <div id="shopify-section-xxx"> infinite nesting)
     *   7. Call Components.initAll on each affected target to reinitialize Alpine/GSAP components
     *
     * @param {Object.<string, string>|string} data  - Shopify sections map { "sectionId": "<html>" } or a single HTML string
     * @param {Object.<string, DomMapConfig>} [domMap={}] - Business-layer config dict, keys match data
     */
    static render(data, domMap = {}) {
        if (!data) return;
        if (!domMap || typeof domMap !== 'object') domMap = {};

        let htmlMap;
        if (typeof data === 'string') {
            const sectionKey = Object.keys(domMap)[0];
            if (!sectionKey) return;
            htmlMap = { [sectionKey]: data };
        } else if (typeof data === 'object') {
            htmlMap = data;
        } else {
            return;
        }

        for (const key of Object.keys(htmlMap)) {
            const html = htmlMap[key];
            if (html == null || typeof html !== 'string') continue;

            const config = domMap[key] || {};

            /* ---- 1. Resolve real DOM target ---- */
            const targetSelector =
                (typeof config.targetSelector === 'string' && config.targetSelector.trim())
                    ? config.targetSelector.trim()
                    : `#shopify-section-${key}`;

            const targetEl = document.querySelector(targetSelector);
            if (!targetEl) continue;

            /* ---- 2. Parse virtual DOM via DOMParser ---- */
            const doc = new DOMParser().parseFromString(html, 'text/html');

            /*
             * Locate virtual source element:
             *   Prefer targetSelector lookup in the virtual Document
             *   (supports non-standard IDs like #cart-drawer).
             *   Fallback to body.firstElementChild (SRA responses are single-root).
             */
            const virtualSourceEl =
                doc.querySelector(targetSelector) || doc.body.firstElementChild;
            if (!virtualSourceEl) continue;

            /* ---- 3. Execute replacement ---- */
            const innerSelectors = Array.isArray(config.innerSelectors)
                ? config.innerSelectors
                : [];

            if (innerSelectors.length > 0) {
                /*
                 * Precise replacement: only update children matching innerSelectors.
                 * Extract new nodes from virtual source, replaceWith into the real DOM.
                 * cloneNode(true) ensures detachment from the virtual Document.
                 */
                for (const sel of innerSelectors) {
                    if (typeof sel !== 'string' || !sel.trim()) continue;
                    const newChild = virtualSourceEl.querySelector(sel);
                    const oldChild = targetEl.querySelector(sel);
                    if (newChild && oldChild) {
                        oldChild.replaceWith(newChild.cloneNode(true));
                    }
                }
            } else {
                /*
                 * Full inner-content replacement: write virtualSourceEl.innerHTML into the real target.
                 * Only the inner content is transferred, not the wrapper element itself,
                 * preventing <div id="shopify-section-xxx"> from nesting inside the target.
                 */
                targetEl.innerHTML = virtualSourceEl.innerHTML;
            }

            /* ---- 4. Reinitialize components ---- */
            window.__Theme__?.Components?.initAll?.(targetEl);
        }

        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Pure data-binding helper: safely update page text nodes with JSON data.
     * Typical use case: batch-update cart badges and prices after Cart API returns item_count / total_price.
     *
     * @param {Array<{selector: string, text: string|number}>} updates
     * @example
     * SectionRefresher.updateText([
     *     { selector: '.cart-count', text: cartData.item_count },
     *     { selector: '.cart-total', text: cartData.total_price }
     * ]);
     */
    static updateText(updates = []) {
        if (!Array.isArray(updates)) return;
        for (const item of updates) {
            if (!item || typeof item.selector !== 'string' || !item.selector.trim()) continue;
            const text = item.text != null ? String(item.text) : '';
            document.querySelectorAll(item.selector).forEach((el) => {
                el.textContent = text;
            });
        }
    }
}

class Main {
    static main(){
        window.__Theme__?.ThemePerformance?.init?.();
        Components.setupLifecycle();
        Base.init();
        this.initAlpine();
    } 

    static initAlpine(){
        document.addEventListener('alpine:init', () => {
            // 1. Register global Stores
            const Stores = window.__Theme__?.AlpineStores;
            if (Stores) {
                if (Stores.toast) window.Alpine.store('toast', Stores.toast);
                if (Stores.dialog) window.Alpine.store('dialog', Stores.dialog);

                if (Stores.cart) {
                    const initialCartData = window.__Theme__?.initialState?.cart || {};
                    Stores.cart.init(initialCartData);
                    window.Alpine.store('cart', Stores.cart);
                }
            }

            // 2. Register components
            const Factory = window.__Theme__?.AlpineComponentsFactory;
            const Comps = window.__Theme__?.AlpineComponents;

            if (Factory && Comps) {
                Factory.init?.(window.Alpine);
                Factory.register?.(Comps.DROPDOWN, Comps.dropdown);
                Factory.register?.(Comps.STICKY_HEADER, Comps.stickyHeader);
                Factory.register?.(Comps.TABCONTROL, Comps.tabControl);
                Factory.register?.(Comps.BEFOREAFTERCOMPARISON, Comps.beforeAfterComparison);
                Factory.register?.(Comps.COUNTDOWNTIMER, Comps.countdownTimer);
                Factory.register?.(Comps.SECTIONPAGINATION, Comps.sectionPagination);
                Factory.register?.(Comps.COLLECTIONFILTERS, Comps.collectionFilters);
                Factory.register?.(Comps.PRODUCTGALLERY, Comps.productGallery);
                Factory.register?.(Comps.PRODUCTPRICE, Comps.ProductPrice);
                Factory.register?.(Comps.VARIANTPICKER, Comps.VariantPicker);
                Factory.register?.(Comps.QUANTITYSELECTOR, Comps.QuantitySelector);
                Factory.register?.(Comps.BUYBUTTONS, Comps.BuyButtons);
                Factory.register?.(Comps.PREDICTIVESEARCH, Comps.predictiveSearch);
                Factory.register?.(Comps.RELATEDPRODUCTS, Comps.relatedProducts);
                Factory.register?.(Comps.NEWSLETTEROVERLAY, Comps.newsletterOverlay);
            }
        }, { once: true });
    }
}

window.__Theme__ = window.__Theme__ || {};
window.__Theme__.Components = Components;
window.__Theme__.ThemeRequest = ThemeRequest;
window.__Theme__.SectionRefresher = SectionRefresher;
Main.main();
})();
