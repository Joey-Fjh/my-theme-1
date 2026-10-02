import { define } from 'alpine-adapter';

define('progressiveList', () => ({
    initialVisibleCount: 6,
    stepCount: 6,
    visibleCount: 6,

    init() {
        const nextVisibleCount = Number(this.$el.dataset.visibleCount);
        const nextStepCount = Number(this.$el.dataset.stepCount);

        this.initialVisibleCount =
            Number.isFinite(nextVisibleCount) && nextVisibleCount > 0 ? nextVisibleCount : 6;
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
        this.visibleCount = Math.min(normalizedTotal, this.visibleCount + this.stepCount);
    },

    showLess() {
        this.visibleCount = this.initialVisibleCount;
    },

    toggleShowMore(totalCount) {
        const total = Number(totalCount) || 0;
        if (this.canShowMore(total)) this.showMore(total);
        else this.showLess();
    },

    // The total lives on the component root; the labels on the toggle button. $el is the
    // button (click) or its label span (x-text), so read both from there.
    toggleShowMoreFromDataset() {
        this.toggleShowMore(this.$root.dataset.totalCount);
    },

    showMoreToggleLabel(totalCount) {
        const total = Number(totalCount) || 0;
        const labels = this.$el.closest('[data-show-more-label]')?.dataset || {};
        return this.canShowMore(total) ? labels.showMoreLabel : labels.showLessLabel;
    },

    showMoreToggleLabelFromDataset() {
        return this.showMoreToggleLabel(this.$root.dataset.totalCount);
    },

    isVisibleFor(el) {
        const index = el?.dataset?.itemIndex;
        return this.isVisible(index);
    },

    visibilityClassFor(el) {
        return { hidden: !this.isVisibleFor(el) };
    },

    itemVisibilityClass(index) {
        return { hidden: !this.isVisible(index) };
    },
}));
