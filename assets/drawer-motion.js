(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};

    const ENTER_ANIMATION_NAMES = new Set([
        'drawer-motion-slide-right-enter',
        'drawer-motion-slide-left-enter',
        'drawer-motion-sheet-enter',
        'drawer-motion-fade-enter',
    ]);
    const EXIT_ANIMATION_NAMES = new Set([
        'drawer-motion-slide-right-exit',
        'drawer-motion-slide-left-exit',
        'drawer-motion-sheet-exit',
        'drawer-motion-fade-exit',
    ]);

    const SHEET_MEDIA_QUERY = '(max-width: 47.999rem)';

    function DialogMotion() {
        return window.__Theme__.DialogMotion;
    }

    function shouldReduceMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function getRoot(rootOrId) {
        if (rootOrId instanceof Element) return rootOrId;
        if (typeof rootOrId !== 'string' || !rootOrId.trim()) return null;
        return document.querySelector(
            '[data-dialog-root][data-dialog-id="' + CSS.escape(rootOrId.trim()) + '"]',
        );
    }

    function getMotionTarget(root) {
        if (!root) return null;
        return root.querySelector('[data-drawer-motion-target]');
    }

    function getBackdrop(root) {
        if (!root) return null;
        return root.querySelector('[data-drawer-motion-backdrop]');
    }

    function hasMotion(root) {
        if (!root) return false;
        return root.hasAttribute('data-drawer-motion');
    }

    function resolveEdge(root) {
        const slide = root.dataset.drawerMotionSlide === 'left' ? 'left' : 'right';
        if (
            root.hasAttribute('data-drawer-motion-sheet-below-pc') &&
            window.matchMedia(SHEET_MEDIA_QUERY).matches
        ) {
            return 'sheet';
        }
        return slide;
    }

    function lockScroll() {
        const motion = DialogMotion();
        if (motion && typeof motion.lockScroll === 'function') {
            motion.lockScroll();
            return;
        }
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    function unlockScroll() {
        const motion = DialogMotion();
        if (motion && typeof motion.unlockScroll === 'function') {
            motion.unlockScroll();
            return;
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }

    function clearMotionState(target, backdrop) {
        if (target) {
            target.removeAttribute('data-drawer-motion');
            target.removeAttribute('data-drawer-motion-prep');
            target.style.animation = '';
            target.style.willChange = '';
        }
        if (backdrop) {
            backdrop.removeAttribute('data-drawer-motion-state');
        }
    }

    function setBackdropPrep(backdrop) {
        if (backdrop) {
            backdrop.setAttribute('data-drawer-motion-state', 'prep');
        }
    }

    function waitForFrame() {
        return new Promise(function (resolve) {
            requestAnimationFrame(resolve);
        });
    }

    function waitForVisible(el, maxAttempts) {
        const limit = Math.max(4, Number(maxAttempts) || 20);

        return new Promise(function (resolve) {
            let attempts = 0;

            function tick() {
                if (!el || !el.isConnected) {
                    resolve();
                    return;
                }

                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    resolve();
                    return;
                }

                attempts += 1;
                if (attempts >= limit) {
                    resolve();
                    return;
                }

                requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        });
    }

    function readDurationMs(tokenName, fallback) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
        if (!raw) return fallback;
        if (raw.endsWith('ms')) return Number.parseFloat(raw) || fallback;
        if (raw.endsWith('s')) return (Number.parseFloat(raw) || fallback / 1000) * 1000;
        const parsed = Number.parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function getEnterDurationMs() {
        if (shouldReduceMotion()) return 200;
        return readDurationMs('--drawer-motion-duration-enter', 440);
    }

    function getExitDurationMs() {
        if (shouldReduceMotion()) return 180;
        return readDurationMs('--drawer-motion-duration-exit', 440);
    }

    function waitForAnimation(target, allowedNames, fallbackMs) {
        const allowed = allowedNames instanceof Set ? allowedNames : new Set(allowedNames);

        return new Promise(function (resolve) {
            let settled = false;

            function done(event) {
                if (settled) return;
                if (event && event.animationName && !allowed.has(event.animationName)) return;

                settled = true;
                target.removeEventListener('animationend', done);
                resolve();
            }

            target.addEventListener('animationend', done);
            window.setTimeout(function () {
                done();
            }, fallbackMs + 80);
        });
    }

    function restartAnimation(target, backdrop) {
        if (target) {
            target.style.animation = 'none';
            void target.offsetWidth;
            target.style.animation = '';
            target.removeAttribute('data-drawer-motion');
        }
        if (backdrop) {
            backdrop.removeAttribute('data-drawer-motion-state');
        }
    }

    function beginEnterAnimation(target, backdrop) {
        target.removeAttribute('data-drawer-motion-prep');
        target.setAttribute('data-drawer-motion', 'enter');
        if (backdrop) {
            backdrop.setAttribute('data-drawer-motion-state', 'enter');
        }
    }

    function playEnter(rootOrId, options) {
        const root = getRoot(rootOrId);
        if (!root || !hasMotion(root)) return Promise.resolve();

        const target = getMotionTarget(root);
        const backdrop = getBackdrop(root);
        if (!target) return Promise.resolve();

        const visibilityTarget = root.querySelector('[data-dialog-panel]') || target;
        const shouldLock = options && options.lockScroll !== false;

        clearMotionState(target, backdrop);
        target.setAttribute('data-drawer-motion-prep', '');
        setBackdropPrep(backdrop);
        target.style.willChange = 'transform, opacity';

        return waitForVisible(visibilityTarget)
            .then(function () {
                if (shouldLock) lockScroll();

                beginEnterAnimation(target, backdrop);
                void target.offsetWidth;

                return waitForAnimation(target, ENTER_ANIMATION_NAMES, getEnterDurationMs());
            })
            .then(function () {
                if (target) target.style.willChange = '';
            });
    }

    function playExit(rootOrId) {
        const root = getRoot(rootOrId);
        if (!root || !hasMotion(root)) return Promise.resolve();

        const target = getMotionTarget(root);
        const backdrop = getBackdrop(root);
        if (!target) return Promise.resolve();

        void resolveEdge(root);

        return waitForFrame()
            .then(function () {
                restartAnimation(target, backdrop);
                target.style.willChange = 'transform, opacity';

                return waitForFrame();
            })
            .then(function () {
                if (backdrop) backdrop.setAttribute('data-drawer-motion-state', 'exit');
                target.setAttribute('data-drawer-motion', 'exit');

                return waitForAnimation(target, EXIT_ANIMATION_NAMES, getExitDurationMs());
            })
            .then(function () {
                clearMotionState(target, backdrop);
            });
    }

    window.__Theme__.DrawerMotion = {
        shouldReduceMotion,
        hasMotion,
        resolveEdge,
        lockScroll,
        unlockScroll,
        playEnter,
        playExit,
        getEnterDurationMs,
        getExitDurationMs,
        clearMotionState,
    };
})();
