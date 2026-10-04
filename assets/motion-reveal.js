import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';

/**
 * List/card cascade motion (settings-driven via motion_enabled on body).
 *
 * Contract:
 * - [data-motion-section] owns lifecycle on section-frame or nested cascade roots
 * - [data-motion-cascade] marks a grid/list; direct row items use [data-motion-bound]
 * - [data-motion-state] pending | revealed is set on each bound item
 * - Plays once per page view; no replay on re-enter
 */
const MOTION_CASCADE_ROW_TOLERANCE_PX = 8;
const MOTION_CASCADE_MAX_STAGGER_WINDOW_MS = 500;
const MOTION_PAGE_LOAD_BASE_DELAY_MS = 48;
const MOTION_RELAYOUT_DEBOUNCE_MS = 150;
const MOTION_SCROLL_SETTLE_MS = 160;

function createMotionObserverRegistry(rootMargin) {
    const callbacks = new WeakMap();
    let observer = null;

    function getObserver() {
        if (observer) return observer;
        if (!('IntersectionObserver' in window)) return null;

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const cb = callbacks.get(entry.target);
                    if (cb) cb(entry);
                });
            },
            { rootMargin, threshold: 0 },
        );
        return observer;
    }

    return {
        observe(el, cb) {
            const obs = getObserver();
            if (!obs) {
                cb({ isIntersecting: true });
                return;
            }
            callbacks.set(el, cb);
            obs.observe(el);
        },

        unobserve(el) {
            if (observer) observer.unobserve(el);
            callbacks.delete(el);
        },
    };
}

const cascadeEnterRegistry = createMotionObserverRegistry('0px 0px -15% 0px');

