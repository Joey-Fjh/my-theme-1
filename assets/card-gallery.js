import { define } from 'alpine-adapter';

export function createCardGalleryState(initial = {}) {
    let imageCount = Math.max(1, Number(initial.imageCount) || 1);
    let enableImageNavigation = initial.enableImageNavigation !== false;
    let activeImageIndex = 0;

    return {
        get imageCount() {
            return imageCount;
        },
        set imageCount(value) {
            imageCount = Math.max(1, Number(value) || 1);
        },
        get enableImageNavigation() {
            return enableImageNavigation;
        },
        set enableImageNavigation(value) {
            enableImageNavigation = value !== false;
        },
        get activeImageIndex() {
            return activeImageIndex;
        },
        set activeImageIndex(value) {
            activeImageIndex = value;
        },

        _hydrateFromDataset(el) {
            const dataset = el?.dataset || {};
            if (dataset.imageCount !== undefined && dataset.imageCount !== '') {
                imageCount = Math.max(1, Number(dataset.imageCount) || 1);
            }
            if (
                dataset.enableImageNavigation !== undefined &&
                dataset.enableImageNavigation !== ''
            ) {
                enableImageNavigation = dataset.enableImageNavigation !== 'false';
            }
        },

        _syncNavigationState(el) {
            this._hydrateFromDataset(el);
            const slideCount = el?.querySelectorAll?.(
                '[data-product-card-carousel-slide][data-index]',
            ).length;
            if (slideCount > 1) {
                imageCount = Math.max(imageCount, slideCount);
            }
        },

        get hasMultipleImages() {
            return imageCount > 1;
        },

        get canNavigateImages() {
            return enableImageNavigation && imageCount > 1;
        },

        get canPaginateImages() {
            return this.canNavigateImages;
        },

        get imageNavigationLabel() {
            return `${activeImageIndex + 1}/${imageCount}`;
        },

        get paginationLabel() {
            return this.imageNavigationLabel;
        },

        setActiveImage(index, el) {
            this._syncNavigationState(el);
            if (!this.canNavigateImages) return;
            activeImageIndex = this._normalizeIndex(index);
        },

        nextImage(el) {
            this._syncNavigationState(el);
            if (!this.canNavigateImages) return;
            this.setActiveImage(activeImageIndex + 1, el);
        },

        prevImage(el) {
            this._syncNavigationState(el);
            if (!this.canNavigateImages) return;
            this.setActiveImage(activeImageIndex - 1, el);
        },

        _normalizeIndex(index) {
            const total = imageCount;
            return ((Number(index) % total) + total) % total;
        },
    };
}

define('cardGallery', (options = {}) => {
    if (options.enableImagePagination !== undefined && options.enableImageNavigation === true) {
        options.enableImageNavigation = options.enableImagePagination;
    }

    const gallery = createCardGalleryState({
        imageCount: options.imageCount,
        enableImageNavigation: options.enableImageNavigation,
    });

    return {
        get imageCount() {
            return gallery.imageCount;
        },
        set imageCount(value) {
            gallery.imageCount = value;
        },
        get enableImageNavigation() {
            return gallery.enableImageNavigation;
        },
        set enableImageNavigation(value) {
            gallery.enableImageNavigation = value;
        },
        get activeImageIndex() {
            return gallery.activeImageIndex;
        },
        set activeImageIndex(value) {
            gallery.activeImageIndex = value;
        },
        get hasMultipleImages() {
            return gallery.hasMultipleImages;
        },
        get canNavigateImages() {
            return gallery.canNavigateImages;
        },
        get canPaginateImages() {
            return gallery.canPaginateImages;
        },
        get imageNavigationLabel() {
            return gallery.imageNavigationLabel;
        },
        get paginationLabel() {
            return gallery.paginationLabel;
        },

        init() {
            gallery._hydrateFromDataset(this.$el);
        },

        setActiveImage(index) {
            gallery.setActiveImage(index, this.$el);
        },

        nextImage() {
            gallery.nextImage(this.$el);
        },

        prevImage() {
            gallery.prevImage(this.$el);
        },
    };
});
