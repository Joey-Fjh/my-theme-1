/** @type {Map<string, Promise<{ gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }>>} */
const loadPromises = new Map();

function loadClassicScript(scriptUrl) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${scriptUrl}`));
        document.head.appendChild(script);
    });
}

/**
 * Load GSAP core and ScrollTrigger once per URL pair.
 * @param {string} gsapUrl - Absolute URL from `data-gsap-src`.
 * @param {string} scrollTriggerUrl - Absolute URL from `data-scrolltrigger-src`.
 */
export function loadGsap(gsapUrl, scrollTriggerUrl) {
    if (!gsapUrl || !scrollTriggerUrl) {
        return Promise.reject(new Error('loadGsap requires gsap and ScrollTrigger URLs'));
    }

    const key = `${gsapUrl}|${scrollTriggerUrl}`;
    let promise = loadPromises.get(key);
    if (promise) return promise;

    promise = (async () => {
        if (typeof window.gsap === 'undefined') {
            await loadClassicScript(gsapUrl);
        }
        if (typeof window.gsap === 'undefined') {
            throw new Error('GSAP did not attach to window');
        }
        if (typeof window.ScrollTrigger === 'undefined') {
            await loadClassicScript(scrollTriggerUrl);
        }
        if (typeof window.ScrollTrigger === 'undefined') {
            throw new Error('ScrollTrigger did not attach to window');
        }
        window.gsap.registerPlugin(window.ScrollTrigger);
        return { gsap: window.gsap, ScrollTrigger: window.ScrollTrigger };
    })();

    loadPromises.set(key, promise);
    return promise;
}
