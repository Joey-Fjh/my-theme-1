import { define, data } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';

define('tabControl', (initialStrategy = 'first', options = {}) => ({
    ...useDisposable(),
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
    _initialTabIndex: null,
    _sectionScope: '',

    _hydrateFromDataset() {
        const ds = this.$el?.dataset;
        if (!ds) return;
        if (ds.tabInitialStrategy) this._initialStrategy = ds.tabInitialStrategy;
        if (ds.tabScrollMode) {
            this.scrollMode = ds.tabScrollMode === 'always' ? 'always' : 'mobile';
        }
        if (ds.tabInitialIndex !== undefined && ds.tabInitialIndex !== '') {
            this._initialTabIndex = Number(ds.tabInitialIndex);
        }
        if (ds.sectionScope) this._sectionScope = ds.sectionScope;
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

            let nextIndex =
                Number.isFinite(this._initialTabIndex) && this._initialTabIndex >= 0
                    ? this._initialTabIndex
                    : this._initialStrategy === 'first'
                      ? 0
                      : Math.floor(count / 2);
            if (nextIndex >= count) nextIndex = 0;
            this.setActive(nextIndex, { centerOnMobile: true, behavior: 'auto' });
        });
    },

    registerTab(tab) {
        const index = this.tabs.length;
        this.tabs.push(tab);
        if (tab instanceof HTMLElement) {
            tab.dataset.tabIndex = String(index);
        }
        return index;
    },

    registerPanel(panel) {
        const index = this.panels.length;
        this.panels.push(panel);
        if (panel instanceof HTMLElement) {
            panel.dataset.tabIndex = String(index);
        }
        return index;
    },

    tabIndexFor(el) {
        if (!(el instanceof HTMLElement)) return -1;
        const fromDataset = Number(el.dataset.tabIndex);
        if (Number.isFinite(fromDataset)) return fromDataset;
        return this.tabs.indexOf(el);
    },

    setActive(index, options = {}) {
        if (index < 0 || index >= this.tabs.length) return;
        this.activeIndex = index;
        this.focusIndex = index;

        this.$nextTick(() => {
            this.scrollActiveTabIntoView(index, options);
        });
    },

    setSearchTab(index, tabKey) {
        this.setActive(index);
        const host = this.$el.closest(
            '[data-predictive-search-root], [data-module-id="predictive-search"]',
        );
        if (!host) return;
        const scope = data(host);
        if (scope && Object.prototype.hasOwnProperty.call(scope, 'activeTab')) {
            scope.activeTab = tabKey;
        }
    },

    panelIndexFor(el) {
        if (!(el instanceof HTMLElement)) return -1;
        const fromDataset = Number(el.dataset.tabIndex);
        if (Number.isFinite(fromDataset)) return fromDataset;
        return this.panels.indexOf(el);
    },

    panelAriaLabelledBy() {
        if (!this._sectionScope) return '';
        return `search-${this._sectionScope}-tab-${this.activeIndex}`;
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

        const orientation = this.scroller?.getAttribute('aria-orientation') || 'horizontal';
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
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
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
        if (Utils.prefersReducedMotion()) {
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
}));
