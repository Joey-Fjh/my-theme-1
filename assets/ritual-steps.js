import { define } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';
import ThemeEvents from 'events';

const DESKTOP_MQL = '(min-width: 64rem)';
const CENTER_IO_OPTIONS = { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 };

function motionAllowed() {
    if (document.body?.dataset?.motionEnabled === 'false') return false;
    if (Utils.prefersReducedMotion()) return false;
    return true;
}

function scrollBehavior() {
    return motionAllowed() ? 'smooth' : 'instant';
}

define('ritualSteps', () => ({
    ...useDisposable(),
    activeIndex: 0,
    _root: null,
    _desktopMql: null,
    _observers: [],
    _offEditorSelect: null,
    _swingFrame: 0,

    init() {
        this._root = this.$el;
        this._desktopMql = window.matchMedia(DESKTOP_MQL);

        const initial = Number(this._root.dataset.initialActive);
        if (Number.isFinite(initial) && initial >= 0) {
            this.activeIndex = initial;
        }

        this._root.classList.add('ritual-steps--enhanced');
        if (motionAllowed()) {
            this._root.classList.add('ritual-steps--motion');
        }

        const events = ThemeEvents.events;
        this._offEditorSelect = ThemeEvents.on(
            events.SHOPIFY_BLOCK_SELECT,
            (e) => this._onEditorBlockSelect(e),
            { target: this._root },
        );

        this.on(this._desktopMql, 'change', () => this._rebindObservers());

        this.$nextTick(() => {
            this._bindNav();
            this._setupObservers();
        });
    },

    _stepCount() {
        return Number(this._root?.dataset.stepCount) || 0;
    },

    _layout() {
        return this._root?.dataset.layout || 'sticky_media';
    },

    _rebindObservers() {
        this._teardownObservers();
        this._setupObservers();
    },

    _teardownObservers() {
        this._observers.forEach((observer) => observer.disconnect());
        this._observers = [];
    },

    _setupObservers() {
        if (!this._root) return;
        if (this._desktopMql.matches) {
            if (this._layout() === 'sticky_media') {
                this._setupStickyMediaObservers();
            } else {
                this._setupCarouselObservers();
            }
        } else {
            this._setupMobileRailObserver();
        }
    },

    _setupStickyMediaObservers() {
        const targets = this._root.querySelectorAll('[data-ritual-step-text]');
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const index = Number(entry.target.dataset.stepIndex);
                if (Number.isFinite(index)) this.setActive(index);
            });
        }, CENTER_IO_OPTIONS);

        targets.forEach((target) => observer.observe(target));
        this._observers.push(observer);
    },

    _setupCarouselObservers() {
        const targets = this._root.querySelectorAll('[data-ritual-sentinel]');
        if (!targets.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const index = Number(entry.target.dataset.stepIndex);
                if (Number.isFinite(index)) this.setActive(index);
            });
        }, CENTER_IO_OPTIONS);

        targets.forEach((target) => observer.observe(target));
        this._observers.push(observer);
    },

    _setupMobileRailObserver() {
        const rail = this._root.querySelector('[data-ritual-mobile-rail]');
        const cards = this._root.querySelectorAll('[data-ritual-mobile-card]');
        if (!rail || !cards.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                let best = null;
                let bestRatio = 0;
                entries.forEach((entry) => {
                    if (entry.intersectionRatio > bestRatio) {
                        bestRatio = entry.intersectionRatio;
                        best = entry;
                    }
                });
                if (best?.isIntersecting) {
                    const index = Number(best.target.dataset.stepIndex);
                    if (Number.isFinite(index)) this.setActive(index);
                }
            },
            { root: rail, threshold: [0.35, 0.55, 0.75] },
        );

        cards.forEach((card) => observer.observe(card));
        this._observers.push(observer);
    },

    _bindNav() {
        this._root?.querySelectorAll('[data-ritual-nav-button]').forEach((button) => {
            this.on(button, 'click', () => {
                const index = Number(button.dataset.stepIndex);
                if (!Number.isFinite(index)) return;
                if (this._desktopMql.matches && this._layout() === 'scroll_carousel') {
                    this._scrollToSentinel(index);
                } else {
                    this._scrollMobileToIndex(index);
                }
            });
        });
    },

    _scrollToSentinel(index) {
        const sentinel = this._root.querySelector(
            `[data-ritual-sentinel][data-step-index="${index}"]`,
        );
        if (!sentinel) return;
        sentinel.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    },

    _scrollMobileToIndex(index) {
        const rail = this._root.querySelector('[data-ritual-mobile-rail]');
        const card = this._root.querySelector(
            `[data-ritual-mobile-card][data-step-index="${index}"]`,
        );
        if (!rail || !card) return;
        rail.scrollTo({
            left: card.offsetLeft,
            behavior: scrollBehavior(),
        });
        this.setActive(index);
    },

    setActive(index, options = {}) {
        const next = Number(index);
        const count = this._stepCount();
        if (!Number.isFinite(next) || next < 0 || next >= count) return;

        const prev = this.activeIndex;
        if (next === prev && !options.force) return;

        this.activeIndex = next;

        if (
            motionAllowed() &&
            this._layout() === 'scroll_carousel' &&
            this._desktopMql?.matches &&
            prev !== next
        ) {
            this._triggerSwing(next);
        }
    },

    _triggerSwing(index) {
        if (this._swingFrame) cancelAnimationFrame(this._swingFrame);
        this._swingFrame = requestAnimationFrame(() => {
            this._swingFrame = 0;
            const packshot = this._root.querySelector(
                `[data-ritual-packshot][data-step-index="${index}"]`,
            );
            if (!(packshot instanceof HTMLElement)) return;
            packshot.classList.remove('is-swinging');
            void packshot.offsetWidth;
            packshot.classList.add('is-swinging');
        });
    },

    _onEditorBlockSelect(event) {
        const detail = event.detail || {};
        const sectionId = this._root?.dataset.sectionId || '';
        if (detail.sectionId && String(detail.sectionId) !== sectionId) return;

        const blockId = detail.blockId;
        if (!blockId) return;

        const blockEl = this._root.querySelector(`[data-ritual-block-id="${blockId}"]`);
        if (!(blockEl instanceof HTMLElement)) return;

        const index = Number(blockEl.dataset.stepIndex);
        if (!Number.isFinite(index)) return;

        this.setActive(index, { force: true });

        if (this._desktopMql.matches && this._layout() === 'scroll_carousel') {
            this._scrollToSentinel(index);
        } else if (!this._desktopMql.matches) {
            this._scrollMobileToIndex(index);
        }
    },

    _indexFromEl(el) {
        return Number(el?.dataset?.stepIndex);
    },

    stepTextClassFromEl(el) {
        return { 'is-active': this.activeIndex === this._indexFromEl(el) };
    },

    sceneLayerClassFromEl(el) {
        return { 'is-active': this.activeIndex === this._indexFromEl(el) };
    },

    panelClassFromEl(el) {
        return { 'is-active': this.activeIndex === this._indexFromEl(el) };
    },

    navButtonClassFromEl(el) {
        return { 'is-active': this.activeIndex === this._indexFromEl(el) };
    },

    navAriaCurrentFromEl(el) {
        return this.activeIndex === this._indexFromEl(el) ? 'step' : false;
    },

    dotAriaCurrentFromEl(el) {
        return this.activeIndex === this._indexFromEl(el) ? 'true' : 'false';
    },

    dotClassFromEl(el) {
        return { 'is-active': this.activeIndex === this._indexFromEl(el) };
    },

    destroy() {
        if (this._swingFrame) cancelAnimationFrame(this._swingFrame);
        this._swingFrame = 0;
        this._teardownObservers();
        this._offEditorSelect?.();
        this._offEditorSelect = null;
        this._root?.classList.remove('ritual-steps--enhanced', 'ritual-steps--motion');
        this._root = null;
        this.dispose();
    },
}));
