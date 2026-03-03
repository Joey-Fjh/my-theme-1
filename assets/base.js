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
        window.removeEventListener('scroll', this.rafUpdateLayout, { passive: true });

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
 * 统一局部渲染引擎 - 灵活网络层。
 * 处理 Section Rendering API (GET ?sections=id) 与 Cart Ajax API (POST /cart/add.js 等)
 * 返回的 JSON；支持通过 AbortSignal 取消前序重复请求。
 */
class ThemeRequest {
    /**
     * 带超时与外部取消的 Fetch。外部传入 signal 时，前序请求可被取消。
     * @param {string} url
     * @param {Object} options - fetch options；可含 signal (AbortSignal)、timeout (ms)
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
     * 请求 JSON，适用于 SRA 与 Cart API 的 JSON 响应。
     * 传入 options.signal 可在新请求发起时取消前序请求（如防抖式取消）。
     * @param {string} url
     * @param {Object} options - { signal?: AbortSignal, timeout?: number, headers?: Object, method?: string, body?: string }
     * @returns {Promise<Object>} Shopify 返回的 JSON（含 sections 或 cart 等）
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
 * 统一局部渲染引擎 — 全能替换调度器 + 纯数据更新助手。
 *
 * 设计原则：
 * 1. 不硬编码 shopify-section-xxx，目标容器完全由外部 domMap 配置决定。
 * 2. 使用 DOMParser 在内存中解析 HTML，严禁直接赋值 innerHTML 整段原始字符串。
 * 3. 支持精准子节点替换（innerSelectors）和整体内层替换（剥离外壳防嵌套）。
 * 4. 兼容双向更新：render() 处理 HTML 替换，updateText() 处理 JSON 数据绑定。
 */
class SectionRefresher {
    /**
     * @typedef {Object} DomMapConfig
     * @property {string}   [targetSelector]  - 真实 DOM 目标的 CSS 选择器。
     *                                          未提供则降级到 #shopify-section-${key}。
     * @property {string[]} [innerSelectors]  - 精准替换的 CSS 选择器数组
     *                                          （如 ['.tab-content', '.pagination']）。
     *                                          未提供或空数组 → 整体替换目标容器的 innerHTML。
     */

    /**
     * 全能替换调度器。
     *
     * 流程：
     *   1. 遍历 htmlMap 的 keys
     *   2. 从 domMap 读取当前 key 的配置 { targetSelector, innerSelectors }
     *   3. 确定真实 DOM 目标：config.targetSelector ?? `#shopify-section-${key}`
     *   4. DOMParser 解析 HTML → 虚拟 Document
     *   5. 在虚拟 Document 中定位"源元素"：
     *      - 优先 doc.querySelector(targetSelector)，匹配到则以该节点为源
     *      - 降级 doc.body.firstElementChild（SRA 返回的 HTML 是单根节点）
     *   6. 替换策略：
     *      - 有 innerSelectors → 只 replaceWith 这些子节点，最小化重绘
     *      - 无 innerSelectors → 取源元素的 innerHTML 替换目标容器的 innerHTML
     *        （剥离外壳，避免 <div id="shopify-section-xxx"> 无限嵌套）
     *   7. 对受影响的目标元素调用 Components.initAll 唤醒 Alpine/GSAP 组件
     *
     * @param {Object.<string, string>} htmlMap  - Shopify 返回的 sections 映射 { "sectionId": "<html>" }
     * @param {Object.<string, DomMapConfig>} [domMap={}] - 业务层配置的规则字典，键与 htmlMap 对应
     */
    static render(htmlMap, domMap = {}) {
        if (!htmlMap || typeof htmlMap !== 'object') return;
        if (!domMap || typeof domMap !== 'object') domMap = {};

        for (const key of Object.keys(htmlMap)) {
            const html = htmlMap[key];
            if (html == null || typeof html !== 'string') continue;

            const config = domMap[key] || {};

            /* ---- 1. 确定真实 DOM 目标 ---- */
            const targetSelector =
                (typeof config.targetSelector === 'string' && config.targetSelector.trim())
                    ? config.targetSelector.trim()
                    : `#shopify-section-${key}`;

            const targetEl = document.querySelector(targetSelector);
            if (!targetEl) continue;

            /* ---- 2. DOMParser 解析虚拟 DOM ---- */
            const doc = new DOMParser().parseFromString(html, 'text/html');

            /*
             * 定位虚拟源元素：
             *   优先用 targetSelector 在虚拟 Document 中查找
             *   （适配 #cart-drawer 等非标准 ID）。
             *   降级到 body 的第一个子元素（SRA 返回的 HTML 是单根结构）。
             */
            const virtualSourceEl =
                doc.querySelector(targetSelector) || doc.body.firstElementChild;
            if (!virtualSourceEl) continue;

            /* ---- 3. 执行替换 ---- */
            const innerSelectors = Array.isArray(config.innerSelectors)
                ? config.innerSelectors
                : [];

            if (innerSelectors.length > 0) {
                /*
                 * 精准替换：只更新 innerSelectors 匹配的子节点。
                 * 从虚拟源元素提取新节点，replaceWith 替换真实 DOM 中的旧节点。
                 * cloneNode(true) 确保脱离虚拟 Document 的引用。
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
                 * 整体内层替换：取虚拟源元素的 innerHTML 写入真实目标。
                 * 只搬运"内层"，不搬运外壳节点本身，
                 * 避免 <div id="shopify-section-xxx"> 在目标容器内重复嵌套。
                 */
                targetEl.innerHTML = virtualSourceEl.innerHTML;
            }

            /* ---- 4. 重载组件 ---- */
            window.__Theme__?.Components?.initAll?.(targetEl);
        }

        window.dispatchEvent(new Event('resize'));
    }

    /**
     * 纯数据更新助手：用 JSON 数据安全更新页面文本节点。
     * 典型场景：Cart API 返回 item_count / total_price 后批量更新角标和价格。
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
        Components.setupLifecycle();
        Base.init();
        this.initAlpine();
    } 

    static initAlpine(){
        document.addEventListener('alpine:init', () => {
            const Factory = window.__Theme__?.AlpineComponentsFactory;
            const Comps = window.__Theme__?.AlpineComponents;
            
            if (!Factory || !Comps) return;

            Factory.init?.(window.Alpine);
            Factory.register?.(Comps.DROPDOWN, Comps.dropdown);
            Factory.register?.(Comps.STICKY_HEADER, Comps.stickyHeader);
            Factory.register?.(Comps.TABCONTROL, Comps.tabControl);
            Factory.register?.(Comps.BEFOREAFTERCOMPARISON, Comps.beforeAfterComparison);
            Factory.register?.(Comps.COUNTDOWNTIMER, Comps.countdownTimer);
            Factory.register?.(Comps.SECTIONPAGINATION, Comps.sectionPagination);
        });
    }
}

window.__Theme__ = window.__Theme__ || {};
window.__Theme__.Components = Components;
window.__Theme__.ThemeRequest = ThemeRequest;
window.__Theme__.SectionRefresher = SectionRefresher;
Main.main();
})();
