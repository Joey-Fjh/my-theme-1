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

                emitHeaderMenuActive(active) {
                    if (!headerMenuActiveEvent || typeof ThemeEvents?.emit !== 'function') return;

                    ThemeEvents.emit(headerMenuActiveEvent, { active: Boolean(active) });
                },

                onHeaderEnter() {
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
                    this.close(from);
                    this.emitHeaderMenuActive(false);
                },

                toggle(target) {
                    const current = target.closest('[data-dropdown]');

                    if (!current) return;

                    const deep = Number(current.dataset.deep);

                    if (this.openEls[deep] === current) {
                        this.close(deep);
                        return;
                    }

                    this.close(deep);

                    current.setAttribute('open', '');
                    this.openEls[deep] = current;
                },

                close(from = 0) {
                    for (let i = from; i < this.openEls.length; i++) {
                        const el = this.openEls[i];

                        if (el) {
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
                _startScrollLeft: 0,
                _suppressClickUntil: 0,

                init() {
                    this.$nextTick(() => {
                        const count = this.tabs.length;
                        if (count === 0) return;

                        this.scroller = this.getHorizontalScrollParent(this.tabs[0]);
                        if (this.scrollMode === 'always' && this.scroller) {
                            this.on(this.scroller, 'pointerdown', this.onPointerDown.bind(this));
                            this.on(window, 'pointermove', this.onPointerMove.bind(this), {
                                passive: false,
                            });
                            this.on(window, 'pointerup', this.endDrag.bind(this));
                            this.on(window, 'pointercancel', this.endDrag.bind(this));
                            this.on(this.scroller, 'click', this.onClickCapture.bind(this), true);
                            this.on(window, 'resize', this.onResize.bind(this));
                        }

                        const nextIndex = initialStrategy === 'first' ? 0 : Math.floor(count / 2);
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
                        this.scrollMode === 'always' &&
                        !this.isMobileViewport() &&
                        this.scroller &&
                        this.scroller.scrollWidth > this.scroller.clientWidth
                    );
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
                    if (!this.canDragScroll()) return;
                    if (event.pointerType === 'mouse' && event.button !== 0) return;

                    this._pointerDown = true;
                    this._dragging = false;
                    this._startX = event.clientX;
                    this._startScrollLeft = this.scroller.scrollLeft;
                },

                onPointerMove(event) {
                    if (!this._pointerDown || !this.scroller) return;

                    const deltaX = event.clientX - this._startX;
                    if (!this._dragging && Math.abs(deltaX) >= 6) {
                        this._dragging = true;
                    }

                    if (!this._dragging) return;

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

        countdownTimer(endDate) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                endDate,
                interval: null,
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,

                getValue(key) {
                    return this[key]?.toString() || '0';
                },

                init() {
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
    };
})();
