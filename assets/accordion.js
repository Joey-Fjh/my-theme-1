import { define } from 'alpine-adapter';

define('accordion', () => ({
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
}));
