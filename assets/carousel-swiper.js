/** @type {Map<string, Promise<typeof Swiper>>} */
const scriptLoadPromises = new Map();

function loadSwiperScript(scriptUrl) {
    let scriptPromise = scriptLoadPromises.get(scriptUrl);
    if (scriptPromise) return scriptPromise;

    scriptPromise = (async () => {
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

    scriptLoadPromises.set(scriptUrl, scriptPromise);
    return scriptPromise;
}

/**
 * Load Swiper script once per URL.
 * @param {string} scriptUrl - Absolute URL from `data-swiper-src`.
 */
export function loadSwiper(scriptUrl) {
    if (!scriptUrl) {
        return Promise.reject(new Error('loadSwiper requires a script URL'));
    }

    return loadSwiperScript(scriptUrl);
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
