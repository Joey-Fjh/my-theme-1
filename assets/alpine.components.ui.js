(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    ComponentGroups.ui = {
        dropdown() {
            const ThemeEvents = window.__Theme__.Events;
            const headerMenuActiveEvent = ThemeEvents?.events?.HEADER_MENU_ACTIVE_CHANGED;

            return {
                openEls: [],
                hoverOpened: false,

                emitHeaderMenuActive(active) {
                    if (!headerMenuActiveEvent || typeof ThemeEvents?.emit !== 'function') return;

                    ThemeEvents.emit(headerMenuActiveEvent, { active: Boolean(active) });
                },

                onHeaderEnter() {
                    this.cancelHoverClose();
                    this.emitHeaderMenuActive(true);
                },

                onHeaderLeave() {
                    this.emitHeaderMenuActive(false);
                },

                onHeaderFocusIn() {
                    this.emitHeaderMenuActive(true);
                },

                onHeaderFocusOut(event) {
                    if (this.$el.contains(event?.relatedTarget)) return;

                    this.emitHeaderMenuActive(false);
                },

                closeAndDeactivate(from = 0) {
                    this.cancelHoverOpen();
                    this.close(from);
                    this.emitHeaderMenuActive(false);
                },

                closeHoverAndDeactivate() {
                    if (!this.canHoverOpen()) {
                        this.emitHeaderMenuActive(false);
                        return;
                    }

                    this.cancelHoverOpen();
                    this.scheduleHoverClose();
                },

                cancelHoverClose() {
                    clearTimeout(this._hoverCloseTimer);
                },

                scheduleHoverClose() {
                    if (!this.canHoverOpen()) return;

                    this.cancelHoverClose();
                    this._hoverCloseTimer = window.setTimeout(() => {
                        if (this.hoverOpened) {
                            this.close(0);
                        }

                        this.emitHeaderMenuActive(false);
                    }, 180);
                },

                onMenuTriggerClick(target) {
                    if (!this.isDesktopClickTrigger()) return;

                    this.toggle(target);
                },

                onMenuTriggerClickEvent(event) {
                    const target = event?.target;

                    if (!(target instanceof Element)) return;

                    const trigger = target.closest('summary.dropdown-trigger');
                    if (!trigger || !this.$el.contains(trigger)) return;

                    event.preventDefault();
                    event.stopPropagation();

                    this.cancelHoverOpen();

                    if (!this.isDesktopClickTrigger()) return;

                    this.toggle(trigger.parentElement);
                },

                toggle(target) {
                    this.cancelHoverOpen();

                    const current = target.closest('[data-dropdown]');

                    if (!current) return;

                    const deep = Number(current.dataset.deep);

                    if (this.openEls[deep] === current) {
                        this.close(deep);
                        return;
                    }

                    this.open(current, deep);

                    if (this.isDesktopClickTrigger()) {
                        this.hoverOpened = false;
                    }
                },

                scheduleHoverOpen(target, delay = 120) {
                    if (!this.canHoverOpen()) return;

                    const current = target?.matches?.('[data-dropdown]')
                        ? target
                        : target?.closest?.('[data-dropdown]');

                    if (!current) return;

                    const deep = Number(current.dataset.deep);
                    const openedAtDeep = this.openEls[deep];

                    if (openedAtDeep === current) {
                        this.cancelHoverOpen();
                        return;
                    }

                    this.cancelHoverOpen();
                    this._pendingHoverTarget = current;

                    this._hoverOpenTimer = window.setTimeout(() => {
                        if (this._pendingHoverTarget !== current) return;

                        this.cancelHoverClose();

                        const stillOpen = this.openEls[deep];

                        if (stillOpen && stillOpen !== current) {
                            this.switchOpen(current, deep, { replayMotion: false });
                        } else {
                            this.open(current, deep, { replayMotion: true });
                        }

                        this.hoverOpened = true;
                        this._pendingHoverTarget = null;
                        this._hoverOpenTimer = null;
                    }, delay);
                },

                cancelHoverOpen() {
                    clearTimeout(this._hoverOpenTimer);
                    this._hoverOpenTimer = null;
                    this._pendingHoverTarget = null;
                },

                openOnHoverEvent(event) {
                    if (!this.canHoverOpen()) return;

                    const target = event?.target;

                    if (!(target instanceof Element)) return;

                    const trigger = target.closest('summary.dropdown-trigger');

                    if (!trigger || !this.$el.contains(trigger)) return;

                    this.scheduleHoverOpen(trigger.parentElement);
                },

                open(current, deep, { replayMotion = true } = {}) {
                    if (this.openEls[deep] !== current) {
                        this.closeFromDepth(deep);
                    }

                    current.setAttribute('open', '');

                    if (replayMotion) {
                        this.replayLayeredPanelMotion(current);
                    } else {
                        this.ensureLayeredPanelVisible(current);
                    }

                    this.openEls[deep] = current;
                },

                switchOpen(current, deep, { replayMotion = false } = {}) {
                    const previous = this.openEls[deep];

                    if (previous === current) return;

                    for (let i = this.openEls.length - 1; i > deep; i--) {
                        const el = this.openEls[i];

                        if (el) {
                            this.resetLayeredPanelMotion(el);
                            el.removeAttribute('open');
                        }
                    }

                    this.openEls.length = Math.min(this.openEls.length, deep + 1);

                    current.setAttribute('open', '');

                    if (replayMotion) {
                        this.replayLayeredPanelMotion(current);
                    } else {
                        this.ensureLayeredPanelVisible(current);
                    }

                    this.openEls[deep] = current;

                    if (previous && previous !== current) {
                        this.resetLayeredPanelMotion(previous);
                        previous.removeAttribute('open');
                    }
                },

                ensureLayeredPanelVisible(target) {
                    const panel = target.querySelector(':scope > .panel-motion-layered');

                    if (!panel) return;

                    panel.removeAttribute('data-panel-motion');
                },

                canHoverOpen() {
                    return (
                        window.matchMedia?.('(any-hover: hover) and (any-pointer: fine)')
                            ?.matches && this.$el.dataset.desktopMenuTrigger === 'hover'
                    );
                },

                isDesktopClickTrigger() {
                    return this.$el.dataset.desktopMenuTrigger === 'click';
                },

                replayLayeredPanelMotion(target) {
                    const panel = target.querySelector(':scope > .panel-motion-layered');

                    if (!panel) return;

                    panel.removeAttribute('data-panel-motion');
                    void panel.offsetWidth;
                    panel.setAttribute('data-panel-motion', 'enter');
                },

                resetLayeredPanelMotion(target) {
                    const panel = target.querySelector(':scope > .panel-motion-layered');

                    if (!panel) return;

                    panel.removeAttribute('data-panel-motion');
                },

                close(from = 0) {
                    this.cancelHoverOpen();
                    this.closeFromDepth(from);
                    this.hoverOpened = false;
                },

                closeFromDepth(from) {
                    for (let i = from; i < this.openEls.length; i++) {
                        const el = this.openEls[i];

                        if (el) {
                            this.resetLayeredPanelMotion(el);
                            el.removeAttribute('open');
                        }
                    }

                    this.openEls.length = from;
                },
            };
        },

        dragScroll({ axis = 'x', threshold = 6, clickGuardMs = 100 } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                axis,
                threshold,
                clickGuardMs,
                _pointerDown: false,
                _dragging: false,
                _startX: 0,
                _startY: 0,
                _startScrollLeft: 0,
                _startScrollTop: 0,
                _suppressClickUntil: 0,

                init() {
                    this.on(this.$el, 'pointerdown', this.onPointerDown.bind(this));
                    this.on(window, 'pointermove', this.onPointerMove.bind(this), {
                        passive: false,
                    });
                    this.on(window, 'pointerup', this.endDrag.bind(this));
                    this.on(window, 'pointercancel', this.endDrag.bind(this));
                    this.on(this.$el, 'click', this.onClickCapture.bind(this), true);
                    this.on(this.$el, 'dragstart', this.onDragStart.bind(this));
                },

                onPointerDown(event) {
                    if (event.button !== 0) return;

                    this._pointerDown = true;
                    this._dragging = false;
                    this._startX = event.clientX;
                    this._startY = event.clientY;
                    this._startScrollLeft = this.$el.scrollLeft;
                    this._startScrollTop = this.$el.scrollTop;
                    this.$el.classList.add('is-pointer-down');
                },

                onPointerMove(event) {
                    if (!this._pointerDown) return;

                    const deltaX = event.clientX - this._startX;
                    const deltaY = event.clientY - this._startY;
                    const distance = this.axis === 'y' ? Math.abs(deltaY) : Math.abs(deltaX);

                    if (!this._dragging && distance >= this.threshold) {
                        this._dragging = true;
                        this.$el.classList.add('is-dragging');
                    }

                    if (!this._dragging) return;

                    if (this.axis === 'y') {
                        this.$el.scrollTop = this._startScrollTop - deltaY;
                    } else {
                        this.$el.scrollLeft = this._startScrollLeft - deltaX;
                    }

                    event.preventDefault();
                },

                endDrag() {
                    if (!this._pointerDown) return;

                    this._pointerDown = false;
                    this.$el.classList.remove('is-pointer-down');

                    if (this._dragging) {
                        this._suppressClickUntil = performance.now() + this.clickGuardMs;
                    }

                    requestAnimationFrame(() => {
                        this._dragging = false;
                        this.$el.classList.remove('is-dragging');
                    });
                },

                onClickCapture(event) {
                    if (performance.now() < this._suppressClickUntil) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                },

                onDragStart(event) {
                    event.preventDefault();
                },

                destroy() {
                    this.$el.classList.remove('is-dragging');
                    this.$el.classList.remove('is-pointer-down');
                    this.dispose();
                },
            };
        },

        tabControl(initialStrategy = 'first', options = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                tabs: [],
                panels: [],
                activeIndex: 0,
                mobileQuery: '(max-width: 47.99rem)',
                scrollMode: options.scrollMode === 'always' ? 'always' : 'mobile',
                scroller: null,
                _pointerDown: false,
                _dragging: false,
                _startX: 0,
                _startY: 0,
                _startScrollLeft: 0,
                _suppressClickUntil: 0,
                _initialStrategy: initialStrategy,

                _hydrateFromDataset() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;
                    if (ds.tabInitialStrategy) this._initialStrategy = ds.tabInitialStrategy;
                    if (ds.tabScrollMode)
                        this.scrollMode = ds.tabScrollMode === 'always' ? 'always' : 'mobile';
                },

                init() {
                    this._hydrateFromDataset();
                    this.$nextTick(() => {
                        this.scroller = this.getTabScroller();
                        if (this.scroller) {
                            this.on(this.scroller, 'dragstart', this.onDragStart.bind(this));
                            this.on(this.scroller, 'pointerdown', this.onPointerDown.bind(this));
                            this.on(this.scroller, 'touchstart', this.onTouchStart.bind(this), {
                                passive: true,
                            });
                            this.on(window, 'pointermove', this.onPointerMove.bind(this), {
                                passive: false,
                            });
                            this.on(window, 'touchmove', this.onTouchMove.bind(this), {
                                passive: false,
                            });
                            this.on(window, 'pointerup', this.endDrag.bind(this));
                            this.on(window, 'pointercancel', this.endDrag.bind(this));
                            this.on(window, 'touchend', this.endDrag.bind(this));
                            this.on(window, 'touchcancel', this.endDrag.bind(this));
                            this.on(this.scroller, 'click', this.onClickCapture.bind(this), true);
                            this.on(window, 'resize', this.onResize.bind(this));
                        }

                        const count = this.tabs.length;
                        if (count === 0) return;

                        const nextIndex =
                            this._initialStrategy === 'first' ? 0 : Math.floor(count / 2);
                        this.setActive(nextIndex, { centerOnMobile: true, behavior: 'auto' });
                    });
                },

                registerTab(tab) {
                    this.tabs.push(tab);
                    return this.tabs.length - 1;
                },

                registerPanel(panel) {
                    this.panels.push(panel);
                    return this.panels.length - 1;
                },

                setActive(index, options = {}) {
                    if (index < 0 || index >= this.tabs.length) return;
                    this.activeIndex = index;

                    this.$nextTick(() => {
                        this.scrollActiveTabIntoView(index, options);
                    });
                },

                isActive(index) {
                    return this.activeIndex === index;
                },

                next() {
                    this.setActive((this.activeIndex + 1) % this.tabs.length);
                },

                prev() {
                    this.setActive((this.activeIndex - 1 + this.tabs.length) % this.tabs.length);
                },

                isMobileViewport() {
                    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
                        return false;
                    return window.matchMedia(this.mobileQuery).matches;
                },

                shouldScrollActiveTabIntoView() {
                    return this.scrollMode === 'always' || this.isMobileViewport();
                },

                canDragScroll() {
                    return (
                        this.scroller &&
                        this.scroller.scrollWidth > this.scroller.clientWidth &&
                        (this.scrollMode === 'always' ||
                            this.isMobileViewport() ||
                            this.isHorizontalScroller(this.scroller))
                    );
                },

                isHorizontalScroller(scroller) {
                    const overflowX = window.getComputedStyle(scroller).overflowX;
                    return overflowX === 'auto' || overflowX === 'scroll';
                },

                getTabScroller() {
                    const tablist = this.$el?.querySelector('[role="tablist"]');
                    return tablist instanceof HTMLElement ? tablist : null;
                },

                getHorizontalScrollParent(el) {
                    if (!el) return null;

                    let parent = el.parentElement;
                    while (parent) {
                        if (parent.scrollWidth > parent.clientWidth) {
                            const style = window.getComputedStyle(parent);
                            const overflowX = style.overflowX;
                            if (overflowX === 'auto' || overflowX === 'scroll') return parent;
                        }
                        parent = parent.parentElement;
                    }

                    return null;
                },

                scrollActiveTabIntoView(index, options = {}) {
                    if (!this.shouldScrollActiveTabIntoView()) return;

                    const tab = this.tabs[index];
                    if (!(tab instanceof HTMLElement)) return;

                    const scroller = this.getHorizontalScrollParent(tab);
                    if (!scroller) return;
                    this.scroller = scroller;

                    const { centerOnMobile = false, behavior = 'smooth' } = options;
                    const isEdgeTab = index === 0 || index === this.tabs.length - 1;

                    const tabLeft = tab.offsetLeft;
                    const tabRight = tabLeft + tab.offsetWidth;
                    const visibleLeft = scroller.scrollLeft;
                    const visibleRight = visibleLeft + scroller.clientWidth;

                    if (centerOnMobile && !isEdgeTab) {
                        const centered = tabLeft - (scroller.clientWidth - tab.offsetWidth) / 2;
                        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                        const nextLeft = Math.min(Math.max(centered, 0), Math.max(maxScroll, 0));
                        scroller.scrollTo({ left: nextLeft, behavior });
                        return;
                    }

                    if (tabLeft < visibleLeft) {
                        scroller.scrollTo({ left: tabLeft, behavior });
                        return;
                    }

                    if (tabRight > visibleRight) {
                        scroller.scrollTo({ left: tabRight - scroller.clientWidth, behavior });
                    }
                },

                onPointerDown(event) {
                    if (event.pointerType === 'touch') return;
                    if (!this.canDragScroll()) return;
                    if (event.pointerType === 'mouse' && event.button !== 0) return;

                    this._pointerDown = true;
                    this._dragging = false;
                    this._startX = event.clientX;
                    this._startY = event.clientY;
                    this._startScrollLeft = this.scroller.scrollLeft;
                },

                onTouchStart(event) {
                    if (!this.canDragScroll()) return;
                    if (event.touches.length !== 1) return;

                    const touch = event.touches[0];
                    this._pointerDown = true;
                    this._dragging = false;
                    this._startX = touch.clientX;
                    this._startY = touch.clientY;
                    this._startScrollLeft = this.scroller.scrollLeft;
                },

                onDragStart(event) {
                    if (event.target?.closest?.('[role="tab"]')) {
                        event.preventDefault();
                    }
                },

                onPointerMove(event) {
                    if (!this._pointerDown || !this.scroller) return;

                    this.updateDrag(event.clientX, event.clientY, event);
                },

                onTouchMove(event) {
                    if (!this._pointerDown || !this.scroller) return;
                    if (event.touches.length !== 1) return;

                    const touch = event.touches[0];
                    this.updateDrag(touch.clientX, touch.clientY, event);
                },

                updateDrag(clientX, clientY, event) {
                    const deltaX = clientX - this._startX;
                    const deltaY = clientY - this._startY;

                    if (!this._dragging) {
                        const absX = Math.abs(deltaX);
                        const absY = Math.abs(deltaY);

                        if (absY >= 6 && absY > absX) {
                            this._pointerDown = false;
                            return;
                        }

                        if (absX >= 6 && absX >= absY) {
                            this._dragging = true;
                        } else {
                            return;
                        }
                    }

                    this.scroller.scrollLeft = this._startScrollLeft - deltaX;
                    event.preventDefault();
                },

                endDrag() {
                    if (!this._pointerDown) return;

                    this._pointerDown = false;
                    if (this._dragging) {
                        this._suppressClickUntil = Date.now() + 100;
                    }
                    this._dragging = false;
                },

                onClickCapture(event) {
                    if (Date.now() >= this._suppressClickUntil) return;

                    event.preventDefault();
                    event.stopPropagation();
                },

                onResize() {
                    this.$nextTick(() => {
                        this.scrollActiveTabIntoView(this.activeIndex, {
                            centerOnMobile: true,
                            behavior: 'auto',
                        });
                    });
                },

                destroy() {
                    this.dispose();
                },
            };
        },

        countdownTimer(endDate = null) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                endDate: endDate || null,
                interval: null,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,

                getValue(key) {
                    const val = this[key] ?? 0;
                    return val.toString().padStart(2, '0');
                },

                init() {
                    if (!this.endDate) {
                        this.endDate = this.$el?.dataset?.countdownEndDate || null;
                    }
                    if (!this.endDate) return;
                    this.calculateTime();
                    this.interval = setInterval(() => {
                        this.calculateTime();
                    }, 1000);
                },

                calculateTime() {
                    const end = new Date(this.endDate).getTime();
                    const now = Date.now();
                    const distance = end - now;

                    if (distance <= 0) {
                        this.reset();
                        this.clear();
                        return;
                    }

                    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
                    this.hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
                    this.minutes = Math.floor((distance / (1000 * 60)) % 60);
                    this.seconds = Math.floor((distance / 1000) % 60);
                },

                reset() {
                    this.days = 0;
                    this.hours = 0;
                    this.minutes = 0;
                    this.seconds = 0;
                },

                clear() {
                    if (this.interval) {
                        clearInterval(this.interval);
                        this.interval = null;
                    }
                },

                destroy() {
                    this.clear();
                    this.dispose();
                },
            };
        },

        progressiveList() {
            return {
                initialVisibleCount: 6,
                stepCount: 6,
                visibleCount: 6,

                init() {
                    const nextVisibleCount = Number(this.$el.dataset.visibleCount);
                    const nextStepCount = Number(this.$el.dataset.stepCount);

                    this.initialVisibleCount =
                        Number.isFinite(nextVisibleCount) && nextVisibleCount > 0
                            ? nextVisibleCount
                            : 6;
                    this.stepCount =
                        Number.isFinite(nextStepCount) && nextStepCount > 0
                            ? nextStepCount
                            : this.initialVisibleCount;
                    this.visibleCount = this.initialVisibleCount;
                },

                isVisible(index) {
                    return Number(index) < this.visibleCount;
                },

                canShowMore(totalCount) {
                    return this.visibleCount < Number(totalCount || 0);
                },

                canShowLess() {
                    return this.visibleCount > this.initialVisibleCount;
                },

                showMore(totalCount) {
                    const normalizedTotal = Math.max(0, Number(totalCount) || 0);
                    this.visibleCount = Math.min(
                        normalizedTotal,
                        this.visibleCount + this.stepCount,
                    );
                },

                showLess() {
                    this.visibleCount = this.initialVisibleCount;
                },
            };
        },

        sortByDropdown() {
            return {
                sortBy: '',
                optionActiveClass: '',
                optionInactiveClass: '',
                formId: '',

                init() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;

                    this.sortBy = ds.currentSort || '';
                    this.formId = ds.formId || '';
                    this.optionActiveClass = ds.optionActiveClass || '';
                    this.optionInactiveClass = ds.optionInactiveClass || '';
                },

                isSelected(value) {
                    return this.sortBy === value;
                },

                select(value) {
                    this.sortBy = value;

                    if (this.formId) {
                        this.$nextTick(() => {
                            document
                                .getElementById(this.formId)
                                ?.dispatchEvent(new Event('change', { bubbles: true }));
                        });
                    } else {
                        this.$dispatch('sort-change', this.sortBy);
                    }
                },
            };
        },

        accordion() {
            return {
                active: null,
                titleActiveClass: 'accordion__title--active',
                titleInactiveClass: 'accordion__title--inactive',

                init() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;

                    this.titleActiveClass = ds.titleActiveClass || this.titleActiveClass;
                    this.titleInactiveClass = ds.titleInactiveClass || this.titleInactiveClass;

                    if (ds.initialActive === 'null') {
                        this.active = null;
                    } else {
                        this.active = Number(ds.initialActive);
                    }
                },

                normalizeIndex(index) {
                    return Number(index);
                },

                toggle(index) {
                    const i = this.normalizeIndex(index);
                    this.active = this.active === i ? null : i;
                },

                isActive(index) {
                    return this.active === this.normalizeIndex(index);
                },

                titleClass(index) {
                    return this.isActive(index) ? this.titleActiveClass : this.titleInactiveClass;
                },
            };
        },

        toastContainer() {
            return {
                init() {
                    const ds = this.$el.dataset;

                    this.$store.toast.configure({
                        defaultDuration: Number(ds.toastDuration),
                    });

                    this.$store.cart.configure({
                        errorMessages: {
                            generic: ds.cartToastGeneric || '',
                            rateLimited: ds.cartToastRateLimited || '',
                            serverError: ds.cartToastServerError || '',
                            timeout: ds.cartToastTimeout || '',
                            networkError: ds.cartToastNetworkError || '',
                        },
                    });

                    if (ds.toastPreview === 'true') {
                        const previewDuration =
                            ds.toastPreviewPersistent === 'true' ? 0 : undefined;

                        requestAnimationFrame(() => {
                            this.$store.toast.show(
                                ds.toastPreviewMessage,
                                ds.toastPreviewType,
                                previewDuration,
                            );
                        });
                    }
                },
            };
        },

        flipDigit() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                prev: '',
                current: '',
                oldDigit: '',
                flipping: false,
                _timeout: null,

                init() {
                    const digit = this.$el?.dataset?.digit || '';
                    this.prev = digit;
                    this.current = digit;
                    this.oldDigit = digit;
                },

                updateDigit(digit) {
                    const next = String(digit ?? '');

                    if (this.oldDigit === '' && this.current === '' && this.prev === '') {
                        this.prev = next;
                        this.current = next;
                        this.oldDigit = next;
                        return;
                    }

                    if (next === this.oldDigit) return;

                    this.current = next;
                    this.oldDigit = next;
                    this.flipping = true;

                    if (this._timeout) clearTimeout(this._timeout);

                    this._timeout = setTimeout(() => {
                        this.prev = this.current;
                        this.flipping = false;
                        this._timeout = null;
                    }, 600);
                },

                destroy() {
                    if (this._timeout) {
                        clearTimeout(this._timeout);
                        this._timeout = null;
                    }
                    this.dispose();
                },
            };
        },

        motionRevealSection() {
            const registry = motionRevealSharedRegistry;
            const ThemeEvents = window.__Theme__?.Events;

            return {
                ...AlpineComponentsFactory.useDisposable(),
                _observedTargets: new Set(),
                _pageLoadQueue: new Set(),
                _pageLoadTimers: new Map(),
                _cascadeQueues: new Map(),
                _deferToPageLoadFlush: false,
                _cleanupEditor: null,
                _onTabClick: null,

                _shouldSkipAnimation() {
                    if (document.body.dataset.motionEnabled === 'false') return true;
                    if (
                        typeof window.matchMedia === 'function' &&
                        window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    )
                        return true;
                    if (!('IntersectionObserver' in window)) return true;
                    return false;
                },

                _revealBehavior() {
                    return document.body.dataset.revealBehavior === 'always' ? 'always' : 'once';
                },

                _isRevealAlways() {
                    return this._revealBehavior() === 'always';
                },

                _isRevealTargetVisible(target) {
                    if (!(target instanceof Element)) return false;

                    let el = target;
                    while (el && el !== this.$el) {
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

                _shouldSkipTargetAnimation(target) {
                    return (
                        this.$el.dataset.motionMedia === 'static' &&
                        target.dataset.motionReveal === 'media'
                    );
                },

                _getStaggerMs(source = document.documentElement) {
                    const raw = getComputedStyle(source)
                        .getPropertyValue('--motion-reveal-stagger')
                        .trim();
                    if (!raw) return 100;
                    if (raw.endsWith('ms')) return parseFloat(raw) || 100;
                    if (raw.endsWith('s')) return (parseFloat(raw) || 0) * 1000 || 100;
                    return parseFloat(raw) || 100;
                },

                _getMotionIndex(target) {
                    const explicit = Number(target.dataset.motionIndex);
                    if (Number.isFinite(explicit) && explicit >= 0) return explicit;
                    const fromStyle = parseFloat(target.style.getPropertyValue('--motion-index'));
                    if (Number.isFinite(fromStyle) && fromStyle >= 0) return fromStyle;
                    return 0;
                },

                _queueCascadeReveal(target) {
                    const cascade = target.closest('[data-motion-cascade]');
                    if (!cascade || !this.$el.contains(cascade)) return false;

                    let queue = this._cascadeQueues.get(cascade);
                    if (!queue) {
                        queue = { frameId: null, targets: new Set() };
                        this._cascadeQueues.set(cascade, queue);
                    }

                    queue.targets.add(target);

                    if (!queue.frameId) {
                        queue.frameId = requestAnimationFrame(() => {
                            this._flushCascadeReveal(cascade);
                        });
                    }

                    return true;
                },

                _flushCascadeReveal(cascade) {
                    const queue = this._cascadeQueues.get(cascade);
                    if (!queue) return;

                    this._cascadeQueues.delete(cascade);

                    const targets = [...queue.targets]
                        .filter(
                            (target) =>
                                this._isRevealTargetVisible(target) &&
                                target.getAttribute('data-motion-state') === 'pending',
                        )
                        .sort((a, b) => this._getMotionIndex(a) - this._getMotionIndex(b));

                    const staggerMs = this._getStaggerMs(cascade);

                    targets.forEach((target, batchIndex) => {
                        this._scheduleDelayedReveal(target, Math.min(batchIndex * staggerMs, 900));
                    });
                },

                _clearCascadeQueues() {
                    this._cascadeQueues.forEach((queue) => {
                        if (queue.frameId) cancelAnimationFrame(queue.frameId);
                    });
                    this._cascadeQueues.clear();
                },

                _scheduleDelayedReveal(target, delayMs) {
                    if (delayMs <= 0) {
                        this._revealTarget(target);
                        return;
                    }

                    const existing = this._pageLoadTimers.get(target);
                    if (existing) clearTimeout(existing);

                    const timerId = window.setTimeout(() => {
                        this._pageLoadTimers.delete(target);
                        if (target.getAttribute('data-motion-state') !== 'pending') return;
                        this._revealTarget(target);
                    }, delayMs);

                    this._pageLoadTimers.set(target, timerId);
                },

                /**
                 * Assign --motion-index: explicit data-motion-index wins; otherwise
                 * visible descendants of [data-motion-cascade] receive 0..n; all
                 * other targets default to 0.
                 */
                _prepareTargets() {
                    const allTargets = this.$el.querySelectorAll('[data-motion-reveal]');

                    allTargets.forEach((target) => {
                        const explicit = Number(target.dataset.motionIndex);
                        if (Number.isFinite(explicit) && explicit >= 0) {
                            target.style.setProperty('--motion-index', String(explicit));
                        } else {
                            target.style.removeProperty('--motion-index');
                        }
                    });

                    this.$el.querySelectorAll('[data-motion-cascade]').forEach((container) => {
                        if (!this._isRevealTargetVisible(container)) return;

                        let cascadeIndex = 0;
                        container.querySelectorAll('[data-motion-reveal]').forEach((target) => {
                            if (!this._isRevealTargetVisible(target)) return;

                            const explicit = Number(target.dataset.motionIndex);
                            if (Number.isFinite(explicit) && explicit >= 0) return;

                            target.style.setProperty('--motion-index', String(cascadeIndex));
                            cascadeIndex += 1;
                        });
                    });

                    allTargets.forEach((target) => {
                        if (!target.style.getPropertyValue('--motion-index')) {
                            target.style.setProperty('--motion-index', '0');
                        }
                    });
                },

                _isTargetInView(target) {
                    const rect = target.getBoundingClientRect();
                    if (rect.width === 0 && rect.height === 0) return false;

                    const viewportHeight =
                        window.innerHeight || document.documentElement.clientHeight;
                    const bottomInset = viewportHeight * 0.15;
                    const visibleTop = 0;
                    const visibleBottom = viewportHeight - bottomInset;
                    const visibleHeight =
                        Math.min(rect.bottom, visibleBottom) - Math.max(rect.top, visibleTop);
                    const threshold = 0.12;

                    return (
                        visibleHeight > 0 &&
                        visibleHeight / (rect.height || 1) >= threshold &&
                        rect.bottom > visibleTop &&
                        rect.top < visibleBottom
                    );
                },

                _clearPageLoadTimers() {
                    this._pageLoadTimers.forEach((timerId) => {
                        clearTimeout(timerId);
                    });
                    this._pageLoadTimers.clear();
                    this._pageLoadQueue.clear();
                    this._clearCascadeQueues();
                },

                _applyTargetPending(target) {
                    target.setAttribute('data-motion-state', 'pending');
                },

                _revealTarget(target) {
                    target.setAttribute('data-motion-state', 'revealed');
                    this._pageLoadQueue.delete(target);

                    const timerId = this._pageLoadTimers.get(target);
                    if (timerId) {
                        clearTimeout(timerId);
                        this._pageLoadTimers.delete(target);
                    }

                    if (!this._isRevealAlways() && this._observedTargets.has(target)) {
                        registry.unobserve(target);
                        this._observedTargets.delete(target);
                    }
                },

                _resetTargetForReplay(target) {
                    if (this._shouldSkipAnimation()) return;
                    this._applyTargetPending(target);
                    if (!this._observedTargets.has(target)) {
                        registry.observe(target, (entry) => {
                            this._onTargetIntersect(target, entry);
                        });
                        this._observedTargets.add(target);
                    }
                },

                _unobserveAllTargets() {
                    this._observedTargets.forEach((target) => {
                        registry.unobserve(target);
                    });
                    this._observedTargets.clear();
                },

                _schedulePageLoadReveals() {
                    this._deferToPageLoadFlush = true;

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const pendingInView = [
                                ...this.$el.querySelectorAll(
                                    '[data-motion-reveal][data-motion-state="pending"]',
                                ),
                            ].filter(
                                (target) =>
                                    this._isRevealTargetVisible(target) &&
                                    this._isTargetInView(target),
                            );

                            pendingInView.forEach((target) => {
                                this._pageLoadQueue.add(target);
                                const delay =
                                    MOTION_REVEAL_PAGE_LOAD_BASE_DELAY_MS +
                                    this._getMotionIndex(target) * this._getStaggerMs(target);
                                const timerId = window.setTimeout(() => {
                                    this._pageLoadTimers.delete(target);
                                    if (target.getAttribute('data-motion-state') !== 'pending') {
                                        this._pageLoadQueue.delete(target);
                                        return;
                                    }
                                    this._revealTarget(target);
                                }, delay);
                                this._pageLoadTimers.set(target, timerId);
                            });

                            this._deferToPageLoadFlush = false;
                        });
                    });
                },

                _registerTargets() {
                    this._clearPageLoadTimers();
                    this._prepareTargets();

                    const targets = this.$el.querySelectorAll('[data-motion-reveal]');

                    if (this._shouldSkipAnimation()) {
                        targets.forEach((target) => {
                            if (!this._isRevealTargetVisible(target)) return;
                            this._revealTarget(target);
                        });
                        return;
                    }

                    this._deferToPageLoadFlush = true;

                    targets.forEach((target) => {
                        if (!this._isRevealTargetVisible(target)) return;

                        if (this._shouldSkipTargetAnimation(target)) {
                            this._revealTarget(target);
                            return;
                        }

                        if (
                            !this._isRevealAlways() &&
                            target.getAttribute('data-motion-state') === 'revealed'
                        ) {
                            return;
                        }

                        if (this._observedTargets.has(target)) return;

                        this._applyTargetPending(target);
                        registry.observe(target, (entry) => {
                            this._onTargetIntersect(target, entry);
                        });
                        this._observedTargets.add(target);
                    });

                    this._schedulePageLoadReveals();
                },

                _refresh() {
                    this._clearPageLoadTimers();
                    this._unobserveAllTargets();
                    this.$el.querySelectorAll('[data-motion-reveal]').forEach((target) => {
                        target.removeAttribute('data-motion-state');
                    });
                    requestAnimationFrame(() => {
                        this._registerTargets();
                    });
                },

                init() {
                    this._onTabClick = (event) => {
                        if (event.target.closest('[role="tab"]')) {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    this._registerTargets();
                                });
                            });
                        }
                    };
                    this.$el.addEventListener('click', this._onTabClick);

                    this.$nextTick(() => {
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                this._registerTargets();
                            });
                        });
                    });

                    if (
                        window.Shopify?.designMode &&
                        ThemeEvents &&
                        typeof ThemeEvents.on === 'function'
                    ) {
                        const self = this;
                        const el = this.$el;

                        const offSelect = ThemeEvents.on(
                            'shopify:section:select',
                            function (e) {
                                if (self._matchesSection(e, el)) {
                                    self._refresh();
                                }
                            },
                            { target: document },
                        );

                        const offReorder = ThemeEvents.on(
                            'shopify:section:reorder',
                            function (e) {
                                if (self._matchesSection(e, el)) {
                                    self._refresh();
                                }
                            },
                            { target: document },
                        );

                        this._cleanupEditor = function () {
                            offSelect();
                            offReorder();
                        };
                    }
                },

                _matchesSection(event, el) {
                    const detail = event.detail;
                    if (detail && detail.sectionId) {
                        return el.dataset.sectionId === String(detail.sectionId);
                    }
                    const target = event.target;
                    if (target instanceof Node) {
                        return el.contains(target) || target.contains(el);
                    }
                    return false;
                },

                _onTargetIntersect(target, entry) {
                    if (!entry.isIntersecting) {
                        if (
                            this._isRevealAlways() &&
                            !this._shouldSkipAnimation() &&
                            target.getAttribute('data-motion-state') === 'revealed'
                        ) {
                            this._resetTargetForReplay(target);
                        }
                        return;
                    }

                    if (target.getAttribute('data-motion-state') === 'revealed') return;
                    if (this._deferToPageLoadFlush) return;
                    if (this._pageLoadQueue.has(target)) return;

                    if (this._queueCascadeReveal(target)) {
                        return;
                    }

                    this._revealTarget(target);
                },

                destroy() {
                    this._clearPageLoadTimers();
                    this._unobserveAllTargets();
                    if (this._onTabClick) {
                        this.$el.removeEventListener('click', this._onTabClick);
                        this._onTabClick = null;
                    }
                    if (this._cleanupEditor) {
                        this._cleanupEditor();
                        this._cleanupEditor = null;
                    }
                    this.dispose();
                },
            };
        },
    };

    /**
     * Module-level shared IntersectionObserver for motion reveal.
     * All motionRevealSection instances share one observer.
     */
    const MOTION_REVEAL_PAGE_LOAD_BASE_DELAY_MS = 48;

    const motionRevealSharedRegistry = (() => {
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
                { rootMargin: '0px 0px -15% 0px', threshold: 0.12 },
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
    })();
})();
