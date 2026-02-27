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

        const throttledUpdate = Utils.throttle(this.updateLayout.bind(this), 100);

        window.addEventListener('resize', throttledUpdate);
        window.addEventListener('scroll', throttledUpdate);

        [
            'shopify:section:load',
            'shopify:section:reorder',
            'shopify:section:unload'
        ].forEach(evt =>
            document.addEventListener(evt, throttledUpdate)
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
        if (this.instances.has(meta.instanceKey)) return;
        
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
        if(this.io && el.__componentObserved){
            this.io.unobserve(el);
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

            mutations.forEach((m) => {
                m.removedNodes.forEach((node) => {
                    if (!(node instanceof HTMLElement)) return;
                    
                    if (node.matches?.(this.SELECTOR)) {
                        toDestroy.add(node);
                    }

                    node
                        .querySelectorAll?.(this.SELECTOR)
                        .forEach((el) => toDestroy.add(el));
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
        });
    }

    /**
     * Install Shopify lifecycle listeners.
     * Runs only once.
     */
    static setupLifecycle() {
        if (this.lifecycleSetup) return;

        this.lifecycleSetup = true;
        this.setupIntersectionObserver();
        this.setupMutationObserver();

        document.addEventListener('DOMContentLoaded', () => {
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

class Main {
    static main(){
        Components.setupLifecycle();
        Base.init();
        this.initAlpine();
    } 

    static initAlpine(){
        document.addEventListener('alpine:init', () => {
            const alpine = window.Alpine;
            AlpineComponentsFactory.init(alpine);

            AlpineComponentsFactory.register(AlpineComponents.DROPDOWN, AlpineComponents.dropdown);
            AlpineComponentsFactory.register(AlpineComponents.STICKY_HEADER, AlpineComponents.stickyHeader);
            AlpineComponentsFactory.register(AlpineComponents.TABCONTROL, AlpineComponents.tabControl);
            AlpineComponentsFactory.register(AlpineComponents.BEFOREAFTERCOMPARISON,AlpineComponents.beforeAfterComparison);
            AlpineComponentsFactory.register(AlpineComponents.COUNTDOWNTIMER,AlpineComponents.countdownTimer);
        })
    }
}

window.$components = Components;
Main.main();