define('motionRevealSection', () => {
    const enterRegistry = cascadeEnterRegistry;
    return {
        ...useDisposable(),
        _cascadeBatches: new Map(),
        _cascadeEnterObserved: new Set(),
        _pageLoadTimers: new Map(),
        _pageLoadQueue: new Set(),
        _motionFrames: new Set(),
        _deferToPageLoadFlush: false,
        _cleanupEditor: null,
        _onTabClick: null,
        _onSwiperRelayout: null,
        _relayoutTimer: null,
        _editorReplayTimers: new Set(),
        _editorViewportFlushFrame: null,
        _windowResizeTimer: null,
        _windowScrollSettleTimer: null,
        _registrationGeneration: 0,
        _destroyed: false,

        _requestMotionFrame(callback, generation = this._registrationGeneration) {
            if (this._destroyed) return null;

            const frameId = requestAnimationFrame(() => {
                this._motionFrames.delete(frameId);
                if (this._destroyed || generation !== this._registrationGeneration) {
                    return;
                }
                callback();
            });
            this._motionFrames.add(frameId);
            return frameId;
        },

        _cancelMotionFrames() {
            this._motionFrames.forEach((frameId) => cancelAnimationFrame(frameId));
            this._motionFrames.clear();
            this._editorViewportFlushFrame = null;
        },

        _invalidateRegistrationWork() {
            this._registrationGeneration += 1;
            this._cancelMotionFrames();
            return this._registrationGeneration;
        },

        _shouldSkipAnimation() {
            if (document.body.dataset.motionEnabled === 'false') return true;
            if (
                typeof window.matchMedia === 'function' &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ) {
                return true;
            }
            if (!('IntersectionObserver' in window)) return true;
            return false;
        },

        _ownsElement(el) {
            if (!(el instanceof Element) || !this.$el.contains(el)) return false;
            const sectionRoot = el.closest('[data-motion-section]');
            if (!sectionRoot) return this.$el.contains(el);
            return sectionRoot === this.$el || this.$el.contains(sectionRoot);
        },

        _queryOwnedCascadeContainers() {
            const containers = [];
            if (this.$el.matches('[data-motion-cascade]')) {
                containers.push(this.$el);
            }
            containers.push(...this.$el.querySelectorAll('[data-motion-cascade]'));
            return containers.filter((container) => this._ownsElement(container));
        },

        _queryOwnedCascadeTargets() {
            const targets = [];
            this._queryOwnedCascadeContainers().forEach((container) => {
                container.querySelectorAll('[data-motion-bound]').forEach((bound) => {
                    if (this._ownsElement(bound)) targets.push(bound);
                });
            });
            return targets;
        },

        _isTargetVisible(target) {
            if (!(target instanceof Element)) return false;

            let el = target;
            while (el && el !== document.documentElement) {
                if (el instanceof HTMLElement) {
                    const style = window.getComputedStyle(el);
                    if (style.display === 'none' || style.visibility === 'hidden') {
                        return false;
                    }
                }
                el = el.parentElement;
            }

            return true;
        },

        _isClipVisible(el) {
            if (!(el instanceof Element)) return false;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;

            let parent = el.parentElement;
            while (parent && parent !== document.documentElement) {
                const style = window.getComputedStyle(parent);
                const overflowX = style.overflowX;
                const overflowY = style.overflowY;
                const clipsX =
                    overflowX === 'hidden' ||
                    overflowX === 'scroll' ||
                    overflowX === 'auto' ||
                    overflowX === 'clip';
                const clipsY =
                    overflowY === 'hidden' ||
                    overflowY === 'scroll' ||
                    overflowY === 'auto' ||
                    overflowY === 'clip';

                if (clipsX || clipsY) {
                    const parentRect = parent.getBoundingClientRect();
                    if (clipsX) {
                        const overlapX =
                            Math.min(rect.right, parentRect.right) -
                            Math.max(rect.left, parentRect.left);
                        if (overlapX <= 1) return false;
                    }
                    if (clipsY) {
                        const overlapY =
                            Math.min(rect.bottom, parentRect.bottom) -
                            Math.max(rect.top, parentRect.top);
                        if (overlapY <= 1) return false;
                    }
                }

                if (parent === this.$el) break;
                parent = parent.parentElement;
            }

            return true;
        },

        _getStaggerMs(source = document.documentElement) {
            const raw = getComputedStyle(source).getPropertyValue('--motion-reveal-stagger').trim();
            if (!raw) return 170;
            if (raw.endsWith('ms')) return parseFloat(raw) || 170;
            if (raw.endsWith('s')) return (parseFloat(raw) || 0) * 1000 || 170;
            return parseFloat(raw) || 170;
        },

        _getLayoutRect(el) {
            if (!(el instanceof Element)) {
                return { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };
            }
            return el.getBoundingClientRect();
        },

        _groupTargetsByRow(targets) {
            const tolerance = MOTION_CASCADE_ROW_TOLERANCE_PX;
            const entries = targets
                .filter((target) => this._isTargetVisible(target))
                .map((target) => {
                    const rect = this._getLayoutRect(target);
                    return { target, top: rect.top, left: rect.left };
                })
                .sort((a, b) => {
                    if (Math.abs(a.top - b.top) > tolerance) return a.top - b.top;
                    return a.left - b.left;
                });

            const rows = [];
            for (const entry of entries) {
                let row = rows.find((r) => Math.abs(r.top - entry.top) <= tolerance);
                if (!row) {
                    row = { top: entry.top, targets: [] };
                    rows.push(row);
                }
                row.targets.push(entry.target);
            }

            return rows;
        },

        _isBoundInInsetViewport(bound) {
            const rect = bound.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;

            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const bottomInset = viewportHeight * 0.15;
            const visibleBottom = viewportHeight - bottomInset;

            return rect.bottom > 0 && rect.top < visibleBottom;
        },

        _isBoundInViewport(bound) {
            const rect = bound.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return false;

            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

            return (
                rect.bottom > 0 &&
                rect.top < viewportHeight &&
                rect.right > 0 &&
                rect.left < viewportWidth
            );
        },

        _isDocumentAtEnd() {
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
            const documentHeight = Math.max(
                document.documentElement.scrollHeight,
                document.body?.scrollHeight || 0,
            );

            return scrollTop + viewportHeight >= documentHeight - 2;
        },

        _releasePageLoadQueue(target) {
            this._pageLoadQueue.delete(target);
        },

        _applyTargetPending(target) {
            target.setAttribute('data-motion-state', 'pending');
        },

        _revealTarget(target) {
            target.setAttribute('data-motion-state', 'revealed');
            this._releasePageLoadQueue(target);

            const timerId = this._pageLoadTimers.get(target);
            if (timerId) {
                clearTimeout(timerId);
                this._pageLoadTimers.delete(target);
            }
        },

        _canRevealTargetNow(target) {
            if (!this._ownsElement(target)) return false;
            if (!this._isTargetVisible(target)) return false;
            if (target.getAttribute('data-motion-state') !== 'pending') return false;
            if (!this._isClipVisible(target)) return false;
            if (!this._isBoundInInsetViewport(target)) return false;
            return true;
        },

        _batchHasPendingRevealWork(batch) {
            return batch.targets.some(
                (target) =>
                    this._isTargetVisible(target) &&
                    target.getAttribute('data-motion-state') === 'pending',
            );
        },

        _maybeCompleteCascadeBatch(batch) {
            if (this._batchHasPendingRevealWork(batch)) return;
            this._unobserveCascadeBatch(batch);
        },

        _scheduleCascadeBatchReveal(batch, baseDelayMs = 0, allowViewportEdge = false) {
            const pending = batch.targets
                .filter(
                    (target) =>
                        this._isTargetVisible(target) &&
                        this._isClipVisible(target) &&
                        target.getAttribute('data-motion-state') === 'pending',
                )
                .sort((a, b) => {
                    const indexA = Number(a.style.getPropertyValue('--motion-index')) || 0;
                    const indexB = Number(b.style.getPropertyValue('--motion-index')) || 0;
                    return indexA - indexB;
                });

            if (!pending.length) {
                this._maybeCompleteCascadeBatch(batch);
                return;
            }

            const staggerMs = this._getStaggerMs(batch.cascade);
            const effectiveStaggerMs =
                pending.length > 1
                    ? Math.min(
                          staggerMs,
                          MOTION_CASCADE_MAX_STAGGER_WINDOW_MS / (pending.length - 1),
                      )
                    : 0;

            pending.forEach((target, batchIndex) => {
                const delay = baseDelayMs + batchIndex * effectiveStaggerMs;
                this._scheduleDelayedReveal(target, delay, batch, allowViewportEdge);
            });
        },

        _unobserveCascadeBatch(batch) {
            batch.enterObserved.forEach((element) => {
                enterRegistry.unobserve(element);
                this._cascadeEnterObserved.delete(element);
            });
            batch.enterObserved.length = 0;
            this._cascadeBatches.delete(batch.triggerBound);
        },

        _observeCascadeEnter(batch, element, handler) {
            enterRegistry.observe(element, handler);
            batch.enterObserved.push(element);
            this._cascadeEnterObserved.add(element);
        },

        _registerCascadeBatch(cascade, targets) {
            const sorted = [...targets].sort((a, b) => {
                const rectA = this._getLayoutRect(a);
                const rectB = this._getLayoutRect(b);
                if (Math.abs(rectA.top - rectB.top) > MOTION_CASCADE_ROW_TOLERANCE_PX) {
                    return rectA.top - rectB.top;
                }
                return rectA.left - rectB.left;
            });
            const triggerBound = sorted[0];
            if (!triggerBound) return;

            if (sorted.every((target) => target.getAttribute('data-motion-state') === 'revealed')) {
                return;
            }

            if (this._cascadeBatches.has(triggerBound)) return;

            sorted.forEach((target) => {
                if (!this._isTargetVisible(target)) return;
                if (target.getAttribute('data-motion-state') === 'revealed') return;
                this._applyTargetPending(target);
            });

            const batch = {
                cascade,
                targets: sorted,
                triggerBound,
                enterObserved: [],
            };
            this._cascadeBatches.set(triggerBound, batch);

            this._observeCascadeEnter(batch, triggerBound, (entry) => {
                if (!entry.isIntersecting) return;
                if (this._deferToPageLoadFlush) return;
                if (!this._isClipVisible(batch.triggerBound)) return;
                if (!this._isBoundInInsetViewport(batch.triggerBound)) return;
                if (!this._batchHasPendingRevealWork(batch)) {
                    this._maybeCompleteCascadeBatch(batch);
                    return;
                }
                this._scheduleCascadeBatchReveal(batch, 0);
            });
        },

        _prepareCascadeIndices() {
            this._queryOwnedCascadeContainers().forEach((container) => {
                if (!this._isTargetVisible(container)) return;

                const cascadeTargets = [
                    ...container.querySelectorAll('[data-motion-bound]'),
                ].filter((target) => this._ownsElement(target) && this._isClipVisible(target));

                const rows = this._groupTargetsByRow(cascadeTargets);
                rows.forEach((row) => {
                    row.targets.forEach((target, cascadeIndex) => {
                        target.style.setProperty('--motion-index', String(cascadeIndex));
                    });
                });
            });
        },

        _registerCascadeTargets() {
            const byContainer = new Map();

            this._queryOwnedCascadeTargets().forEach((target) => {
                const cascade = target.closest('[data-motion-cascade]');
                if (!cascade || !this._ownsElement(cascade)) return;
                if (!this._isClipVisible(target)) return;
                if (!byContainer.has(cascade)) byContainer.set(cascade, []);
                byContainer.get(cascade).push(target);
            });

            byContainer.forEach((targets, cascade) => {
                const rows = this._groupTargetsByRow(targets);
                rows.forEach((row) => {
                    this._registerCascadeBatch(cascade, row.targets);
                });
            });
        },

        _unobserveAllCascadeBatches() {
            this._cascadeEnterObserved.forEach((element) => {
                enterRegistry.unobserve(element);
            });
            this._cascadeEnterObserved.clear();
            this._cascadeBatches.clear();
        },

        _scheduleDelayedReveal(target, delayMs, cascadeBatch = null, allowViewportEdge = false) {
            const run = () => {
                try {
                    if (!this._ownsElement(target)) return;
                    if (target.getAttribute('data-motion-state') !== 'pending') return;
                    if (!this._isTargetVisible(target)) return;
                    if (!this._isClipVisible(target)) return;
                    const isInRevealViewport = allowViewportEdge
                        ? this._isBoundInViewport(target)
                        : this._isBoundInInsetViewport(target);
                    if (!isInRevealViewport) return;
                    this._revealTarget(target);
                } finally {
                    this._releasePageLoadQueue(target);
                    if (cascadeBatch) {
                        this._maybeCompleteCascadeBatch(cascadeBatch);
                    }
                }
            };

            if (delayMs <= 0) {
                run();
                return;
            }

            const existing = this._pageLoadTimers.get(target);
            if (existing) clearTimeout(existing);

            const timerId = window.setTimeout(() => {
                this._pageLoadTimers.delete(target);
                run();
            }, delayMs);

            this._pageLoadTimers.set(target, timerId);
        },

        _clearPageLoadTimers() {
            this._pageLoadTimers.forEach((timerId) => {
                clearTimeout(timerId);
            });
            this._pageLoadTimers.clear();
            this._pageLoadQueue.clear();
        },

        _clearEditorReplayTimers() {
            this._editorReplayTimers.forEach((timerId) => {
                clearTimeout(timerId);
            });
            this._editorReplayTimers.clear();
            if (this._editorViewportFlushFrame) {
                this._cancelMotionFrames();
                this._editorViewportFlushFrame = null;
            }
        },

        _clearRelayoutTimer() {
            if (this._relayoutTimer) {
                clearTimeout(this._relayoutTimer);
                this._relayoutTimer = null;
            }
        },

        _schedulePageLoadReveals(generation = this._registrationGeneration) {
            this._deferToPageLoadFlush = true;

            this._requestMotionFrame(() => {
                this._requestMotionFrame(() => {
                    this._flushPendingInView(MOTION_PAGE_LOAD_BASE_DELAY_MS);
                    this._deferToPageLoadFlush = false;
                }, generation);
            }, generation);
        },

        _flushPendingInView(baseDelayMs = 0) {
            if (this._destroyed) return;

            this._cascadeBatches.forEach((batch) => {
                if (!this._isClipVisible(batch.triggerBound)) return;
                if (!this._isBoundInInsetViewport(batch.triggerBound)) return;

                const pending = batch.targets.filter(
                    (target) =>
                        this._isTargetVisible(target) &&
                        this._isClipVisible(target) &&
                        target.getAttribute('data-motion-state') === 'pending',
                );

                pending.forEach((target) => this._pageLoadQueue.add(target));
                this._scheduleCascadeBatchReveal(batch, baseDelayMs);
            });
        },

        _flushPendingInViewport() {
            if (this._destroyed || this._deferToPageLoadFlush || this._shouldSkipAnimation()) {
                return;
            }

            const allowViewportEdge = this._isDocumentAtEnd();

            this._cascadeBatches.forEach((batch) => {
                if (!this._isClipVisible(batch.triggerBound)) return;
                const triggerIsReachable = allowViewportEdge
                    ? this._isBoundInViewport(batch.triggerBound)
                    : this._isBoundInInsetViewport(batch.triggerBound);
                if (!triggerIsReachable) return;
                if (!this._batchHasPendingRevealWork(batch)) return;

                this._scheduleCascadeBatchReveal(batch, 0, allowViewportEdge);
            });
        },

        _registerTargets() {
            if (this._destroyed) return;
            const generation = this._invalidateRegistrationWork();
            this._deferToPageLoadFlush = false;
            this._clearPageLoadTimers();
            this._unobserveAllCascadeBatches();
            this._prepareCascadeIndices();

            const targets = this._queryOwnedCascadeTargets();

            if (this._shouldSkipAnimation()) {
                targets.forEach((target) => {
                    if (!this._isTargetVisible(target)) return;
                    this._revealTarget(target);
                });
                return;
            }

            this._deferToPageLoadFlush = true;

            targets.forEach((target) => {
                if (!this._isTargetVisible(target)) return;
                if (target.getAttribute('data-motion-state') !== 'revealed') {
                    this._applyTargetPending(target);
                }
            });

            this._registerCascadeTargets();
            this._schedulePageLoadReveals(generation);
        },

        _scheduleRelayout() {
            this._clearRelayoutTimer();
            this._relayoutTimer = window.setTimeout(() => {
                this._relayoutTimer = null;
                this._registerTargets();
            }, MOTION_RELAYOUT_DEBOUNCE_MS);
        },

        _refresh() {
            if (this._destroyed) return;
            const generation = this._invalidateRegistrationWork();
            this._clearEditorReplayTimers();
            this._clearPageLoadTimers();
            this._clearRelayoutTimer();
            this._unobserveAllCascadeBatches();
            this._queryOwnedCascadeTargets().forEach((target) => {
                target.removeAttribute('data-motion-state');
                target.style.removeProperty('--motion-index');
            });
            this._requestMotionFrame(() => {
                this._registerTargets();
            }, generation);
        },

        _refreshForThemeEditorSelect() {
            this._refresh();
            [120, 320, 640, 1000, 1600].forEach((delayMs) => {
                const timerId = window.setTimeout(() => {
                    this._editorReplayTimers.delete(timerId);
                    this._scheduleThemeEditorViewportFlush();
                }, delayMs);
                this._editorReplayTimers.add(timerId);
            });
        },

        _scheduleThemeEditorViewportFlush() {
            if (this._destroyed || this._editorViewportFlushFrame) return;

            const generation = this._registrationGeneration;
            this._editorViewportFlushFrame = this._requestMotionFrame(() => {
                this._editorViewportFlushFrame = null;
                this._registerTargets();
            }, generation);
        },

        init() {
            this._destroyed = false;
            this._onTabClick = (event) => {
                if (event.target.closest('[role="tab"]')) {
                    const generation = this._registrationGeneration;
                    this._requestMotionFrame(() => {
                        this._requestMotionFrame(() => {
                            this._registerTargets();
                        }, generation);
                    }, generation);
                }
            };
            this.$el.addEventListener('click', this._onTabClick);

            this._onSwiperRelayout = (event) => {
                const target = event.target;
                if (!(target instanceof Element)) return;
                if (
                    target.closest(
                        '.swiper-button-next, .swiper-button-prev, .swiper-pagination',
                    ) ||
                    (event.type === 'transitionend' && target.classList.contains('swiper-wrapper'))
                ) {
                    this._scheduleRelayout();
                }
            };
            this.$el.addEventListener('click', this._onSwiperRelayout);
            this.$el.addEventListener('transitionend', this._onSwiperRelayout);

            this.on(
                window,
                'resize',
                () => {
                    if (this._windowResizeTimer) clearTimeout(this._windowResizeTimer);
                    this._windowResizeTimer = window.setTimeout(() => {
                        this._windowResizeTimer = null;
                        if (!this._destroyed) this._registerTargets();
                    }, MOTION_RELAYOUT_DEBOUNCE_MS);
                },
                { passive: true },
            );

            this.on(
                window,
                'scroll',
                () => {
                    if (this._windowScrollSettleTimer) clearTimeout(this._windowScrollSettleTimer);
                    this._windowScrollSettleTimer = window.setTimeout(() => {
                        this._windowScrollSettleTimer = null;
                        if (!this._destroyed) this._flushPendingInViewport();
                    }, MOTION_SCROLL_SETTLE_MS);
                },
                { passive: true },
            );

            this.$nextTick(() => {
                if (this._destroyed) return;
                const generation = this._registrationGeneration;
                this._requestMotionFrame(() => {
                    this._requestMotionFrame(() => {
                        this._registerTargets();
                    }, generation);
                }, generation);
            });

            if (window.Shopify?.designMode && ThemeEvents && typeof ThemeEvents.on === 'function') {
                const self = this;
                const el = this.$el;

                const offSelect = ThemeEvents.on(
                    'shopify:section:select',
                    function (e) {
                        if (self._matchesSection(e, el)) {
                            self._refreshForThemeEditorSelect();
                        }
                    },
                    { target: document },
                );

                const offReorder = ThemeEvents.on(
                    'shopify:section:reorder',
                    function (e) {
                        if (self._matchesSection(e, el)) {
                            self._refreshForThemeEditorSelect();
                        }
                    },
                    { target: document },
                );

                this._cleanupEditor = function () {
                    offSelect();
                    offReorder();
                };

                this.on(window, 'scroll', this._scheduleThemeEditorViewportFlush.bind(this), {
                    passive: true,
                });
            }
        },

        _matchesSection(event, el) {
            const detail = event.detail;
            if (detail && detail.sectionId) {
                // Nested cascade roots carry no section id; read it from the section-frame root.
                const sectionRoot = el.closest('[data-section-id]');
                return sectionRoot?.dataset.sectionId === String(detail.sectionId);
            }
            const target = event.target;
            if (target instanceof Node) {
                return el.contains(target) || target.contains(el);
            }
            return false;
        },

        destroy() {
            this._destroyed = true;
            this._invalidateRegistrationWork();
            this._deferToPageLoadFlush = false;
            this._clearEditorReplayTimers();
            this._clearPageLoadTimers();
            this._clearRelayoutTimer();
            this._unobserveAllCascadeBatches();
            if (this._windowResizeTimer) {
                clearTimeout(this._windowResizeTimer);
                this._windowResizeTimer = null;
            }
            if (this._windowScrollSettleTimer) {
                clearTimeout(this._windowScrollSettleTimer);
                this._windowScrollSettleTimer = null;
            }
            if (this._onTabClick) {
                this.$el.removeEventListener('click', this._onTabClick);
                this._onTabClick = null;
            }
            if (this._onSwiperRelayout) {
                this.$el.removeEventListener('click', this._onSwiperRelayout);
                this.$el.removeEventListener('transitionend', this._onSwiperRelayout);
                this._onSwiperRelayout = null;
            }
            if (this._cleanupEditor) {
                this._cleanupEditor();
                this._cleanupEditor = null;
            }
            this.dispose();
        },
    };
});
