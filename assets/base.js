import './vendor-alpine-intersect.min.js';
import ThemeEvents from 'events';
import * as adapter from 'alpine-adapter';
import { createCartContract } from 'cart-contract';
import { createCartUiStore } from './alpine.store.cart.js';
import { createDialogStore } from './dialog.js';
import { createToastStore } from './toast.js';
/**
 * Coalesce repeated calls into one animation frame.
 * Lives in the core because layout measurement is the core's own concern.
 */
export function rafThrottle(fn) {
    let ticking = false;
    let lastArgs = null;
    let rafId = null;

    const wrapper = function (...args) {
        lastArgs = args;
        if (!ticking) {
            ticking = true;
            rafId = requestAnimationFrame(() => {
                fn.apply(this, lastArgs);
                ticking = false;
            });
        }
    };

    wrapper.dispose = () => {
        if (rafId) cancelAnimationFrame(rafId);
        ticking = false;
        lastArgs = null;
    };

    return wrapper;
}

class Base {
    static resizeObserver = null;
    static rafUpdateLayout = null;
    static bindOnShopifySectionLayout = null;
    static initialized = false;

    static announcementBar = null;
    static header = null;

    static setCSSVar(name, value) {
        document.documentElement.style.setProperty(name, value);
    }

    static init() {
        if (this.initialized) return;

        this.initialized = true;
        this.rafUpdateLayout = rafThrottle(this.updateLayout.bind(this));
        this.bindOnShopifySectionLayout = this.onShopifySectionLayout.bind(this);

        if (typeof ResizeObserver !== 'undefined') {
            this.bindResizeTargets();
        }

        window.addEventListener('scroll', this.rafUpdateLayout, { passive: true });

        this.updateLayout();

        ['shopify:section:load', 'shopify:section:reorder', 'shopify:section:unload'].forEach(
            (evt) => document.addEventListener(evt, this.bindOnShopifySectionLayout),
        );
    }

    static bindResizeTargets() {
        if (typeof ResizeObserver === 'undefined') return;

        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver(this.rafUpdateLayout);
        }

        this.resizeObserver.disconnect();
        this.refreshElements();

        if (this.announcementBar) this.resizeObserver.observe(this.announcementBar);
        if (this.header) this.resizeObserver.observe(this.header);
    }

    static onShopifySectionLayout() {
        this.bindResizeTargets();
        this.rafUpdateLayout();
    }

    static refreshElements() {
        this.announcementBar = document.querySelector('.announcement-bar');
        this.header = document.querySelector('.site-header > header');
    }

    static updateLayout() {
        this.refreshElements();
        this.updateAnnouncementBarHeight();
        this.updateHeaderHeight();
    }

    static updateAnnouncementBarHeight() {
        if (!this.announcementBar) return this.setCSSVar('--announcement-bar-height', `0px`);

        const rect = this.announcementBar.getBoundingClientRect();
        const announcementHeight = Math.max(
            0,
            Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0),
        );

        this.setCSSVar('--announcement-bar-height', `${announcementHeight}px`);
    }

    static updateHeaderHeight() {
        const headerHeight = this.header ? this.header.offsetHeight : 0;

        this.setCSSVar('--header-height', `${headerHeight}px`);
    }

    static destroy() {
        if (!this.initialized) return;

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        if (this.rafUpdateLayout) {
            this.rafUpdateLayout.dispose();

            window.removeEventListener('scroll', this.rafUpdateLayout);
            this.rafUpdateLayout = null;
        }

        ['shopify:section:load', 'shopify:section:reorder', 'shopify:section:unload'].forEach(
            (evt) => document.removeEventListener(evt, this.bindOnShopifySectionLayout),
        );

        this.initialized = false;
        this.bindOnShopifySectionLayout = null;
    }
}

/**
 * Module loader
 * ----------------------------------------
 * Markup declares which behaviour a root needs through `data-module-id`; the import map
 * turns that identifier into an asset URL. The core holds no component manifest: it reads
 * the DOM, imports each identifier once, and hands the root to the adapter.
 */
const MODULE_ATTR = 'data-module-id';
const MODULE_LAZY_ATTR = 'data-module-lazy';
const MODULE_SELECTOR = `[${MODULE_ATTR}]`;

const moduleRequests = new Map();
const loadedModules = new Set();
let lazyObserver = null;
let domObserver = null;
let moduleLifecycleSetup = false;

function getLazyObserver() {
    if (lazyObserver || !('IntersectionObserver' in window)) return lazyObserver;

    lazyObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                lazyObserver.unobserve(entry.target);
                delete entry.target.__themeModuleObserved;
                activateModuleRoot(entry.target);
            });
        },
        { rootMargin: '200px' },
    );

    return lazyObserver;
}

function importModule(moduleId) {
    if (!moduleRequests.has(moduleId)) {
        moduleRequests.set(
            moduleId,
            import(moduleId).then((mod) => {
                loadedModules.add(moduleId);
                return mod;
            }),
        );
    }

    return moduleRequests.get(moduleId);
}

function activateModuleRoot(el) {
    const moduleId = el.getAttribute(MODULE_ATTR);
    if (!moduleId) return;

    if (loadedModules.has(moduleId)) {
        adapter.mount(el);
        return;
    }

    importModule(moduleId)
        .then(() => adapter.mount(el))
        .catch((error) => {
            console.error(`[Theme] Failed to load module "${moduleId}"`, error);
            adapter.mount(el);
        });
}

