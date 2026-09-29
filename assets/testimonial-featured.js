import { define } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

define('testimonialFeatured', () => ({
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

    _autoplayAllowed() {
        const ds = this._root?.dataset || {};
        const autoSlide = ds.autoSlide === 'true';
        const slideDelay = parseInt(ds.slideDelay, 10) || 5;
        const prefersReducedMotion = Utils.prefersReducedMotion();
        const autoplayAllowed =
            autoSlide && document.body?.dataset?.motionEnabled !== 'false' && !prefersReducedMotion;

        return { autoplayAllowed, slideDelay };
    },

    async _initSwiper() {
        const slides = this._root?.querySelectorAll('.swiper-slide');
        const swiperContainer = this._root?.querySelector('.swiper');
        if (!swiperContainer || !slides?.length) return;

        const scriptUrl = this._readSwiperScriptUrl();
        if (!scriptUrl) return;

        const { autoplayAllowed, slideDelay } = this._autoplayAllowed();

        try {
            await loadSwiper(scriptUrl);
            if (!this._root) return;

            this._swiper = await createSwiper(swiperContainer, {
                loop: slides.length > 1,
                autoHeight: true,
                autoplay: autoplayAllowed
                    ? {
                          delay: slideDelay * 1000,
                          disableOnInteraction: false,
                      }
                    : false,
                slidesPerView: 1,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                pagination: false,
                navigation: false,
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
        this._root = null;
        this.dispose();
    },
}));
