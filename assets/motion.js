(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        window.__Theme__.Motion = null;
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const Motion = {
        /**
         * Scroll-triggered reveal animation for a set of elements.
         *
         * @param {HTMLElement} el - Container element (used as scrollTrigger trigger and gsap.context scope).
         * @param {object}      [options]
         * @param {string}      [options.selector='[data-gsap-card]'] - Selector for target elements inside el.
         * @param {string}      [options.axis='y']          - 'y' or 'x'.
         * @param {number}      [options.from=30]           - Start offset on the chosen axis.
         * @param {number}      [options.to=0]              - End offset on the chosen axis.
         * @param {number}      [options.duration=0.8]      - Animation duration in seconds.
         * @param {number|object} [options.stagger=0]       - gsap stagger value.
         * @param {string}      [options.ease='power2.out'] - gsap ease string.
         * @param {string}      [options.scrollTriggerStart='top 80%'] - ScrollTrigger start position.
         * @param {boolean}     [options.once=true]          - Whether the animation fires only once.
         *
         * @returns {{ ctx: gsap.context, timeline: gsap.core.Tween | gsap.core.Timeline }}
         *   Caller MUST call ctx.revert() in destroy().
         */
        scrollReveal(el, options = {}) {
            const selector = options.selector || '[data-gsap-card]';
            const axis = options.axis || 'y';
            const from = options.from ?? 30;
            const to = options.to ?? 0;
            const duration = options.duration ?? 0.8;
            const stagger = options.stagger ?? 0;
            const ease = options.ease || 'power2.out';
            const scrollTriggerStart = options.scrollTriggerStart || 'top 80%';
            const once = options.once !== undefined ? options.once : true;

            const targets = el.querySelectorAll(selector);
            if (!targets.length) {
                const ctx = gsap.context(() => {}, el);
                return { ctx, timeline: gsap.timeline() };
            }

            const fromVars = { opacity: 0 };
            const toVars = { opacity: 1 };
            fromVars[axis] = from;
            toVars[axis] = to;

            var tl;

            const ctx = gsap.context(() => {
                gsap.set(targets, fromVars);

                tl = gsap.to(
                    targets,
                    Object.assign({}, toVars, {
                        duration: duration,
                        stagger: stagger,
                        ease: ease,
                        scrollTrigger: {
                            trigger: el,
                            start: scrollTriggerStart,
                            once: once,
                        },
                    }),
                );
            }, el);

            return { ctx, timeline: tl };
        },

        /**
         * Hero reveal animation: fades/translates a hero element and scales in a badge.
         *
         * @param {HTMLElement} el - Container element (used as gsap.context scope).
         * @param {object}      [options]
         * @param {string}      [options.heroSelector='[data-gsap-hero]']   - Selector for the hero element.
         * @param {string}      [options.badgeSelector='[data-gsap-badge]'] - Selector for the badge element.
         * @param {number}      [options.heroDuration=0.8]   - Hero animation duration in seconds.
         * @param {string}      [options.heroEase='power2.out'] - Hero animation ease.
         * @param {number}      [options.badgeDuration=0.6]  - Badge animation duration in seconds.
         * @param {number}      [options.badgeDelay=0.3]     - Badge animation delay in seconds.
         * @param {string}      [options.badgeEase='back.out(1.7)'] - Badge animation ease.
         *
         * @returns {{ ctx: gsap.context, timeline: gsap.core.Timeline }}
         *   Caller MUST call ctx.revert() in destroy().
         */
        heroReveal(el, options = {}) {
            const heroSelector = options.heroSelector || '[data-gsap-hero]';
            const badgeSelector = options.badgeSelector || '[data-gsap-badge]';
            const heroDuration = options.heroDuration ?? 0.8;
            const heroEase = options.heroEase || 'power2.out';
            const badgeDuration = options.badgeDuration ?? 0.6;
            const badgeDelay = options.badgeDelay ?? 0.3;
            const badgeEase = options.badgeEase || 'back.out(1.7)';

            const heroEl = el.querySelector(heroSelector);
            const badgeEl = el.querySelector(badgeSelector);

            var tl;

            const ctx = gsap.context(() => {
                tl = gsap.timeline();

                if (heroEl) {
                    tl.to(heroEl, {
                        opacity: 1,
                        x: 0,
                        duration: heroDuration,
                        ease: heroEase,
                    });
                }

                if (badgeEl) {
                    tl.to(
                        badgeEl,
                        {
                            opacity: 1,
                            scale: 1,
                            duration: badgeDuration,
                            ease: badgeEase,
                        },
                        badgeDelay,
                    );
                }
            }, el);

            return { ctx, timeline: tl };
        },
    };

    window.__Theme__.Motion = Motion;
})();
