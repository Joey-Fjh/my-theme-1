import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

define('collectionList', () => ({
    ...useDisposable(),
    _root: null,
    _swiper: null,

    init() {
        this._root = this.$el;
        this.$nextTick(() => {
            void this._initSwiper();
        });
    },

    _readSwiperScriptUrl() {
        return this._root?.dataset?.swiperSrc || '';
    },

    async _initSwiper() {
        const swiperEl = this._root?.querySelector('[data-collection-list-swiper]');
        if (!swiperEl) return;

        const scriptUrl = this._readSwiperScriptUrl();
        if (!scriptUrl) return;

        const mobileSlides = parseFloat(this._root.dataset.mobileSlides || '2.3');
        const desktopSlides = parseFloat(this._root.dataset.desktopSlides || '4.4');
        const spaceBetween = parseInt(this._root.dataset.slideGap || '16', 10);
        const prevEl = this._root.querySelector('[data-collection-list-prev]');
        const nextEl = this._root.querySelector('[data-collection-list-next]');

        try {
            await loadSwiper(scriptUrl);
            if (!this._root) return;

            const options = {
                slidesPerView: mobileSlides,
                spaceBetween,
                loop: false,
                watchOverflow: true,
                breakpoints: {
                    768: {
                        slidesPerView: desktopSlides,
                        spaceBetween,
                    },
                },
            };

            if (prevEl && nextEl) {
                options.navigation = { prevEl, nextEl };
            }

            this._swiper = await createSwiper(swiperEl, options);

            if (!this._root) {
                destroySwiper(this._swiper);
                this._swiper = null;
                return;
            }

            this._root.dataset.collectionListMounted = 'true';
        } catch (_) {
            destroySwiper(this._swiper);
            this._swiper = null;
        }
    },

    destroy() {
        destroySwiper(this._swiper);
        this._swiper = null;
        if (this._root) {
            delete this._root.dataset.collectionListMounted;
        }
        this._root = null;
        this.dispose();
    },
}));
