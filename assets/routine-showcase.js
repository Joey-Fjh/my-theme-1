import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

define('routineShowcase', () => ({
    ...useDisposable(),
    _root: null,
    _swiper: null,
    _mql: null,
    _mqlHandler: null,
    _swiperContainer: null,

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
        const swiperContainer = this._root?.querySelector('.swiper');
        this._swiperContainer = swiperContainer;
        if (!swiperContainer) return;

        const { scriptUrl, cssUrl } = this._readSwiperUrls();
        if (!scriptUrl) return;

        this._mql = window.matchMedia('(min-width: 768px)');

        try {
            await loadSwiper(scriptUrl, cssUrl);
            if (!this._root) return;

            const createResponsiveSwiper = () => {
                destroySwiper(this._swiper);
                this._swiper = null;

                const isDesktop = this._mql.matches;

                createSwiper(swiperContainer, {
                    direction: isDesktop ? 'vertical' : 'horizontal',
                    slidesPerView: isDesktop ? 4 : 2,
                    slidesPerGroup: isDesktop ? 1 : 2,
                    grid: isDesktop ? { rows: 1 } : { rows: 2, fill: 'row' },
                    autoHeight: false,
                    spaceBetween: 8,
                    speed: 300,
                    loop: false,
                    allowTouchMove: true,
                    navigation: {
                        nextEl: this._root.querySelector('.swiper-button-next'),
                        prevEl: this._root.querySelector('.swiper-button-prev'),
                    },
                }).then((instance) => {
                    if (!this._root) {
                        destroySwiper(instance);
                        return;
                    }
                    this._swiper = instance;
                });
            };

            this._mqlHandler = () => createResponsiveSwiper();
            createResponsiveSwiper();

            const swiperWrap = this._root.querySelector('.routine-showcase__swiper-wrap');
            if (swiperWrap) swiperWrap.classList.add('is-ready');

            this.on(this._mql, 'change', this._mqlHandler);
        } catch (_) {
            destroySwiper(this._swiper);
            this._swiper = null;
        }
    },

    destroy() {
        if (this._mql && this._mqlHandler) {
            this._mql.removeEventListener('change', this._mqlHandler);
        }
        destroySwiper(this._swiper);
        this._swiper = null;
        this._mql = null;
        this._mqlHandler = null;
        this._root = null;
        this.dispose();
    },
}));
