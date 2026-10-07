import { define } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';
import { bindCardRail } from 'card-rail';

const DESKTOP_MQL = '(min-width: 1024px)';

define('routineShowcase', () => ({
    ...useDisposable(),
    activeIndex: 0,
    focusIndex: 0,
    tabs: [],
    panels: [],
    _root: null,
    _barFills: [],
    _desktopMql: null,
    _autoplayEnabled: false,
    _autoplaySpeedSec: 5,
    _thumbPointerPaused: false,
    _thumbSuppressPauseUntilLeave: false,
    _focusVisiblePaused: false,
    _viewportPaused: true,
    _hiddenPaused: false,
    _reducedMotion: false,
    _viewportObserver: null,
    _progressListener: null,
    _mobileRailBinding: null,

    init() {
        this._root = this.$el;
        this._hydrateDataset();
        this._reducedMotion = Utils.prefersReducedMotion();
        this._desktopMql = window.matchMedia(DESKTOP_MQL);

        const initial = Number(this._root.dataset.initialActive);
        if (Number.isFinite(initial) && initial >= 0) {
            this.activeIndex = initial;
            this.focusIndex = initial;
        }

        this._barFills = Array.from(this._root.querySelectorAll('[data-routine-bar-fill]'));

        this._progressListener = (event) => {
            if (event.animationName !== 'routine-showcase-progress') return;
            if (!this._shouldAdvanceAutoplay()) return;
            if (event.target !== this._activeBarFill()) return;
            this._advanceAutoplay();
        };
        this.on(this._root, 'animationend', this._progressListener);

        this.on(document, 'visibilitychange', () => {
            this._hiddenPaused = document.hidden;
            this._updateAutoplayPauseClass();
        });

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                this._viewportPaused = !entry?.isIntersecting;
                this._updateAutoplayPauseClass();
            },
            { threshold: 0.15 },
        );
        observer.observe(this._root);
        this._viewportObserver = observer;

        this.on(this._desktopMql, 'change', () => this._rebindMobileRail());

        this.$nextTick(() => {
            this._applyStaticA11y();
            this._applyBarStates(true);
            this._bindMobileDots();
            this._rebindMobileRail();
        });
    },

    _rebindMobileRail() {
        this._mobileRailBinding?.disconnect();
        this._mobileRailBinding = null;
        if (this._desktopMql.matches) return;

        const rail = this._root?.querySelector('[data-routine-mobile-rail]');
        const cards = this._root?.querySelectorAll('[data-routine-mobile-card]');
        if (!rail || !cards?.length) return;

        this._mobileRailBinding = bindCardRail({
            root: this._root,
            rail,
            cards,
            onActiveIndex: (index) => {
                this.activeIndex = index;
            },
            getIndexFromCard: (el) => Number(el.dataset.cardRailIndex),
        });
    },

    _bindMobileDots() {
        this._root?.querySelectorAll('[data-routine-mobile-dot]').forEach((button) => {
            this.on(button, 'click', () => {
                const index = Number(button.dataset.cardRailIndex);
                if (!Number.isFinite(index)) return;
                this._mobileRailBinding?.scrollToIndex(index);
            });
        });
    },

    mobileDotClassFromEl(el) {
        const index = Number(el?.dataset?.cardRailIndex);
        return { 'is-active': Number.isFinite(index) && this.activeIndex === index };
    },

    mobileDotAriaCurrentFromEl(el) {
        const index = Number(el?.dataset?.cardRailIndex);
        return Number.isFinite(index) && this.activeIndex === index ? 'true' : 'false';
    },

    _hydrateDataset() {
        const ds = this._root?.dataset;
        if (!ds) return;
        this._autoplayEnabled = ds.autoplay === 'true';
        const speed = Number.parseFloat(ds.autoplaySpeed);
        if (Number.isFinite(speed) && speed > 0) {
            this._autoplaySpeedSec = speed;
        }
        this._root.style.setProperty('--routine-autoplay-duration', `${this._autoplaySpeedSec}s`);
    },

    registerTab(tab) {
        const index = this.tabs.length;
        this.tabs.push(tab);
        if (tab instanceof HTMLElement) {
            tab.dataset.tabIndex = String(index);
            const thumb = tab.querySelector('.routine-showcase__tab-thumb');
            if (thumb) {
                this.on(thumb, 'pointerenter', () => this._onTabThumbPointerEnter(tab));
                this.on(thumb, 'pointerleave', () => this._onTabThumbPointerLeave());
            }
            this.on(tab, 'focusin', () => this._onTabFocusIn(tab));
            this.on(tab, 'focusout', () => this._onTabFocusOut());
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

    panelIndexFor(el) {
        if (!(el instanceof HTMLElement)) return -1;
        const fromDataset = Number(el.dataset.tabIndex);
        if (Number.isFinite(fromDataset)) return fromDataset;
        return this.panels.indexOf(el);
    },

    isActive(index) {
        return this.activeIndex === Number(index);
    },

    isFocusable(index) {
        return this.focusIndex === Number(index);
    },

    setActive(index, options = {}) {
        const next = Number(index);
        if (!Number.isFinite(next) || next < 0 || next >= this.tabs.length) {
            return;
        }
        this.activeIndex = next;
        if (options.updateFocus !== false) {
            this.focusIndex = next;
        }
        this._thumbPointerPaused = false;
        this._syncFocusVisiblePause();
        this._applyStaticA11y();
        this._applyBarStates(true);
    },

    selectTabFromEl(el) {
        this._thumbSuppressPauseUntilLeave = true;
        this._thumbPointerPaused = false;
        this.setActive(this.tabIndexFor(el));
    },

    _onTabThumbPointerEnter(tab) {
        if (this.tabIndexFor(tab) !== this.activeIndex) return;
        if (this._thumbSuppressPauseUntilLeave) return;
        this._thumbPointerPaused = true;
        this._updateAutoplayPauseClass();
    },

    _onTabThumbPointerLeave() {
        this._thumbSuppressPauseUntilLeave = false;
        this._thumbPointerPaused = false;
        this._updateAutoplayPauseClass();
    },

    _onTabFocusIn(tab) {
        this._syncFocusVisiblePause(tab);
    },

    _onTabFocusOut() {
        this._focusVisiblePaused = false;
        this._updateAutoplayPauseClass();
    },

    _syncFocusVisiblePause(tab = null) {
        const activeTab = tab ?? this.tabs[this.activeIndex];
        const shouldPause =
            activeTab instanceof HTMLElement &&
            activeTab === document.activeElement &&
            activeTab.matches(':focus-visible') &&
            this.tabIndexFor(activeTab) === this.activeIndex;
        this._focusVisiblePaused = shouldPause;
        this._updateAutoplayPauseClass();
    },

    onTabKeydown(event) {
        const tab = event.target?.closest?.('[role="tab"]');
        const currentIndex = this.tabs.indexOf(tab);
        if (currentIndex < 0) return;

        let nextIndex = null;
        if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = this.tabs.length - 1;
        } else if (event.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % this.tabs.length;
        } else if (event.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
        }

        if (nextIndex === null) return;
        event.preventDefault();
        this._thumbSuppressPauseUntilLeave = false;
        this.setActive(nextIndex, { updateFocus: false });
        this.focusIndex = nextIndex;
        const nextTab = this.tabs[nextIndex];
        if (nextTab instanceof HTMLElement) {
            nextTab.focus({ preventScroll: true });
        }
        this.$nextTick(() => this._syncFocusVisiblePause(nextTab));
    },

    ariaSelected(index) {
        return this.isActive(index) ? 'true' : 'false';
    },

    tabActiveClass(index) {
        return {
            'is-active': this.isActive(index),
        };
    },

    _indexFromEl(el) {
        if (!(el instanceof HTMLElement)) return -1;
        const fromItem = Number(el.dataset.itemIndex);
        if (Number.isFinite(fromItem)) return fromItem;
        return this.tabIndexFor(el);
    },

    infoClassFromEl(el) {
        return this.infoClass(this._indexFromEl(el));
    },

    panelClassFromEl(el) {
        return this.panelClass(this._indexFromEl(el));
    },

    sideLabelClassFromEl(el) {
        return this.sideLabelClass(this._indexFromEl(el));
    },

    barClassFromEl(el) {
        return this.barClass(this._indexFromEl(el));
    },

    tabActiveClassFromEl(el) {
        return this.tabActiveClass(this._indexFromEl(el));
    },

    tabTabindexFromEl(el) {
        return this.isFocusable(this._indexFromEl(el)) ? 0 : -1;
    },

    tabAriaSelectedFromEl(el) {
        return this.ariaSelected(this._indexFromEl(el));
    },

    panelClass(index) {
        return {
            'is-active': this.isActive(index),
            'routine-showcase__panel--inactive': !this.isActive(index),
        };
    },

    infoClass(index) {
        return {
            'is-active': this.isActive(index),
            'routine-showcase__info--inactive': !this.isActive(index),
        };
    },

    sideLabelClass(index) {
        return {
            'is-active': this.isActive(index),
            'routine-showcase__side-label--inactive': !this.isActive(index),
        };
    },

    barClass(index) {
        return {
            'is-active': this.isActive(index),
        };
    },

    counterCurrent() {
        const value = this.activeIndex + 1;
        return value < 10 ? `0${value}` : String(value);
    },

    counterTotal() {
        const value = this.tabs.length;
        return value < 10 ? `0${value}` : String(value);
    },

    _applyStaticA11y() {
        this.tabs.forEach((tab, index) => {
            if (!(tab instanceof HTMLElement)) return;
            const selected = index === this.activeIndex;
            tab.setAttribute('aria-selected', selected ? 'true' : 'false');
            tab.tabIndex = index === this.focusIndex ? 0 : -1;
        });
    },

    _activeBarFill() {
        return this._barFills[this.activeIndex] ?? null;
    },

    _isAutoplayFrozen() {
        return (
            this._thumbPointerPaused ||
            this._focusVisiblePaused ||
            this._viewportPaused ||
            this._hiddenPaused
        );
    },

    _canRunAutoplayAnimation() {
        if (this._reducedMotion) return false;
        if (!this._autoplayEnabled) return false;
        if (this.tabs.length < 2) return false;
        if (!this._desktopMql?.matches) return false;
        return true;
    },

    _shouldAdvanceAutoplay() {
        return this._canRunAutoplayAnimation() && !this._isAutoplayFrozen();
    },

    _updateAutoplayPauseClass() {
        if (!this._root) return;
        this._root.classList.toggle(
            'is-autoplay-paused',
            this._canRunAutoplayAnimation() && this._isAutoplayFrozen(),
        );
    },

    _applyBarStates(restartActiveAnimation = false) {
        const canAnimate = this._canRunAutoplayAnimation();
        this._updateAutoplayPauseClass();

        this._barFills.forEach((fill, index) => {
            if (!(fill instanceof HTMLElement)) return;
            fill.classList.remove('is-animating', 'is-static-full');

            if (index !== this.activeIndex) return;

            if (!canAnimate) {
                fill.classList.add('is-static-full');
                return;
            }

            if (restartActiveAnimation) {
                fill.classList.remove('is-animating');
                void fill.offsetWidth;
            }
            fill.classList.add('is-animating');
        });
    },

    _advanceAutoplay() {
        this._thumbSuppressPauseUntilLeave = false;
        this._thumbPointerPaused = false;
        const next = (this.activeIndex + 1) % this.tabs.length;
        this.setActive(next);
    },

    destroy() {
        if (this._progressListener) {
            this._root?.removeEventListener('animationend', this._progressListener);
        }
        this._viewportObserver?.disconnect();
        this._viewportObserver = null;
        this._mobileRailBinding?.disconnect();
        this._mobileRailBinding = null;
        this._root = null;
        this.tabs = [];
        this.panels = [];
        this._barFills = [];
        this.dispose();
    },
}));
