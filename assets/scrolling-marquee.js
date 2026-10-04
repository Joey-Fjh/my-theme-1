import { define } from 'alpine-adapter';
import { subscribeScrollVelocity, useDisposable } from 'utils';

const VELOCITY_K = 0.12;
const MAX_PLAYBACK_RATE = 4;
const SCROLL_STOP_MS = 800;
const RATE_EASE = 0.18;
const RATE_EPSILON = 0.01;

function motionEnabled() {
    if (document.body?.dataset?.motionEnabled === 'false') return false;
    if (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        return false;
    }
    return true;
}

class ScrollingMarqueeInstance {
    constructor(root, disposable) {
        this._root = root;
        this._disposable = disposable;
        this._marquee = root.querySelector('.scrolling-icon-with-text__marquee');
        this._track = root.querySelector('.scrolling-icon-with-text__track');
        this._pauseButton = root.querySelector('[data-scrolling-marquee-pause]');
        this._observer = null;
        this._visible = false;
        this._targetRate = 1;
        this._currentRate = 1;
        this._scrollStopTimer = null;
        this._rateRaf = 0;
        this._unsubscribeScroll = null;
        this._hoverPaused = false;
        this._focusPaused = false;
    }

    mount() {
        if (!this._marquee || !this._track) return;

        this._syncVisibleState();

        this._observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                this._visible = Boolean(entry?.isIntersecting);
                if (!this._visible) {
                    this._targetRate = 1;
                    this._currentRate = 1;
                    this._applyPlaybackRate(1);
                    this._stopRateLoop();
                }
            },
            { root: null, threshold: 0 },
        );
        this._observer.observe(this._root);

        if (this._marquee.dataset.scrollingPauseOnHover === 'true') {
            this._disposable.on(this._marquee, 'pointerenter', (event) => {
                if (event.pointerType === 'mouse') {
                    this._hoverPaused = true;
                }
            });
            this._disposable.on(this._marquee, 'pointerleave', (event) => {
                if (event.pointerType === 'mouse') {
                    this._hoverPaused = false;
                }
            });
        }

        this._disposable.on(this._marquee, 'focusin', () => {
            this._focusPaused = true;
        });
        this._disposable.on(this._marquee, 'focusout', () => {
            this._focusPaused = false;
        });

        if (this._pauseButton) {
            this._disposable.on(this._pauseButton, 'click', () => this._togglePause());
        }

        this._unsubscribeScroll = subscribeScrollVelocity((velocity) => {
            this._onSharedScroll(velocity);
        });
    }

    _syncVisibleState() {
        if (!this._root) return;
        const rect = this._root.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        this._visible = rect.bottom > 0 && rect.top < viewHeight;
    }

    destroy() {
        if (this._scrollStopTimer) {
            clearTimeout(this._scrollStopTimer);
            this._scrollStopTimer = null;
        }
        this._stopRateLoop();
        this._unsubscribeScroll?.();
        this._unsubscribeScroll = null;
        this._observer?.disconnect();
        this._observer = null;
        this._applyPlaybackRate(1);
        this._root = null;
        this._marquee = null;
        this._track = null;
        this._pauseButton = null;
    }

    _onSharedScroll(velocity) {
        if (!motionEnabled() || !this._visible) return;
        if (!this._shouldModulateRate()) return;

        const nextTarget = Math.min(MAX_PLAYBACK_RATE, 1 + VELOCITY_K * Math.abs(velocity));
        this._targetRate = nextTarget;
        this._ensureRateLoop();

        if (this._scrollStopTimer) {
            clearTimeout(this._scrollStopTimer);
        }
        this._scrollStopTimer = setTimeout(() => {
            this._targetRate = 1;
            this._scrollStopTimer = null;
            this._ensureRateLoop();
        }, SCROLL_STOP_MS);
    }

    _ensureRateLoop() {
        if (this._rateRaf) return;
        if (!this._needsRateLoop()) return;
        this._rateRaf = requestAnimationFrame(() => this._rateTick());
    }

    _stopRateLoop() {
        if (this._rateRaf) {
            cancelAnimationFrame(this._rateRaf);
            this._rateRaf = 0;
        }
    }

    _needsRateLoop() {
        if (!this._track || !this._visible || !motionEnabled()) return false;
        if (!this._shouldModulateRate()) return false;
        return (
            Math.abs(this._currentRate - 1) > RATE_EPSILON ||
            Math.abs(this._targetRate - 1) > RATE_EPSILON
        );
    }

    _rateTick() {
        this._rateRaf = 0;
        if (!this._track) return;

        if (!this._needsRateLoop()) {
            if (this._currentRate !== 1) {
                this._currentRate = 1;
                this._applyPlaybackRate(1);
            }
            return;
        }

        const delta = this._targetRate - this._currentRate;
        if (Math.abs(delta) < RATE_EPSILON) {
            this._currentRate = this._targetRate;
        } else {
            this._currentRate += delta * RATE_EASE;
            if (Math.abs(this._targetRate - this._currentRate) < RATE_EPSILON) {
                this._currentRate = this._targetRate;
            }
        }
        this._applyPlaybackRate(this._currentRate);

        if (this._needsRateLoop()) {
            this._rateRaf = requestAnimationFrame(() => this._rateTick());
        }
    }

    _shouldModulateRate() {
        if (!motionEnabled() || !this._visible) return false;
        if (this._marquee?.dataset?.paused === 'true') return false;
        if (this._hoverPaused || this._focusPaused) return false;
        const animation = this._track?.getAnimations?.()[0];
        if (animation?.playState === 'paused') return false;
        return true;
    }

    _applyPlaybackRate(rate) {
        const track = this._track;
        if (!track) return;
        const animation = track.getAnimations()[0];
        if (!animation) return;
        const clamped = Math.max(0, Math.min(MAX_PLAYBACK_RATE, Number(rate) || 1));
        animation.updatePlaybackRate(clamped);
    }

    _togglePause() {
        const marquee = this._marquee;
        const button = this._pauseButton;
        if (!marquee || !button) return;

        const isPaused = marquee.dataset.paused === 'true';
        const nextPaused = !isPaused;
        if (nextPaused) {
            marquee.dataset.paused = 'true';
        } else {
            delete marquee.dataset.paused;
        }
        button.setAttribute('aria-pressed', nextPaused ? 'true' : 'false');
    }
}

define('scrollingMarquee', () => ({
    ...useDisposable(),
    _instance: null,

    init() {
        this._instance = new ScrollingMarqueeInstance(this.$el, this);
        this._instance.mount();
    },

    destroy() {
        if (this._instance) {
            this._instance.destroy();
            this._instance = null;
        }
        this.dispose();
    },
}));
