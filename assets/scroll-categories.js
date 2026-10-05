import { define } from 'alpine-adapter';

const DESKTOP_HOVER = '(hover: hover) and (pointer: fine)';

define('scrollCategories', () => ({
    activeIndex: 1,

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
