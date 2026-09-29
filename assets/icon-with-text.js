import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

define('iconWithText', () => ({
    ...useDisposable(),
    _root: null,
    _swiper: null,

    init() {
        this._root = this.$el;
        this.$nextTick(() => {
            void this._initSwiper();
        });
    },

    _readSwiperUrls() {
        const ds = this._root?.dataset || {};
        return {
            scriptUrl: ds.swiperSrc || '',
            cssUrl: ds.swiperCss || '',
        };
    },

    async _initSwiper() {
        if (this._root?.getAttribute('data-enable-carousel') !== 'true') return;

        const swiperEl = this._root.querySelector('[data-icon-with-text-swiper]');
        if (!swiperEl) return;

        const { scriptUrl, cssUrl } = this._readSwiperUrls();
        if (!scriptUrl) return;

        const desktopColumns = parseInt(this._root.getAttribute('data-desktop-columns'), 10) || 3;
        const mobileColumns = parseInt(this._root.getAttribute('data-mobile-columns'), 10) || 1;
        const itemGap = parseInt(this._root.getAttribute('data-item-gap'), 10) || 32;
        const paginationEl = this._root.querySelector('[data-icon-with-text-pagination]');

        try {
            await loadSwiper(scriptUrl, cssUrl);
            if (!this._root) return;

            this._swiper = await createSwiper(swiperEl, {
                initialSlide: 0,
                slidesPerView: mobileColumns,
                slidesPerGroup: mobileColumns,
                spaceBetween: itemGap,
                autoHeight: true,
                observer: true,
                observeParents: true,
                resizeObserver: true,
                watchOverflow: true,
                pagination: paginationEl
                    ? {
                          el: paginationEl,
                          clickable: true,
                      }
                    : false,
                breakpoints: {
                    768: {
                        slidesPerView: desktopColumns,
                        slidesPerGroup: desktopColumns,
                        spaceBetween: itemGap,
                    },
                },
            });

            if (!this._root) {
                destroySwiper(this._swiper);
                this._swiper = null;
            }
        } catch (_) {
            destroySwiper(this._swiper);
            this._swiper = null;
        }
    },

    destroy() {
        destroySwiper(this._swiper);
        this._swiper = null;
        this.dispose();
    },
}));
