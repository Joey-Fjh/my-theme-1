/** @type {Map<string, Promise<typeof Swiper>>} */
const loadPromises = new Map();

/**
 * Load the classic Swiper UMD bundle once. Resolves with `window.Swiper`.
 * @param {string} scriptUrl - Absolute URL from a `data-swiper-src` attribute.
 */
export function loadSwiper(scriptUrl) {
    if (!scriptUrl) {
        return Promise.reject(new Error('loadSwiper requires a script URL'));
    }

    if (typeof window !== 'undefined' && window.Swiper) {
        return Promise.resolve(window.Swiper);
    }

    const cached = loadPromises.get(scriptUrl);
    if (cached) return cached;

    const loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => {
            if (window.Swiper) {
                resolve(window.Swiper);
            } else {
                reject(new Error('Swiper did not attach to window'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load Swiper script'));
        document.head.appendChild(script);
    });
    loadPromises.set(scriptUrl, loadPromise);

    return loadPromise;
}

/**
 * @param {HTMLElement} el
 * @param {object} options
 */
export async function createSwiper(el, options) {
    const SwiperCtor = window.Swiper;
    if (!SwiperCtor) {
        throw new Error('Swiper is not loaded; call loadSwiper first');
    }
    return new SwiperCtor(el, options);
}

/**
 * @param {import('swiper').Swiper | null | undefined} instance
 */
export function destroySwiper(instance) {
    if (instance?.destroy) {
        instance.destroy(true, true);
    }
}
