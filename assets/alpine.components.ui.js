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
                focusIndex: 0,
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
                            this.on(this.scroller, 'keydown', this.onTabKeydown.bind(this));
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
                    this.focusIndex = index;

                    this.$nextTick(() => {
                        this.scrollActiveTabIntoView(index, options);
                    });
                },

                isActive(index) {
                    return this.activeIndex === index;
                },

                isFocusable(index) {
                    return this.focusIndex === index;
                },

                next() {
                    this.setActive((this.activeIndex + 1) % this.tabs.length);
                },

                prev() {
                    this.setActive((this.activeIndex - 1 + this.tabs.length) % this.tabs.length);
                },

                focusTab(index) {
                    const tab = this.tabs[index];
                    if (!(tab instanceof HTMLElement)) return;

                    this.focusIndex = index;
                    this.$nextTick(() => {
                        tab.focus({ preventScroll: true });
                        this.scrollActiveTabIntoView(index, { centerOnMobile: true });
                    });
                },

                onTabKeydown(event) {
                    const currentTab = event.target?.closest?.('[role="tab"]');
                    const currentIndex = this.tabs.indexOf(currentTab);
                    if (currentIndex < 0) return;

                    if (
                        (event.key === ' ' || event.key === 'Spacebar') &&
                        currentTab instanceof HTMLAnchorElement
                    ) {
                        event.preventDefault();
                        currentTab.click();
                        return;
                    }

                    const orientation =
                        this.scroller?.getAttribute('aria-orientation') || 'horizontal';
                    let nextIndex = null;

                    if (event.key === 'Home') {
                        nextIndex = 0;
                    } else if (event.key === 'End') {
                        nextIndex = this.tabs.length - 1;
                    } else if (orientation === 'vertical' && event.key === 'ArrowDown') {
                        nextIndex = (currentIndex + 1) % this.tabs.length;
                    } else if (orientation === 'vertical' && event.key === 'ArrowUp') {
                        nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
                    } else if (orientation !== 'vertical' && event.key === 'ArrowRight') {
                        nextIndex = (currentIndex + 1) % this.tabs.length;
                    } else if (orientation !== 'vertical' && event.key === 'ArrowLeft') {
                        nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
                    }

                    if (nextIndex === null) return;

                    event.preventDefault();
                    this.focusTab(nextIndex);
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

                getMicroScrollBehavior() {
                    const Utils = window.__Theme__?.Utils;
                    if (typeof Utils?.getMicroScrollBehavior === 'function') {
                        return Utils.getMicroScrollBehavior();
                    }
                    if (
                        typeof window.matchMedia === 'function' &&
                        window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ) {
                        return 'auto';
                    }
                    return 'smooth';
                },

                scrollActiveTabIntoView(index, options = {}) {
                    if (!this.shouldScrollActiveTabIntoView()) return;

                    const tab = this.tabs[index];
                    if (!(tab instanceof HTMLElement)) return;

                    const scroller = this.getHorizontalScrollParent(tab);
                    if (!scroller) return;
                    this.scroller = scroller;

                    const { centerOnMobile = false, behavior } = options;
                    const scrollBehavior = behavior ?? this.getMicroScrollBehavior();
                    const isEdgeTab = index === 0 || index === this.tabs.length - 1;

                    const tabLeft = tab.offsetLeft;
                    const tabRight = tabLeft + tab.offsetWidth;
                    const visibleLeft = scroller.scrollLeft;
                    const visibleRight = visibleLeft + scroller.clientWidth;

                    if (centerOnMobile && !isEdgeTab) {
                        const centered = tabLeft - (scroller.clientWidth - tab.offsetWidth) / 2;
                        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                        const nextLeft = Math.min(Math.max(centered, 0), Math.max(maxScroll, 0));
                        scroller.scrollTo({ left: nextLeft, behavior: scrollBehavior });
                        return;
                    }

                    if (tabLeft < visibleLeft) {
                        scroller.scrollTo({ left: tabLeft, behavior: scrollBehavior });
                        return;
                    }

                    if (tabRight > visibleRight) {
                        scroller.scrollTo({
                            left: tabRight - scroller.clientWidth,
                            behavior: scrollBehavior,
                        });
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

        localizationSwitcher() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                open: false,
                alignEnd: false,
                _viewportGap: 8,
                _fitRetries: 0,
                _maxFitRetries: 8,

                init() {
                    this.on(window, 'resize', () => {
                        if (this.open) this.fitMenuToViewport();
                    });
                },

                toggle() {
                    if (this.open) {
                        this.close();
                        return;
                    }

                    // Predict before show so the first paint does not overflow and
                    // create a one-frame horizontal scrollbar.
                    this._fitRetries = 0;
                    this.alignEnd = this.shouldPreferAlignEnd();
                    this.open = true;
                    this.scheduleFitMenuToViewport();
                },

                close() {
                    this.open = false;
                    this.alignEnd = false;
                    this._fitRetries = 0;
                },

                shouldPreferAlignEnd() {
                    const trigger = this.$refs.localizationTrigger;
                    if (!trigger) return false;

                    const triggerRect = trigger.getBoundingClientRect();
                    const viewportWidth =
                        document.documentElement.clientWidth || window.innerWidth || 0;
                    return triggerRect.left > viewportWidth * 0.5;
                },

                scheduleFitMenuToViewport() {
                    this.$nextTick(() => {
                        requestAnimationFrame(() => this.fitMenuToViewport());
                    });
                },

                /**
                 * Prefer start alignment; flip to end when the panel would overflow the
                 * viewport edge (same idea as image magnifier canPlaceRight).
                 */
                fitMenuToViewport() {
                    const menu = this.$refs.localizationMenu;
                    const trigger = this.$refs.localizationTrigger;
                    if (!menu || !trigger || !this.open) return;

                    const menuWidth = menu.offsetWidth || menu.getBoundingClientRect().width;
                    if (menuWidth <= 0) {
                        if (this._fitRetries >= this._maxFitRetries) return;
                        this._fitRetries += 1;
                        this.scheduleFitMenuToViewport();
                        return;
                    }

                    this._fitRetries = 0;

                    const triggerRect = trigger.getBoundingClientRect();
                    const viewportWidth =
                        document.documentElement.clientWidth || window.innerWidth || 0;
                    const gap = this._viewportGap;
                    const startRight = triggerRect.left + menuWidth;
                    const endLeft = triggerRect.right - menuWidth;

                    if (startRight <= viewportWidth - gap) {
                        this.alignEnd = false;
                        return;
                    }

                    if (endLeft >= gap) {
                        this.alignEnd = true;
                        return;
                    }

                    this.alignEnd = this.shouldPreferAlignEnd();
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

                syncPeers(value) {
                    document.querySelectorAll('[data-sort-by-dropdown]').forEach((dropdown) => {
                        if (dropdown.dataset.formId !== this.formId) return;

                        const data = window.Alpine?.$data?.(dropdown);
                        if (data) data.sortBy = value;

                        dropdown
                            .querySelector('[data-sort-by-control]')
                            ?.setAttribute('value', value);
                    });
                },

                select(value) {
                    this.sortBy = value;

                    if (this.formId) {
                        this.syncPeers(value);
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
            const enterRegistry = motionRevealEnterRegistry;
            const cascadeEnterRegistry = motionCascadeEnterRegistry;
            const exitRegistry = motionRevealExitRegistry;
            const ThemeEvents = window.__Theme__?.Events;

            return {
                ...AlpineComponentsFactory.useDisposable(),
                _observedBounds: new Map(),
                _exitObservedBounds: new Map(),
                _pageLoadQueue: new Set(),
                _pageLoadTimers: new Map(),
                _cascadeBatches: new Map(),
                _cascadeEnterObserved: new Set(),
                _cascadeExitObserved: new Set(),
                _armedRevealTargets: new Set(),
                _motionFrames: new Set(),
                _deferToPageLoadFlush: false,
                _cleanupEditor: null,
                _onTabClick: null,
                _onSwiperRelayout: null,
                _relayoutTimer: null,
                _editorReplayTimers: new Set(),
                _editorViewportFlushFrame: null,
                _relayoutBound: false,
                _scrollSettleBound: false,
                _registrationGeneration: 0,
                _criticalViewportPrepared: false,
                _destroyed: false,

                _motionDebug(event, detail) {
                    if (!motionRevealDebugEnabled()) return;
                    console.debug('[motion-reveal]', event, detail || {});
                },

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

                _cancelMotionFrame(frameId) {
                    if (!frameId) return;
                    cancelAnimationFrame(frameId);
                    this._motionFrames.delete(frameId);
                },

                _cancelMotionFrames() {
                    this._motionFrames.forEach((frameId) => cancelAnimationFrame(frameId));
                    this._motionFrames.clear();
                    this._editorViewportFlushFrame = null;
                },

                _invalidateRegistrationWork() {
                    this._registrationGeneration += 1;
                    this._cancelMotionFrames();
                    this._armedRevealTargets.clear();
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

                _revealBehavior() {
                    return document.body.dataset.revealBehavior === 'always' ? 'always' : 'once';
                },

                _isRevealAlways() {
                    return this._revealBehavior() === 'always';
                },

                _ownsElement(el) {
                    if (!(el instanceof Element) || !this.$el.contains(el)) return false;
                    return el.closest('[data-motion-section]') === this.$el;
                },

                _queryOwnedRevealTargets() {
                    return [...this.$el.querySelectorAll(MOTION_REVEAL_TARGET_SELECTOR)].filter(
                        (target) => this._ownsElement(target),
                    );
                },

                _queryOwnedCascadeContainers() {
                    const containers = [];
                    if (this.$el.matches('[data-motion-cascade]')) {
                        containers.push(this.$el);
                    }
                    containers.push(...this.$el.querySelectorAll('[data-motion-cascade]'));
                    return containers.filter((container) => this._ownsElement(container));
                },

                _queryOwnedSequenceContainers() {
                    const containers = [];
                    if (this.$el.matches('[data-motion-sequence]')) {
                        containers.push(this.$el);
                    }
                    containers.push(...this.$el.querySelectorAll('[data-motion-sequence]'));
                    return containers.filter((container) => this._ownsElement(container));
                },

                _getSequenceContainer(target) {
                    if (!(target instanceof Element)) return null;
                    const sequence = target.closest('[data-motion-sequence]');
                    if (!sequence || !this._ownsElement(sequence)) return null;
                    return sequence;
                },

                _isRevealTargetVisible(target) {
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

                _shouldSkipTargetAnimation(target) {
                    const revealType = target.hasAttribute('data-motion-copy')
                        ? 'content'
                        : target.dataset.motionReveal;

                    if (revealType === 'content') {
                        return !document.body.dataset.contentRevealStyle;
                    }

                    if (revealType === 'media') {
                        return (
                            this.$el.dataset.motionMedia === 'static' ||
                            !document.body.dataset.mediaRevealStyle
                        );
                    }

                    return false;
                },

                /**
                 * Stable observation / row-geometry node.
                 * Prefer the nearest owned [data-motion-bound]; otherwise the reveal target.
                 * Unbound rise/zoom targets stay transform-stable during always reset via
                 * data-motion-resetting (transform:none) until enter is confirmed.
                 */
                _getMotionBound(target) {
                    if (!(target instanceof Element)) return null;

                    if (target.hasAttribute('data-motion-copy')) {
                        const copyBound = target.closest('[data-motion-copy-bound]');
                        if (copyBound && this._ownsElement(copyBound)) return copyBound;
                        return target;
                    }

                    const bound = target.closest('[data-motion-bound]');
                    if (bound && this._ownsElement(bound)) return bound;
                    return target;
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
                    const raw = getComputedStyle(source)
                        .getPropertyValue('--motion-reveal-stagger')
                        .trim();
                    if (!raw) return 170;
                    if (raw.endsWith('ms')) return parseFloat(raw) || 170;
                    if (raw.endsWith('s')) return (parseFloat(raw) || 0) * 1000 || 170;
                    return parseFloat(raw) || 170;
                },

                _getMotionIndex(target) {
                    const explicit = Number(target.dataset.motionIndex);
                    if (Number.isFinite(explicit) && explicit >= 0) return explicit;
                    const fromStyle = parseFloat(target.style.getPropertyValue('--motion-index'));
                    if (Number.isFinite(fromStyle) && fromStyle >= 0) return fromStyle;
                    return 0;
                },

                _getCascadeContainer(target) {
                    if (!(target instanceof Element)) return null;
                    const cascade = target.closest('[data-motion-cascade]');
                    if (!cascade || !this._ownsElement(cascade)) return null;
                    return cascade;
                },

                _getLayoutRect(el) {
                    if (!(el instanceof Element)) {
                        return { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 };
                    }

                    const hadTransform = el.style.transform;
                    const computedTransform = window.getComputedStyle(el).transform;
                    const needsNeutralize =
                        computedTransform && computedTransform !== 'none' && !hadTransform;

                    if (needsNeutralize) {
                        el.style.transform = 'none';
                    }

                    const rect = el.getBoundingClientRect();

                    if (needsNeutralize) {
                        if (hadTransform) {
                            el.style.transform = hadTransform;
                        } else {
                            el.style.removeProperty('transform');
                        }
                    }

                    return rect;
                },

                _groupCascadeTargetsByRow(targets) {
                    const tolerance = MOTION_CASCADE_ROW_TOLERANCE_PX;
                    const entries = targets
                        .filter((target) => this._isRevealTargetVisible(target))
                        .map((target) => {
                            const bound = this._getMotionBound(target);
                            const rect = this._getLayoutRect(bound);
                            return { target, bound, top: rect.top, left: rect.left };
                        })
                        .sort((a, b) => {
                            if (Math.abs(a.top - b.top) > tolerance) return a.top - b.top;
                            return a.left - b.left;
                        });

                    const rows = [];
                    for (const entry of entries) {
                        let row = rows.find((r) => Math.abs(r.top - entry.top) <= tolerance);
                        if (!row) {
                            row = { top: entry.top, targets: [], bounds: [] };
                            rows.push(row);
                        }
                        row.targets.push(entry.target);
                        row.bounds.push(entry.bound);
                    }

                    return rows;
                },

                _isBoundInInsetViewport(bound) {
                    const rect = bound.getBoundingClientRect();
                    if (rect.width === 0 && rect.height === 0) return false;

                    const viewportHeight =
                        window.innerHeight || document.documentElement.clientHeight;
                    const bottomInset = viewportHeight * 0.15;
                    const visibleBottom = viewportHeight - bottomInset;

                    return rect.bottom > 0 && rect.top < visibleBottom;
                },

                _isBoundInViewport(bound) {
                    const rect = bound.getBoundingClientRect();
                    if (rect.width === 0 && rect.height === 0) return false;

                    const viewportHeight =
                        window.innerHeight || document.documentElement.clientHeight;
                    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

                    return (
                        rect.bottom > 0 &&
                        rect.top < viewportHeight &&
                        rect.right > 0 &&
                        rect.left < viewportWidth
                    );
                },

                _isDocumentAtEnd() {
                    const viewportHeight =
                        window.innerHeight || document.documentElement.clientHeight;
                    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
                    const documentHeight = Math.max(
                        document.documentElement.scrollHeight,
                        document.body?.scrollHeight || 0,
                    );

                    return scrollTop + viewportHeight >= documentHeight - 2;
                },

                _isBoundFullyOutside(bound) {
                    const rect = bound.getBoundingClientRect();
                    const viewportHeight =
                        window.innerHeight || document.documentElement.clientHeight;
                    const buffer = MOTION_REVEAL_EXIT_BUFFER_PX;
                    return rect.bottom <= -buffer || rect.top >= viewportHeight + buffer;
                },

                _isCascadeBatchOutOfView(batch) {
                    return batch.targets.every((target) => {
                        if (!this._isRevealTargetVisible(target)) return true;
                        const bound =
                            batch.boundByTarget.get(target) || this._getMotionBound(target);
                        return this._isBoundFullyOutside(bound);
                    });
                },

                _releasePageLoadQueue(target) {
                    this._pageLoadQueue.delete(target);
                },

                _silentResetTarget(target) {
                    this._armedRevealTargets.delete(target);
                    target.removeAttribute('data-motion-staging');
                    target.setAttribute('data-motion-resetting', '');
                    target.setAttribute('data-motion-state', 'pending');
                    this._releasePageLoadQueue(target);
                    this._motionDebug('silent-reset', { target });
                },

                _maybeResetCascadeBatch(batch) {
                    if (!this._isRevealAlways() || this._shouldSkipAnimation()) return;
                    if (!this._isCascadeBatchOutOfView(batch)) return;

                    batch.targets.forEach((target) => {
                        if (
                            target.getAttribute('data-motion-state') === 'revealed' ||
                            this._armedRevealTargets.has(target)
                        ) {
                            this._silentResetTarget(target);
                        }
                    });
                },

                _canRevealTargetNow(target) {
                    if (!this._ownsElement(target)) return false;
                    if (!this._isRevealTargetVisible(target)) return false;
                    if (this._shouldSkipTargetAnimation(target)) return false;
                    if (target.getAttribute('data-motion-state') !== 'pending') return false;

                    const bound = this._getMotionBound(target);
                    if (!this._isClipVisible(bound)) return false;
                    if (!this._isBoundInInsetViewport(bound)) return false;
                    return true;
                },

                /**
                 * Enter was confirmed on a transform-stable bound (resetting or separate bound).
                 * After clearing data-motion-resetting, do not re-check inset against the
                 * pending transform box — that would let transform drive the decision.
                 */
                _beginReveal(target) {
                    if (target.hasAttribute('data-motion-resetting')) {
                        // Re-arm the pending transform without animating from the silent
                        // reset's transform:none. The next frame can then animate the
                        // complete pending -> revealed distance in always mode.
                        target.setAttribute('data-motion-staging', '');
                        this._armedRevealTargets.add(target);
                        target.removeAttribute('data-motion-resetting');
                        void target.offsetWidth;
                        target.removeAttribute('data-motion-staging');
                        const generation = this._registrationGeneration;
                        this._requestMotionFrame(() => {
                            this._armedRevealTargets.delete(target);
                            if (!this._ownsElement(target)) return;
                            if (target.getAttribute('data-motion-state') !== 'pending') return;
                            if (target.hasAttribute('data-motion-resetting')) return;
                            if (!this._isRevealTargetVisible(target)) return;
                            const bound = this._getMotionBound(target);
                            if (this._isBoundFullyOutside(bound)) {
                                this._silentResetTarget(target);
                                return;
                            }
                            this._revealTarget(target);
                        }, generation);
                        return;
                    }

                    this._revealTarget(target);
                },

                _findCascadeBatchForTarget(target) {
                    for (const batch of this._cascadeBatches.values()) {
                        if (batch.targets.includes(target)) return batch;
                    }
                    return null;
                },

                _batchHasPendingRevealWork(batch) {
                    return batch.targets.some(
                        (target) =>
                            this._isRevealTargetVisible(target) &&
                            !this._shouldSkipTargetAnimation(target) &&
                            target.getAttribute('data-motion-state') === 'pending',
                    );
                },

                _maybeCompleteCascadeBatch(batch) {
                    if (this._isRevealAlways()) return;
                    if (this._batchHasPendingRevealWork(batch)) return;
                    this._unobserveCascadeBatch(batch);
                    this._motionDebug('cascade-batch-complete', {
                        triggerBound: batch.triggerBound,
                    });
                },

                _scheduleCascadeBatchReveal(batch, baseDelayMs = 0, allowViewportEdge = false) {
                    const pending = batch.targets
                        .filter(
                            (target) =>
                                this._isRevealTargetVisible(target) &&
                                this._isClipVisible(
                                    batch.boundByTarget.get(target) || this._getMotionBound(target),
                                ) &&
                                !this._shouldSkipTargetAnimation(target) &&
                                target.getAttribute('data-motion-state') === 'pending',
                        )
                        .sort((a, b) => this._getMotionIndex(a) - this._getMotionIndex(b));

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

                    // once: keep observing until every pending target successfully reveals
                    // or a later enter re-schedules after a skipped timer check.
                },

                _unobserveCascadeBatch(batch) {
                    batch.enterObserved.forEach((element) => {
                        cascadeEnterRegistry.unobserve(element);
                        this._cascadeEnterObserved.delete(element);
                    });
                    batch.exitObserved.forEach((element) => {
                        exitRegistry.unobserve(element);
                        this._cascadeExitObserved.delete(element);
                    });
                    batch.enterObserved.length = 0;
                    batch.exitObserved.length = 0;
                    this._cascadeBatches.delete(batch.triggerBound);
                },

                _observeCascadeEnter(batch, element, handler) {
                    cascadeEnterRegistry.observe(element, handler);
                    batch.enterObserved.push(element);
                    this._cascadeEnterObserved.add(element);
                },

                _observeCascadeExit(batch, element, handler) {
                    exitRegistry.observe(element, handler);
                    batch.exitObserved.push(element);
                    this._cascadeExitObserved.add(element);
                },

                _registerCascadeBatch(cascade, targets) {
                    const boundByTarget = new Map();
                    targets.forEach((target) => {
                        boundByTarget.set(target, this._getMotionBound(target));
                    });

                    const sorted = [...targets].sort(
                        (a, b) => this._getMotionIndex(a) - this._getMotionIndex(b),
                    );
                    const triggerTarget = sorted[0];
                    if (!triggerTarget) return;

                    const triggerBound = boundByTarget.get(triggerTarget);
                    if (!triggerBound) return;

                    if (
                        !this._isRevealAlways() &&
                        sorted.every(
                            (target) => target.getAttribute('data-motion-state') === 'revealed',
                        )
                    ) {
                        return;
                    }

                    if (this._cascadeBatches.has(triggerBound)) return;

                    sorted.forEach((target) => {
                        if (!this._isRevealTargetVisible(target)) return;

                        if (this._shouldSkipTargetAnimation(target)) {
                            this._revealTarget(target);
                            return;
                        }

                        if (target.getAttribute('data-motion-state') === 'revealed') {
                            return;
                        }

                        this._applyTargetPending(target);
                    });

                    const batch = {
                        cascade,
                        targets: sorted,
                        boundByTarget,
                        triggerBound,
                        enterObserved: [],
                        exitObserved: [],
                    };
                    this._cascadeBatches.set(triggerBound, batch);

                    this._observeCascadeEnter(batch, triggerBound, (entry) => {
                        this._onCascadeBatchTriggerIntersect(batch, entry);
                    });

                    if (this._isRevealAlways()) {
                        const uniqueBounds = new Set(boundByTarget.values());
                        uniqueBounds.forEach((bound) => {
                            this._observeCascadeExit(batch, bound, (entry) => {
                                if (entry.isIntersecting) return;
                                this._maybeResetCascadeBatch(batch);
                            });
                        });
                    }

                    this._motionDebug('cascade-batch-register', {
                        count: sorted.length,
                        triggerBound,
                    });
                },

                _registerCascadeTargets(cascadeTargets) {
                    const byContainer = new Map();

                    cascadeTargets.forEach((target) => {
                        const cascade = this._getCascadeContainer(target);
                        if (!cascade) return;
                        const bound = this._getMotionBound(target);
                        if (!this._isClipVisible(bound)) return;
                        if (!byContainer.has(cascade)) byContainer.set(cascade, []);
                        byContainer.get(cascade).push(target);
                    });

                    byContainer.forEach((targets, cascade) => {
                        const rows = this._groupCascadeTargetsByRow(targets);
                        rows.forEach((row) => {
                            this._registerCascadeBatch(cascade, row.targets);
                        });
                    });
                },

                _onCascadeBatchTriggerIntersect(batch, entry) {
                    // Enter observer only — exit/reset is owned by exitRegistry.
                    if (!entry.isIntersecting) return;

                    if (this._deferToPageLoadFlush) return;
                    if (!this._isClipVisible(batch.triggerBound)) return;
                    if (!this._isBoundInInsetViewport(batch.triggerBound)) return;

                    if (!this._batchHasPendingRevealWork(batch)) {
                        this._maybeCompleteCascadeBatch(batch);
                        return;
                    }

                    this._scheduleCascadeBatchReveal(batch, 0);
                },

                _unobserveAllCascadeBatches() {
                    this._cascadeEnterObserved.forEach((element) => {
                        cascadeEnterRegistry.unobserve(element);
                    });
                    this._cascadeExitObserved.forEach((element) => {
                        exitRegistry.unobserve(element);
                    });
                    this._cascadeEnterObserved.clear();
                    this._cascadeExitObserved.clear();
                    this._cascadeBatches.clear();
                },

                _scheduleDelayedReveal(
                    target,
                    delayMs,
                    cascadeBatch = null,
                    allowViewportEdge = false,
                ) {
                    const run = () => {
                        try {
                            if (!this._ownsElement(target)) {
                                this._motionDebug('delayed-reveal-skip', {
                                    target,
                                    reason: 'ownership',
                                });
                                return;
                            }
                            if (target.getAttribute('data-motion-state') !== 'pending') return;
                            if (!this._isRevealTargetVisible(target)) {
                                this._motionDebug('delayed-reveal-skip', {
                                    target,
                                    reason: 'hidden',
                                });
                                return;
                            }
                            if (this._shouldSkipTargetAnimation(target)) {
                                this._revealTarget(target);
                                return;
                            }
                            const bound = this._getMotionBound(target);
                            if (!this._isClipVisible(bound)) {
                                this._motionDebug('delayed-reveal-skip', {
                                    target,
                                    reason: 'clip',
                                });
                                return;
                            }
                            const isInRevealViewport = allowViewportEdge
                                ? this._isBoundInViewport(bound)
                                : this._isBoundInInsetViewport(bound);
                            if (!isInRevealViewport) {
                                this._motionDebug('delayed-reveal-skip', {
                                    target,
                                    reason: allowViewportEdge ? 'viewport' : 'inset',
                                });
                                return;
                            }
                            this._beginReveal(target);
                        } finally {
                            // Always drop the queue lock so a later enter can reveal.
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

                /**
                 * Assign --motion-index: explicit data-motion-index wins; compact
                 * sequences receive DOM-order indices; cascade children receive 0..n
                 * within each current visual row; other ordinary targets remain 0.
                 */
                _prepareTargets() {
                    const allTargets = this._queryOwnedRevealTargets();

                    if (!this._criticalViewportPrepared) {
                        let criticalCount = 0;
                        allTargets.forEach((target) => {
                            if (!this._isRevealTargetVisible(target)) return;
                            const bound = this._getMotionBound(target);
                            if (!this._isClipVisible(bound) || !this._isBoundInViewport(bound)) {
                                return;
                            }
                            target.setAttribute('data-motion-critical-runtime', '');
                            criticalCount += 1;
                        });
                        this._criticalViewportPrepared = true;
                        this._motionDebug('critical-viewport', { count: criticalCount });
                    }

                    allTargets.forEach((target) => {
                        const explicit = Number(target.dataset.motionIndex);
                        if (Number.isFinite(explicit) && explicit >= 0) {
                            target.style.setProperty('--motion-index', String(explicit));
                        } else {
                            target.style.removeProperty('--motion-index');
                        }
                    });

                    this._queryOwnedSequenceContainers().forEach((container) => {
                        if (!this._isRevealTargetVisible(container)) return;

                        const sequenceTargets = [
                            ...container.querySelectorAll(MOTION_REVEAL_TARGET_SELECTOR),
                        ].filter((target) => {
                            if (!this._ownsElement(target)) return false;
                            if (!this._isRevealTargetVisible(target)) return false;
                            if (this._getSequenceContainer(target) !== container) return false;
                            return !this._getCascadeContainer(target);
                        });

                        sequenceTargets.forEach((target, sequenceIndex) => {
                            const explicit = Number(target.dataset.motionIndex);
                            if (Number.isFinite(explicit) && explicit >= 0) return;
                            target.style.setProperty('--motion-index', String(sequenceIndex));
                        });
                    });

                    this._queryOwnedCascadeContainers().forEach((container) => {
                        if (!this._isRevealTargetVisible(container)) return;

                        const cascadeTargets = [
                            ...container.querySelectorAll(MOTION_REVEAL_TARGET_SELECTOR),
                        ].filter((target) => {
                            if (!this._ownsElement(target)) return false;
                            if (!this._isRevealTargetVisible(target)) return false;
                            return this._isClipVisible(this._getMotionBound(target));
                        });

                        const rows = this._groupCascadeTargetsByRow(cascadeTargets);
                        rows.forEach((row) => {
                            let cascadeIndex = 0;
                            row.targets.forEach((target) => {
                                const explicit = Number(target.dataset.motionIndex);
                                if (Number.isFinite(explicit) && explicit >= 0) return;
                                target.style.setProperty('--motion-index', String(cascadeIndex));
                                cascadeIndex += 1;
                            });
                        });
                    });

                    allTargets.forEach((target) => {
                        if (!target.style.getPropertyValue('--motion-index')) {
                            target.style.setProperty('--motion-index', '0');
                        }
                    });
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
                        this._cancelMotionFrame(this._editorViewportFlushFrame);
                        this._editorViewportFlushFrame = null;
                    }
                },

                _clearRelayoutTimer() {
                    if (this._relayoutTimer) {
                        clearTimeout(this._relayoutTimer);
                        this._relayoutTimer = null;
                    }
                },

                _applyTargetPending(target) {
                    this._armedRevealTargets.delete(target);
                    target.removeAttribute('data-motion-resetting');
                    target.removeAttribute('data-motion-staging');
                    target.setAttribute('data-motion-state', 'pending');
                },

                _revealTarget(target) {
                    this._armedRevealTargets.delete(target);
                    target.removeAttribute('data-motion-resetting');
                    target.removeAttribute('data-motion-staging');
                    target.setAttribute('data-motion-state', 'revealed');
                    this._releasePageLoadQueue(target);

                    const timerId = this._pageLoadTimers.get(target);
                    if (timerId) {
                        clearTimeout(timerId);
                        this._pageLoadTimers.delete(target);
                    }

                    if (!this._isRevealAlways()) {
                        const bound = this._getMotionBound(target);
                        this._releaseOrdinaryTarget(bound, target);
                    }

                    const cascadeBatch = this._findCascadeBatchForTarget(target);
                    if (cascadeBatch) {
                        this._maybeCompleteCascadeBatch(cascadeBatch);
                    }

                    this._motionDebug('reveal', { target });
                },

                _unobserveAllBounds() {
                    this._observedBounds.forEach((_meta, bound) => {
                        enterRegistry.unobserve(bound);
                    });
                    this._observedBounds.clear();

                    this._exitObservedBounds.forEach((_meta, bound) => {
                        exitRegistry.unobserve(bound);
                    });
                    this._exitObservedBounds.clear();
                },

                _releaseOrdinaryTarget(bound, target) {
                    const enterMeta = this._observedBounds.get(bound);
                    if (enterMeta) {
                        enterMeta.targets.delete(target);
                        if (enterMeta.targets.size === 0) {
                            enterRegistry.unobserve(bound);
                            this._observedBounds.delete(bound);
                        }
                    }

                    const exitMeta = this._exitObservedBounds.get(bound);
                    if (exitMeta) {
                        exitMeta.targets.delete(target);
                        if (exitMeta.targets.size === 0) {
                            exitRegistry.unobserve(bound);
                            this._exitObservedBounds.delete(bound);
                        }
                    }
                },

                _observeOrdinaryTarget(target) {
                    const bound = this._getMotionBound(target);
                    let enterMeta = this._observedBounds.get(bound);

                    if (!enterMeta) {
                        const targets = new Set();
                        const enterHandler = (entry) => {
                            [...targets].forEach((observedTarget) => {
                                this._onOrdinaryEnter(bound, observedTarget, entry);
                            });
                        };
                        enterMeta = { targets, handler: enterHandler };
                        this._observedBounds.set(bound, enterMeta);
                        enterRegistry.observe(bound, enterHandler);
                    }
                    enterMeta.targets.add(target);

                    if (!this._isRevealAlways()) return;

                    let exitMeta = this._exitObservedBounds.get(bound);
                    if (!exitMeta) {
                        const targets = new Set();
                        const exitHandler = (entry) => {
                            [...targets].forEach((observedTarget) => {
                                this._onOrdinaryExit(bound, observedTarget, entry);
                            });
                        };
                        exitMeta = { targets, handler: exitHandler };
                        this._exitObservedBounds.set(bound, exitMeta);
                        exitRegistry.observe(bound, exitHandler);
                    }
                    exitMeta.targets.add(target);
                },

                _schedulePageLoadReveals(generation = this._registrationGeneration) {
                    this._deferToPageLoadFlush = true;

                    this._requestMotionFrame(() => {
                        this._requestMotionFrame(() => {
                            this._flushPendingInView(MOTION_REVEAL_PAGE_LOAD_BASE_DELAY_MS);
                            this._deferToPageLoadFlush = false;
                        }, generation);
                    }, generation);
                },

                _flushPendingInView(baseDelayMs = 0) {
                    if (this._destroyed) return;
                    const cascadeTargetSet = new Set();

                    this._cascadeBatches.forEach((batch) => {
                        batch.targets.forEach((target) => cascadeTargetSet.add(target));

                        if (!this._isClipVisible(batch.triggerBound)) return;
                        if (!this._isBoundInInsetViewport(batch.triggerBound)) return;

                        const pending = batch.targets.filter(
                            (target) =>
                                this._isRevealTargetVisible(target) &&
                                this._isClipVisible(
                                    batch.boundByTarget.get(target) || this._getMotionBound(target),
                                ) &&
                                !this._shouldSkipTargetAnimation(target) &&
                                target.getAttribute('data-motion-state') === 'pending',
                        );

                        pending.forEach((target) => this._pageLoadQueue.add(target));
                        this._scheduleCascadeBatchReveal(batch, baseDelayMs);
                    });

                    const pendingInView = this._queryOwnedRevealTargets().filter(
                        (target) =>
                            !cascadeTargetSet.has(target) &&
                            target.getAttribute('data-motion-state') === 'pending' &&
                            this._isRevealTargetVisible(target) &&
                            this._isClipVisible(this._getMotionBound(target)) &&
                            this._isBoundInInsetViewport(this._getMotionBound(target)),
                    );

                    pendingInView.forEach((target) => {
                        this._pageLoadQueue.add(target);
                        // CSS owns ordinary stagger via --motion-index on revealed transition.
                        this._scheduleDelayedReveal(target, baseDelayMs);
                    });
                },

                /**
                 * Recovery path for fast scrolls and the document end, where a target can
                 * be visibly inside the viewport without ever crossing the 15% enter line.
                 * The shared scroll-settle listener calls this only after scrolling pauses,
                 * preserving the normal observer trigger while preventing stuck content.
                 */
                _flushPendingInViewport() {
                    if (
                        this._destroyed ||
                        this._deferToPageLoadFlush ||
                        this._shouldSkipAnimation()
                    ) {
                        return;
                    }

                    const cascadeTargetSet = new Set();
                    const allowViewportEdge = this._isDocumentAtEnd();
                    let scheduled = 0;

                    this._cascadeBatches.forEach((batch) => {
                        batch.targets.forEach((target) => cascadeTargetSet.add(target));

                        if (!this._isClipVisible(batch.triggerBound)) return;
                        const triggerIsReachable = allowViewportEdge
                            ? this._isBoundInViewport(batch.triggerBound)
                            : this._isBoundInInsetViewport(batch.triggerBound);
                        if (!triggerIsReachable) return;
                        if (!this._batchHasPendingRevealWork(batch)) return;

                        this._scheduleCascadeBatchReveal(batch, 0, allowViewportEdge);
                        scheduled += 1;
                    });

                    this._queryOwnedRevealTargets().forEach((target) => {
                        if (cascadeTargetSet.has(target)) return;
                        if (this._pageLoadQueue.has(target)) return;
                        if (target.getAttribute('data-motion-state') !== 'pending') return;
                        if (!this._isRevealTargetVisible(target)) return;
                        if (this._shouldSkipTargetAnimation(target)) return;

                        const bound = this._getMotionBound(target);
                        if (!this._isClipVisible(bound)) return;
                        const boundIsReachable = allowViewportEdge
                            ? this._isBoundInViewport(bound)
                            : this._isBoundInInsetViewport(bound);
                        if (!boundIsReachable) return;

                        this._scheduleDelayedReveal(target, 0, null, allowViewportEdge);
                        scheduled += 1;
                    });

                    if (scheduled > 0) {
                        this._motionDebug('viewport-fallback-flush', { scheduled });
                    }
                },

                _registerTargets() {
                    if (this._destroyed) return;
                    const generation = this._invalidateRegistrationWork();
                    this._deferToPageLoadFlush = false;
                    this._clearPageLoadTimers();
                    this._unobserveAllCascadeBatches();
                    this._unobserveAllBounds();
                    this._prepareTargets();

                    const targets = this._queryOwnedRevealTargets();

                    if (this._shouldSkipAnimation()) {
                        targets.forEach((target) => {
                            if (!this._isRevealTargetVisible(target)) return;
                            this._revealTarget(target);
                        });
                        return;
                    }

                    const cascadeTargets = [];
                    const ordinaryTargets = [];

                    targets.forEach((target) => {
                        if (!this._isRevealTargetVisible(target)) return;
                        if (this._shouldSkipTargetAnimation(target)) {
                            this._revealTarget(target);
                            return;
                        }
                        if (this._getCascadeContainer(target)) {
                            cascadeTargets.push(target);
                        } else {
                            ordinaryTargets.push(target);
                        }
                    });

                    this._deferToPageLoadFlush = true;

                    ordinaryTargets.forEach((target) => {
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

                        if (target.getAttribute('data-motion-state') !== 'revealed') {
                            this._applyTargetPending(target);
                        }

                        this._observeOrdinaryTarget(target);
                    });

                    this._registerCascadeTargets(cascadeTargets);

                    this._motionDebug('register', {
                        ordinary: ordinaryTargets.length,
                        cascade: cascadeTargets.length,
                        batches: this._cascadeBatches.size,
                        enterBounds: this._observedBounds.size,
                        exitBounds: this._exitObservedBounds.size,
                        relayoutListeners: motionRevealRelayoutRegistry.size(),
                        scrollSettleInstances: motionRevealScrollSettleRegistry.size(),
                        scrollSettleListening: motionRevealScrollSettleRegistry.isListening(),
                    });

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
                    this._unobserveAllBounds();
                    this._unobserveAllCascadeBatches();
                    this._queryOwnedRevealTargets().forEach((target) => {
                        target.removeAttribute('data-motion-state');
                        target.removeAttribute('data-motion-resetting');
                        target.removeAttribute('data-motion-staging');
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
                            (event.type === 'transitionend' &&
                                target.classList.contains('swiper-wrapper'))
                        ) {
                            this._scheduleRelayout();
                        }
                    };
                    this.$el.addEventListener('click', this._onSwiperRelayout);
                    this.$el.addEventListener('transitionend', this._onSwiperRelayout);

                    motionRevealRelayoutRegistry.add(this);
                    this._relayoutBound = true;
                    motionRevealScrollSettleRegistry.add(this);
                    this._scrollSettleBound = true;

                    this.$nextTick(() => {
                        if (this._destroyed) return;
                        const generation = this._registrationGeneration;
                        this._requestMotionFrame(() => {
                            this._requestMotionFrame(() => {
                                this._registerTargets();
                            }, generation);
                        }, generation);
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

                        this.on(
                            window,
                            'scroll',
                            this._scheduleThemeEditorViewportFlush.bind(this),
                            { passive: true },
                        );
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

                _onOrdinaryEnter(bound, target, entry) {
                    if (!this._ownsElement(target)) {
                        this._releaseOrdinaryTarget(bound, target);
                        return;
                    }

                    if (!entry.isIntersecting) return;

                    if (target.getAttribute('data-motion-state') === 'revealed') return;
                    if (this._deferToPageLoadFlush) return;
                    if (this._pageLoadQueue.has(target)) return;
                    if (!this._isRevealTargetVisible(target)) return;
                    if (!this._isClipVisible(bound)) return;
                    if (!this._isBoundInInsetViewport(bound)) return;

                    this._beginReveal(target);
                },

                _onOrdinaryExit(bound, target, entry) {
                    if (!this._ownsElement(target)) {
                        this._releaseOrdinaryTarget(bound, target);
                        return;
                    }

                    // Exit observer rootMargin expands by ±64px; non-intersecting means
                    // the bound has fully left the buffered region.
                    if (entry.isIntersecting) return;
                    if (!this._isRevealAlways() || this._shouldSkipAnimation()) return;
                    if (
                        target.getAttribute('data-motion-state') !== 'revealed' &&
                        !this._armedRevealTargets.has(target)
                    ) {
                        return;
                    }

                    this._silentResetTarget(target);
                },

                destroy() {
                    this._destroyed = true;
                    this._invalidateRegistrationWork();
                    this._deferToPageLoadFlush = false;
                    this._clearEditorReplayTimers();
                    this._clearPageLoadTimers();
                    this._clearRelayoutTimer();
                    this._unobserveAllBounds();
                    this._unobserveAllCascadeBatches();
                    if (this._relayoutBound) {
                        motionRevealRelayoutRegistry.remove(this);
                        this._relayoutBound = false;
                    }
                    if (this._scrollSettleBound) {
                        motionRevealScrollSettleRegistry.remove(this);
                        this._scrollSettleBound = false;
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
        },
    };

    /**
     * Module-level shared observers for motion reveal.
     *
     * Contract:
     * - [data-motion-section] owns lifecycle; nearest section owns each target
     * - [data-motion-reveal] is an ordinary content/media animated node
     * - [data-motion-copy] is an independently observed card-copy animated node
     * - [data-motion-copy-bound] optionally stabilizes copy observation geometry
     * - [data-motion-bound] is the stable observation / row-geometry node when present
     * - [data-motion-sequence] assigns ordinary descendant targets a DOM-order stagger
     * - Enter observer: rootMargin bottom -15% (reveal trigger line)
     * - Scroll-settle fallback: reveals pending targets already visible at viewport edges
     * - Exit observer: rootMargin ±EXIT_BUFFER_PX (always silent-reset only after full leave)
     * - cascade stagger timing is owned by JS; ordinary stagger delay is owned by CSS
     */
    const MOTION_REVEAL_PAGE_LOAD_BASE_DELAY_MS = 48;
    const MOTION_REVEAL_TARGET_SELECTOR = '[data-motion-reveal], [data-motion-copy]';
    const MOTION_CASCADE_ROW_TOLERANCE_PX = 8;
    const MOTION_CASCADE_MAX_STAGGER_WINDOW_MS = 500;
    const MOTION_REVEAL_EXIT_BUFFER_PX = 64;
    const MOTION_RELAYOUT_DEBOUNCE_MS = 150;
    const MOTION_SCROLL_SETTLE_MS = 160;

    function motionRevealDebugEnabled() {
        if (typeof window === 'undefined') return false;
        if (document.body?.dataset?.debugMotion === 'true') return true;
        try {
            return /(?:\?|&)debug=motion(?:&|$)/.test(window.location.search);
        } catch (_error) {
            return false;
        }
    }

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

    const motionRevealEnterRegistry = createMotionObserverRegistry('0px 0px -15% 0px');
    const motionCascadeEnterRegistry = createMotionObserverRegistry('0px 0px -15% 0px');
    const motionRevealExitRegistry = createMotionObserverRegistry(
        `${MOTION_REVEAL_EXIT_BUFFER_PX}px 0px ${MOTION_REVEAL_EXIT_BUFFER_PX}px 0px`,
    );

    /**
     * One shared window.resize listener for all motionRevealSection instances.
     * First add() attaches; last remove() detaches.
     */
    const motionRevealRelayoutRegistry = (() => {
        const instances = new Set();
        let listening = false;
        let timerId = null;

        function onResize() {
            if (timerId) clearTimeout(timerId);
            timerId = window.setTimeout(() => {
                timerId = null;
                instances.forEach((instance) => {
                    if (instance && typeof instance._registerTargets === 'function') {
                        instance._registerTargets();
                    }
                });
            }, MOTION_RELAYOUT_DEBOUNCE_MS);
        }

        return {
            add(instance) {
                instances.add(instance);
                if (!listening && typeof window !== 'undefined') {
                    window.addEventListener('resize', onResize, { passive: true });
                    listening = true;
                }
            },

            remove(instance) {
                instances.delete(instance);
                if (instances.size === 0 && listening && typeof window !== 'undefined') {
                    window.removeEventListener('resize', onResize);
                    listening = false;
                    if (timerId) {
                        clearTimeout(timerId);
                        timerId = null;
                    }
                }
            },

            size() {
                return instances.size;
            },

            isListening() {
                return listening;
            },
        };
    })();

    /**
     * One shared passive scroll listener for all motionRevealSection instances.
     * It runs only after scrolling settles and recovers visible pending targets that
     * fast scrolling or the document boundary prevented from crossing the inset line.
     */
    const motionRevealScrollSettleRegistry = (() => {
        const instances = new Set();
        let listening = false;
        let timerId = null;

        function onScroll() {
            if (timerId) clearTimeout(timerId);
            timerId = window.setTimeout(() => {
                timerId = null;
                instances.forEach((instance) => {
                    if (instance && typeof instance._flushPendingInViewport === 'function') {
                        instance._flushPendingInViewport();
                    }
                });
            }, MOTION_SCROLL_SETTLE_MS);
        }

        return {
            add(instance) {
                instances.add(instance);
                if (!listening && typeof window !== 'undefined') {
                    window.addEventListener('scroll', onScroll, { passive: true });
                    listening = true;
                }
            },

            remove(instance) {
                instances.delete(instance);
                if (instances.size === 0 && listening && typeof window !== 'undefined') {
                    window.removeEventListener('scroll', onScroll);
                    listening = false;
                    if (timerId) {
                        clearTimeout(timerId);
                        timerId = null;
                    }
                }
            },

            size() {
                return instances.size;
            },

            isListening() {
                return listening;
            },
        };
    })();
})();
