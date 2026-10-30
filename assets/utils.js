class Utils {
    static prefersReducedMotion() {
        return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    }

    static debounce(func, wait = 300, immediate = false) {
        let timeout;

        const wrapper = function (...args) {
            const context = this;

            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };

            const callNow = immediate && !timeout;

            clearTimeout(timeout);
            timeout = setTimeout(later, wait);

            if (callNow) func.apply(context, args);
        };

        wrapper.dispose = () => {
            clearTimeout(timeout);
            timeout = null;
        };

        return wrapper;
    }
}

/** @type {Set<(velocity: number) => void>} */
const scrollVelocitySubscribers = new Set();

let scrollVelocityListenerAttached = false;
let scrollVelocityRafPending = false;
let scrollVelocityLastY = 0;
let scrollVelocityLastTime = 0;

function onScrollVelocityWindowScroll() {
    if (scrollVelocityRafPending) return;
    scrollVelocityRafPending = true;
    requestAnimationFrame(() => {
        scrollVelocityRafPending = false;
        const y = window.scrollY;
        const t = performance.now();
        let velocity = 0;
        if (scrollVelocityLastTime > 0) {
            const dt = t - scrollVelocityLastTime;
            if (dt > 0) {
                velocity = (y - scrollVelocityLastY) / dt;
            }
        }
        scrollVelocityLastY = y;
        scrollVelocityLastTime = t;
        scrollVelocitySubscribers.forEach((callback) => {
            callback(velocity);
        });
    });
}

/**
 * Subscribe to window scroll velocity (px/ms). One passive scroll listener is shared.
 * @param {(velocity: number) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeScrollVelocity(callback) {
    scrollVelocitySubscribers.add(callback);
    if (!scrollVelocityListenerAttached) {
        window.addEventListener('scroll', onScrollVelocityWindowScroll, { passive: true });
        scrollVelocityListenerAttached = true;
        scrollVelocityLastY = window.scrollY;
        scrollVelocityLastTime = performance.now();
    }

    return () => {
        scrollVelocitySubscribers.delete(callback);
        if (scrollVelocitySubscribers.size === 0 && scrollVelocityListenerAttached) {
            window.removeEventListener('scroll', onScrollVelocityWindowScroll);
            scrollVelocityListenerAttached = false;
            scrollVelocityRafPending = false;
            scrollVelocityLastTime = 0;
        }
    };
}

/**
 * Collect listener and observer registrations so a component can release them in one call.
 */
export function useDisposable() {
    const disposers = [];

    return {
        on(target, event, handler, options) {
            if (!target || typeof target.addEventListener !== 'function') return;

            target.addEventListener(event, handler, options);
            disposers.push(() => target.removeEventListener(event, handler, options));
        },

        observe(observer, el) {
            if (!el || !observer?.observe) return;

            observer.observe(el);
            disposers.push(() => observer.unobserve(el));
        },

        dispose() {
            disposers.forEach((disposer) => disposer());
            disposers.length = 0;
        },
    };
}

export { Utils };
export default Utils;
