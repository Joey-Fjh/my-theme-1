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

    toggleShowMoreFromDataset() {
        this.toggleShowMore(this.$el.dataset.totalCount);
    },

    showMoreToggleLabel(totalCount) {
        const total = Number(totalCount) || 0;
        return this.canShowMore(total)
            ? this.$el.dataset.showMoreLabel
            : this.$el.dataset.showLessLabel;
    },

    showMoreToggleLabelFromDataset() {
        return this.showMoreToggleLabel(this.$el.dataset.totalCount);
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
