import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

function syncSlideAriaHidden(swiperContainer) {
    swiperContainer.querySelectorAll('.swiper-slide').forEach((slide) => {
        const isActive = slide.classList.contains('swiper-slide-active');
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        if (isActive) {
            slide.removeAttribute('inert');
        } else {
            slide.setAttribute('inert', '');
        }
    });
}

define('slidesShow', () => ({
    ...useDisposable(),
    _root: null,
    _swiper: null,
    _onSlideChange: null,
    _onKeydown: null,
    _swiperContainer: null,

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
        const swiperContainer = this._root?.querySelector('.swiper');
        this._swiperContainer = swiperContainer;
        if (!swiperContainer) return;

        const slides = this._root.querySelectorAll('.swiper-slide');
        if (slides.length <= 1) {
            syncSlideAriaHidden(swiperContainer);
            return;
        }

        const scriptUrl = this._readSwiperScriptUrl();
        if (!scriptUrl) return;

        try {
            await loadSwiper(scriptUrl);
            if (!this._root) return;

            this._swiper = await createSwiper(swiperContainer, {
                loop: slides.length > 1,
                autoplay: false,
                slidesPerView: 1,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                pagination: false,
                navigation: false,
            });

            if (!this._root) {
                destroySwiper(this._swiper);
                this._swiper = null;
                return;
            }

            this._onSlideChange = () => syncSlideAriaHidden(swiperContainer);
            this._swiper?.on?.('slideChange', this._onSlideChange);
            syncSlideAriaHidden(swiperContainer);

            this._onKeydown = (event) => this._onSwiperKeydown(event);
            this.on(swiperContainer, 'keydown', this._onKeydown);
        } catch (_) {
            destroySwiper(this._swiper);
            this._swiper = null;
        }
    },

    _onSwiperKeydown(event) {
        const swiperContainer = this._swiperContainer;
        const swiper = this._swiper;
        if (!swiperContainer || !swiper) return;

        if (
            event.target !== swiperContainer ||
            (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
        ) {
            return;
        }

        event.preventDefault();
        const moveNext = event.key === (swiper.rtlTranslate ? 'ArrowLeft' : 'ArrowRight');
        if (moveNext) {
            swiper.slideNext();
        } else {
            swiper.slidePrev();
        }
    },

    _teardownSwiper() {
        if (this._swiper && typeof this._swiper.off === 'function' && this._onSlideChange) {
            this._swiper.off('slideChange', this._onSlideChange);
        }

        destroySwiper(this._swiper);
        this._swiper = null;
        this._onSlideChange = null;
        this._swiperContainer = null;
    },

    destroy() {
        this._teardownSwiper();
        this._root = null;
        this.dispose();
    },
}));