function claimModuleRoot(el) {
    if (!el || el.__themeModuleClaimed) return;

    const moduleId = el.getAttribute(MODULE_ATTR);
    if (!moduleId) return;

    el.__themeModuleClaimed = true;
    adapter.defer(el);

    const observer =
        !loadedModules.has(moduleId) && el.hasAttribute(MODULE_LAZY_ATTR)
            ? getLazyObserver()
            : null;

    if (observer) {
        observer.observe(el);
        el.__themeModuleObserved = true;
        return;
    }

    activateModuleRoot(el);
}

/**
 * Claim every module root inside `container` (and `container` itself). Idempotent.
 * @param {Document|Element} [container]
 */
function scanModules(container) {
    const root = container || document;

    if (root.nodeType === 1 && root.matches?.(MODULE_SELECTOR)) claimModuleRoot(root);
    root.querySelectorAll?.(MODULE_SELECTOR).forEach(claimModuleRoot);
}

/** Stop observing module roots that left the document. */
function releaseModuleRoots(node) {
    if (!lazyObserver || !(node instanceof HTMLElement)) return;

    const stop = (el) => {
        if (!el.__themeModuleObserved) return;
        lazyObserver.unobserve(el);
        delete el.__themeModuleObserved;
    };

    if (node.matches?.(MODULE_SELECTOR)) stop(node);
    node.querySelectorAll?.(MODULE_SELECTOR).forEach(stop);
}

/**
 * Observe DOM removal to release lazy-load observers on module roots that left the document.
 */
function setupMutationObserver() {
    if (domObserver || !document.body) return;

    domObserver = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
            m.removedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;

                releaseModuleRoots(node);
            });
        });
    });

    domObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

function forwardThemeEditorEvent(forwardType) {
    return (event) => {
        const container = event.target;
        if (!(container instanceof Element)) return;

        const roots = new Set();

        if (container.matches?.(MODULE_SELECTOR)) {
            roots.add(container);
        }

        const ancestor = container.closest?.(MODULE_SELECTOR);
        if (ancestor) roots.add(ancestor);

        container.querySelectorAll?.(MODULE_SELECTOR).forEach((root) => roots.add(root));

        roots.forEach((root) => {
            ThemeEvents.emit(forwardType, event.detail, { target: root });
        });
    };
}

/** Forward Theme Editor select/deselect events to module roots inside the affected section or block. */
function setupThemeEditorForwarding() {
    if (!window.Shopify?.designMode) return;

    const bindings = [
        [ThemeEvents.events.SHOPIFY_SECTION_SELECT, 'shopify:section:select'],
        [ThemeEvents.events.SHOPIFY_SECTION_DESELECT, 'shopify:section:deselect'],
        [ThemeEvents.events.SHOPIFY_SECTION_REORDER, 'shopify:section:reorder'],
        [ThemeEvents.events.SHOPIFY_BLOCK_SELECT, 'shopify:block:select'],
        [ThemeEvents.events.SHOPIFY_BLOCK_DESELECT, 'shopify:block:deselect'],
    ];

    bindings.forEach(([forwardType, shopifyType]) => {
        document.addEventListener(shopifyType, forwardThemeEditorEvent(forwardType));
    });
}

function setupModuleLifecycle() {
    if (moduleLifecycleSetup) return;

    moduleLifecycleSetup = true;

    document.addEventListener('DOMContentLoaded', () => {
        setupMutationObserver();
    });

    setupThemeEditorForwarding();
}

/** Unmount every module root inside `container` (and `container` itself). */
function unmountModuleRoots(container) {
    const root = container || document;

    if (root.nodeType === 1 && root.matches?.(MODULE_SELECTOR)) {
        adapter.unmount(root);
    }
    root.querySelectorAll?.(MODULE_SELECTOR).forEach((el) => adapter.unmount(el));
}

function readCartErrorMessages() {
    const dataset = document.body?.dataset || {};

    return {
        generic: dataset.cartErrorGeneric || '',
        rateLimited: dataset.cartErrorRateLimited || '',
        serverError: dataset.cartErrorServerError || '',
        timeout: dataset.cartErrorTimeout || '',
        networkError: dataset.cartErrorNetworkError || '',
    };
}

function setupStores() {
    const contract = createCartContract();
    const cartStore = createCartUiStore(contract);

    cartStore.configure({
        errorMessages: readCartErrorMessages(),
    });

    contract.hydrate();
    adapter.store('cart', cartStore);
    adapter.store('dialog', createDialogStore());
    adapter.store('toast', createToastStore());
}

function main() {
    if (window.location.search.includes('debug=true') || window.Shopify?.designMode) {
        import('./performance.js')
            .then(({ ThemePerformance }) => ThemePerformance.init())
            .catch(() => {});
    }

    setupModuleLifecycle();
    Base.init();

    setupStores();
    scanModules(document);

    document.addEventListener('shopify:section:load', (e) => scanModules(e.target || document));
    document.addEventListener('shopify:section:reorder', (e) => scanModules(e.target || document));
    document.addEventListener('shopify:section:unload', (e) => {
        const target = e.target || document;
        unmountModuleRoots(target);
        releaseModuleRoots(target);
    });
}

main();

export { Base, scanModules };
