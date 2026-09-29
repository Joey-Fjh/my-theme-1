/**
 * Alpine adapter.
 *
 * The only place in the theme that is allowed to talk to Alpine's API. The core
 * runtime (`base.js`) and the component entry modules depend on this surface, never
 * on `window.Alpine`.
 */

let alpineRef = null;

const pendingTasks = [];
const definedNames = new Set();

function resolveAlpine() {
    if (typeof window === 'undefined') return null;
    return window.Alpine || null;
}

function flushPendingTasks() {
    alpineRef = resolveAlpine();
    if (!alpineRef) return;

    while (pendingTasks.length > 0) {
        const task = pendingTasks.shift();
        try {
            task(alpineRef);
        } catch (error) {
            console.error('[ThemeAdapter] queued task failed', error);
        }
    }
}

if (typeof document !== 'undefined') {
    if (resolveAlpine()) {
        flushPendingTasks();
    } else {
        document.addEventListener('alpine:init', flushPendingTasks, { once: true });
    }
}

/**
 * Run `task` against the adapter library, queueing it until the library is available.
 * Tasks queued before startup are flushed synchronously, before the library walks the DOM.
 */
function withAlpine(task) {
    const alpine = alpineRef || resolveAlpine();

    if (alpine) {
        alpineRef = alpine;
        return task(alpine);
    }

    pendingTasks.push(task);
    return undefined;
}

/**
 * Register a component factory under the name its markup declares.
 * @param {string} name
 * @param {Function} factory
 */
export function define(name, factory) {
    const key = typeof name === 'string' ? name.trim() : '';

    if (!key) throw new Error('Adapter define requires a non-empty name');
    if (typeof factory !== 'function')
        throw new Error('Adapter define requires a factory function');
    if (definedNames.has(key)) return;

    definedNames.add(key);
    withAlpine((alpine) => alpine.data(key, factory));
}

/**
 * Consult `shouldHold(el)` for every element the adapter library is about to initialize,
 * on every path: first page walk, cloned template content (x-for, x-if, x-teleport),
 * injected HTML, and explicit mounts. When it returns true the element and its subtree are
 * held back exactly as `defer` does, and the caller mounts it later.
 * Must be registered before the library walks the DOM.
 * @param {(el: Element) => boolean} shouldHold
 */
export function holdUntilReady(shouldHold) {
    withAlpine((alpine) => {
        alpine.interceptInit((el) => {
            if (el.nodeType !== 1 || el._x_ignore) return;
            if (!shouldHold(el)) return;

            el.setAttribute('x-ignore', '');
            el._x_ignore = true;
        });
    });
}

/**
 * Initialize `el` and its subtree. Safe to call on already-initialized trees.
 * @param {Element} el
 */
export function mount(el) {
    if (!el) return;

    withAlpine((alpine) => {
        if (!el.isConnected) return;

        if (el.removeAttribute) el.removeAttribute('x-ignore');
        delete el._x_ignore;

        if (typeof alpine.initTree === 'function') alpine.initTree(el);
    });
}

/**
 * Tear down `el` and its subtree.
 * @param {Element} el
 */
export function unmount(el) {
    if (!el) return;

    withAlpine((alpine) => {
        if (typeof alpine.destroyTree === 'function') alpine.destroyTree(el);
    });
}

/**
 * Read or register a global UI store.
 * `store(name)` returns the store, or undefined when Alpine is unavailable.
 * `store(name, value)` queues registration before the first DOM walk.
 * @param {string} name
 * @param {object} [value]
 * @returns {object|undefined}
 */
export function store(name, value) {
    const key = typeof name === 'string' ? name.trim() : '';
    if (!key) return undefined;

    if (arguments.length >= 2) {
        withAlpine((alpine) => {
            if (typeof alpine.store === 'function') alpine.store(key, value);
        });
        return undefined;
    }

    try {
        const alpine = alpineRef || resolveAlpine();
        if (alpine && typeof alpine.store === 'function') {
            return alpine.store(key);
        }
    } catch (_) {
        /* Alpine not ready */
    }

    return undefined;
}

/**
 * Read reactive state bound to `el`.
 * @param {Element} el
 * @returns {object|null}
 */
export function data(el) {
    if (!el) return null;

    try {
        const alpine = alpineRef || resolveAlpine();
        if (alpine && typeof alpine.$data === 'function') {
            return alpine.$data(el);
        }
    } catch (_) {
        /* Alpine not ready */
    }

    return null;
}
