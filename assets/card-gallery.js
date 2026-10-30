import { define } from 'alpine-adapter';

export function createCardGalleryState(initial = {}) {
    let imageCount = Math.max(1, Number(initial.imageCount) || 1);
    let enableImageNavigation = initial.enableImageNavigation !== false;

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

        imageNavigationLabel(activeImageIndex) {
            const index = Number(activeImageIndex) || 0;
            return `${index + 1}/${imageCount}`;
        },

        paginationLabel(activeImageIndex) {
            return this.imageNavigationLabel(activeImageIndex);
        },

        setActiveImage(index, el, currentIndex = 0) {
            this._syncNavigationState(el);
            if (!this.canNavigateImages) return currentIndex;
            return this._normalizeIndex(index);
        },

        nextImage(el, currentIndex = 0) {
            this._syncNavigationState(el);
            if (!this.canNavigateImages) return currentIndex;
            return this._normalizeIndex(currentIndex + 1);
        },

        prevImage(el, currentIndex = 0) {
            this._syncNavigationState(el);
            if (!this.canNavigateImages) return currentIndex;
            return this._normalizeIndex(currentIndex - 1);
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
        activeImageIndex: 0,

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
            return gallery.imageNavigationLabel(this.activeImageIndex);
        },
        get paginationLabel() {
            return gallery.paginationLabel(this.activeImageIndex);
        },

        init() {
            gallery._hydrateFromDataset(this.$el);
        },

        setActiveImage(index) {
            this.activeImageIndex = gallery.setActiveImage(index, this.$el, this.activeImageIndex);
        },

        nextImage() {
            this.activeImageIndex = gallery.nextImage(this.$el, this.activeImageIndex);
        },

        prevImage() {
            this.activeImageIndex = gallery.prevImage(this.$el, this.activeImageIndex);
        },
    };
});
