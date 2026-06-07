(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        window.__Theme__.Motion = null;
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /** @returns {boolean} */
    function isRevealEnabled() {
        var body = document.body;
        return body ? body.dataset.revealOnScroll !== 'false' : true;
    }

    var Motion = {
        isRevealEnabled: isRevealEnabled,

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
        scrollReveal: function scrollReveal(el, options) {
            options = options || {};

            var targets = el.querySelectorAll(options.selector || '[data-gsap-card]');
            var ctx = gsap.context(function () {}, el);

            if (!targets.length) {
                return { ctx: ctx, timeline: gsap.timeline() };
            }

            if (!isRevealEnabled()) {
                gsap.set(targets, { opacity: 1, x: 0, y: 0 });
                return { ctx: ctx, timeline: gsap.timeline() };
            }

            var axis = options.axis || 'y';
            var from = options.from != null ? options.from : 30;
            var to = options.to != null ? options.to : 0;
            var duration = options.duration != null ? options.duration : 0.8;
            var stagger = options.stagger != null ? options.stagger : 0;
            var ease = options.ease || 'power2.out';
            var scrollTriggerStart = options.scrollTriggerStart || 'top 80%';
            var once = options.once !== undefined ? options.once : true;

            var fromVars = { opacity: 0 };
            var toVars = { opacity: 1 };
            fromVars[axis] = from;
            toVars[axis] = to;

            var tl;

            ctx = gsap.context(function () {
                var mm = gsap.matchMedia();

                mm.add('(prefers-reduced-motion: no-preference)', function () {
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
                });

                mm.add('(prefers-reduced-motion: reduce)', function () {
                    gsap.set(targets, { opacity: 1 });
                    gsap.set(
                        targets,
                        (function () {
                            var o = { opacity: 1 };
                            o[axis] = to;
                            return o;
                        })(),
                    );
                });
            }, el);

            return { ctx: ctx, timeline: tl };
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
        heroReveal: function heroReveal(el, options) {
            options = options || {};

            var heroSelector = options.heroSelector || '[data-gsap-hero]';
            var badgeSelector = options.badgeSelector || '[data-gsap-badge]';
            var heroDuration = options.heroDuration != null ? options.heroDuration : 0.8;
            var heroEase = options.heroEase || 'power2.out';
            var badgeDuration = options.badgeDuration != null ? options.badgeDuration : 0.6;
            var badgeDelay = options.badgeDelay != null ? options.badgeDelay : 0.3;
            var badgeEase = options.badgeEase || 'back.out(1.7)';

            var heroEl = el.querySelector(heroSelector);
            var badgeEl = el.querySelector(badgeSelector);
            var ctx = gsap.context(function () {}, el);

            var tl;

            if (!isRevealEnabled()) {
                ctx = gsap.context(function () {
                    if (heroEl) {
                        gsap.set(heroEl, { opacity: 1, x: 0 });
                    }
                    if (badgeEl) {
                        gsap.set(badgeEl, { opacity: 1, scale: 1 });
                    }
                }, el);
                return { ctx: ctx, timeline: gsap.timeline() };
            }

            ctx = gsap.context(function () {
                var mm = gsap.matchMedia();

                mm.add('(prefers-reduced-motion: no-preference)', function () {
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
                });

                mm.add('(prefers-reduced-motion: reduce)', function () {
                    if (heroEl) {
                        gsap.set(heroEl, { opacity: 1, x: 0 });
                    }
                    if (badgeEl) {
                        gsap.set(badgeEl, { opacity: 1, scale: 1 });
                    }
                });
            }, el);

            return { ctx: ctx, timeline: tl };
        },
    };

    window.__Theme__.Motion = Motion;
})();
