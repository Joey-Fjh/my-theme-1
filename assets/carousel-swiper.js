/** @type {Map<string, Promise<typeof Swiper>>} */
const loadPromises = new Map();

/** @type {Map<string, Promise<void>>} */
const cssLoadPromises = new Map();

function loadStylesheet(cssUrl) {
    if (!cssUrl) {
        return Promise.resolve();
    }

    if (typeof document !== 'undefined') {
        const existing = document.querySelector(
            `link[data-swiper-css-url="${CSS.escape(cssUrl)}"]`,
        );
        if (existing) {
            return Promise.resolve();
        }
    }

    const cached = cssLoadPromises.get(cssUrl);
    if (cached) return cached;

    const loadPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        link.dataset.swiperCssUrl = cssUrl;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error('Failed to load Swiper CSS'));
        document.head.appendChild(link);
    });

    cssLoadPromises.set(cssUrl, loadPromise);
    return loadPromise;
}

/**
 * Load Swiper script and optional stylesheet once per URL.
 * @param {string} scriptUrl - Absolute URL from `data-swiper-src`.
 * @param {string} [cssUrl] - Absolute URL from `data-swiper-css`.
 */
export function loadSwiper(scriptUrl, cssUrl) {
    if (!scriptUrl) {
        return Promise.reject(new Error('loadSwiper requires a script URL'));
    }

    const cacheKey = `${scriptUrl}\0${cssUrl || ''}`;
    const cached = loadPromises.get(cacheKey);
    if (cached) return cached;

    const loadPromise = (async () => {
        await loadStylesheet(cssUrl);

        if (typeof window !== 'undefined' && window.Swiper) {
            return window.Swiper;
        }

        await new Promise((resolve, reject) => {
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

        return window.Swiper;
    })();

    loadPromises.set(cacheKey, loadPromise);
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
