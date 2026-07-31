(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};

    const ENTER_ANIMATION_NAMES = new Set([
        'dialog-motion-dock-enter',
        'dialog-motion-edge-br-enter',
        'dialog-motion-edge-bl-enter',
        'dialog-motion-fade',
    ]);
    const EXIT_ANIMATION_NAMES = new Set([
        'dialog-motion-dock-exit',
        'dialog-motion-edge-br-exit',
        'dialog-motion-edge-bl-exit',
        'dialog-motion-fade-exit',
    ]);

    let scrollLockCount = 0;
    let scrollLockSnapshot = null;

    function shouldReduceMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function clampScale(value, min, max) {
        if (!Number.isFinite(value) || value <= 0) return min;
        return Math.min(Math.max(value, min), max);
    }

    function isValidMotionTrigger(el) {
        if (!(el instanceof Element) || !el.isConnected) return false;
        if (el === document.body || el === document.documentElement) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
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
        return root.querySelector('[data-dialog-motion-target]');
    }

    function getBackdrop(root) {
        if (!root) return null;
        return root.querySelector('[data-dialog-motion-backdrop]');
    }

    function hasMotion(root) {
        if (!root) return false;
        const mode = root.dataset.dialogMotionMode;
        return mode === 'origin' || mode === 'edge';
    }

    function lockScroll() {
        scrollLockCount += 1;
        if (scrollLockCount > 1) return;

        scrollLockSnapshot = {
            htmlOverflow: document.documentElement.style.overflow,
            bodyOverflow: document.body.style.overflow,
        };

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    }

    function unlockScroll() {
        if (scrollLockCount <= 0) return;

        scrollLockCount -= 1;
        if (scrollLockCount > 0 || !scrollLockSnapshot) return;

        document.documentElement.style.overflow = scrollLockSnapshot.htmlOverflow;
        document.body.style.overflow = scrollLockSnapshot.bodyOverflow;
        scrollLockSnapshot = null;
    }

    function computeDockVars(triggerRect, targetRect) {
        const triggerCenterX = triggerRect.left + triggerRect.width / 2;
        const triggerCenterY = triggerRect.top + triggerRect.height / 2;
        const originX = triggerCenterX - targetRect.left;
        const originY = triggerCenterY - targetRect.top;
        const fitScaleX = triggerRect.width / targetRect.width;
        const fitScaleY = triggerRect.height / targetRect.height;

        return {
            originX,
            originY,
            fromScaleX: clampScale(fitScaleX, 0.06, 1),
            fromScaleY: clampScale(Math.min(fitScaleY, 0.1), 0.03, 0.1),
        };
    }

    function applyDockVars(target, vars) {
        target.style.transformOrigin = vars.originX + 'px ' + vars.originY + 'px';
        target.style.setProperty('--from-scale-x', String(vars.fromScaleX));
        target.style.setProperty('--from-scale-y', String(vars.fromScaleY));
    }

    function clearMotionState(target, backdrop) {
        if (target) {
            target.removeAttribute('data-dialog-motion');
            target.removeAttribute('data-dialog-motion-prep');
            target.style.animation = '';
            target.style.willChange = '';
        }
        if (backdrop) {
            backdrop.removeAttribute('data-dialog-motion-state');
        }
    }

    function setBackdropPrep(backdrop) {
        if (backdrop) {
            backdrop.setAttribute('data-dialog-motion-state', 'prep');
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

    function getEnterDurationMs(root) {
        if (shouldReduceMotion()) return 200;
        if (root.dataset.dialogMotionMode === 'edge') {
            return readDurationMs('--dialog-motion-duration-edge-enter', 380);
        }
        return readDurationMs('--dialog-motion-duration-enter', 440);
    }

    function getExitDurationMs(root) {
        if (shouldReduceMotion()) return 180;
        if (root.dataset.dialogMotionMode === 'edge') {
            return readDurationMs('--dialog-motion-duration-edge-exit', 320);
        }
        return readDurationMs('--dialog-motion-duration-exit', 440);
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
            target.removeAttribute('data-dialog-motion');
        }
        if (backdrop) {
            backdrop.removeAttribute('data-dialog-motion-state');
        }
    }

    function measureOrigin(target, trigger) {
        if (!isValidMotionTrigger(trigger)) return;
        const vars = computeDockVars(
            trigger.getBoundingClientRect(),
            target.getBoundingClientRect(),
        );
        applyDockVars(target, vars);
    }

    function beginEnterAnimation(target, backdrop) {
        target.removeAttribute('data-dialog-motion-prep');
        target.setAttribute('data-dialog-motion', 'enter');
        if (backdrop) {
            backdrop.setAttribute('data-dialog-motion-state', 'enter');
        }
    }

    function playEnter(rootOrId, options) {
        const root = getRoot(rootOrId);
        if (!root || !hasMotion(root)) return Promise.resolve();

        const target = getMotionTarget(root);
        const backdrop = getBackdrop(root);
        if (!target) return Promise.resolve();

        const mode = root.dataset.dialogMotionMode;
        const trigger = options && options.trigger;
        const visibilityTarget = root.querySelector('[data-dialog-panel]') || target;
        const shouldLock = options && options.lockScroll !== false;

        clearMotionState(target, backdrop);
        target.setAttribute('data-dialog-motion-prep', '');
        setBackdropPrep(backdrop);
        target.style.willChange = 'transform, opacity';

        return waitForVisible(visibilityTarget)
            .then(function () {
                if (shouldLock) lockScroll();

                if (mode === 'origin') {
                    measureOrigin(target, trigger);
                }

                beginEnterAnimation(target, backdrop);
                void target.offsetWidth;

                if (options && typeof options.onEnterStart === 'function') {
                    try {
                        options.onEnterStart();
                    } catch (error) {
                        console.error('[DialogMotion] onEnterStart failed', error);
                    }
                }

                return waitForAnimation(target, ENTER_ANIMATION_NAMES, getEnterDurationMs(root));
            })
            .then(function () {
                if (target) target.style.willChange = '';
            });
    }

    function playExit(rootOrId, options) {
        const root = getRoot(rootOrId);
        if (!root || !hasMotion(root)) return Promise.resolve();

        const target = getMotionTarget(root);
        const backdrop = getBackdrop(root);
        if (!target) return Promise.resolve();

        const mode = root.dataset.dialogMotionMode;
        const trigger = options && options.trigger;

        return waitForFrame()
            .then(function () {
                if (mode === 'origin') {
                    measureOrigin(target, trigger);
                }

                restartAnimation(target, backdrop);
                target.style.willChange = 'transform, opacity';

                return waitForFrame();
            })
            .then(function () {
                if (backdrop) backdrop.setAttribute('data-dialog-motion-state', 'exit');
                target.setAttribute('data-dialog-motion', 'exit');

                return waitForAnimation(target, EXIT_ANIMATION_NAMES, getExitDurationMs(root));
            })
            .then(function () {
                clearMotionState(target, backdrop);
            });
    }

    window.__Theme__.DialogMotion = {
        shouldReduceMotion,
        hasMotion,
        lockScroll,
        unlockScroll,
        playEnter,
        playExit,
        getEnterDurationMs,
        getExitDurationMs,
        clearMotionState,
    };
})();
