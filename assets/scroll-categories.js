import { define } from 'alpine-adapter';

const DESKTOP_HOVER = '(hover: hover) and (pointer: fine)';
const TWO_COLUMN_LAYOUT = '(min-width: 64rem)';

define('scrollCategories', () => ({
    activeIndex: 1,
    // Active state at pointerdown: a tap can focus the link (and activate the row) before click.
    pointerDownWasActive: null,

    init() {
        const initial = Number(this.$el.dataset.initialActive);
        if (Number.isFinite(initial) && initial > 0) {
            this.activeIndex = initial;
        }
    },

    setActive(index) {
        const next = Number(index);
        if (!Number.isFinite(next) || next < 1) return;
        this.activeIndex = next;
    },

    indexFromEl(el) {
        return Number(el?.dataset?.itemIndex);
    },

    setActiveFromEl(el) {
        this.setActive(this.indexFromEl(el));
    },

    onRowEnterFromEl(el) {
        if (!window.matchMedia(DESKTOP_HOVER).matches) return;
        this.setActive(this.indexFromEl(el));
    },

    onRowLinkPointerDown(event) {
        const row = event.currentTarget.closest('.scroll-categories__row');
        this.pointerDownWasActive = row ? this.isActive(this.indexFromEl(row)) : null;
    },

    onRowLinkClick(event) {
        // Keyboard activation dispatches click with detail 0; only a pointer click uses the pointerdown record.
        const wasActive = event.detail > 0 ? this.pointerDownWasActive : null;
        this.pointerDownWasActive = null;

        if (!window.matchMedia(TWO_COLUMN_LAYOUT).matches) return;
        if (window.matchMedia(DESKTOP_HOVER).matches) return;

        const row = event.currentTarget.closest('.scroll-categories__row');
        if (!row) return;

        const index = this.indexFromEl(row);
        if (!Number.isFinite(index)) return;

        if (!(wasActive ?? this.isActive(index))) {
            event.preventDefault();
            this.setActive(index);
        }
    },

    onRowEnter(index) {
        if (!window.matchMedia(DESKTOP_HOVER).matches) return;
        this.setActive(index);
    },

    isActive(index) {
        return this.activeIndex === Number(index);
    },

    rowClass(index) {
        return {
            'is-active': this.isActive(index),
            'is-inactive': !this.isActive(index),
        };
    },

    rowClassFromEl(el) {
        return this.rowClass(this.indexFromEl(el));
    },

    detailsClass(index) {
        return {
            'is-active': this.isActive(index),
        };
    },

    detailsClassFromEl(el) {
        return this.detailsClass(this.indexFromEl(el));
    },
}));
