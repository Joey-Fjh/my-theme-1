import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

define('announcementBar', () => ({
    ...useDisposable(),
    _root: null,
    _swiper: null,
    _onSlideChange: null,
    _eventScope: null,

    init() {
        this._root = this.$el;
        this._eventScope = ThemeEvents.createScope({ target: this._root });

        const events = ThemeEvents.events;
        this._eventScope.on(events.SHOPIFY_BLOCK_SELECT, () => {
            void this._reinitSwiper();
        });
        this._eventScope.on(events.SHOPIFY_BLOCK_DESELECT, () => {
            void this._reinitSwiper();
        });

        this.$nextTick(() => {
            void this._initSwiper();
        });
    },

    async _reinitSwiper() {
        this._teardownSwiper();
        await this._initSwiper();
    },

    async _initSwiper() {
        const swiperContainer = this._root?.querySelector('.swiper');
        if (!swiperContainer) return;

        const scriptUrl = this._root?.dataset?.swiperSrc;
        const cssUrl = this._root?.dataset?.swiperCss;
        if (!scriptUrl) return;

        const slides = this._root.querySelectorAll('.swiper-slide');
        const slideCount = slides.length;
        if (slideCount === 0) return;

        try {
            await loadSwiper(scriptUrl, cssUrl);
            if (!this._root) return;

            this._swiper = await createSwiper(swiperContainer, {
                loop: slideCount > 1,
                slidesPerView: 1,
                allowTouchMove: false,
                effect: 'fade',
                fadeEffect: {
                    crossFade: true,
                },
                pagination: false,
                navigation: false,
            });

            if (!this._root) {
                destroySwiper(this._swiper);
                this._swiper = null;
                return;
            }

            this._onSlideChange = () => {
                this._syncSlideAriaHidden(swiperContainer);
            };

            if (typeof this._swiper?.on === 'function') {
                this._swiper.on('slideChange', this._onSlideChange);
            }

            this._syncSlideAriaHidden(swiperContainer);
        } catch (_) {
            destroySwiper(this._swiper);
            this._swiper = null;
        }
    },

    _syncSlideAriaHidden(swiperContainer) {
        swiperContainer.querySelectorAll('.swiper-slide').forEach((slide) => {
            const isActive = slide.classList.contains('swiper-slide-active');
            slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            if (isActive) {
                slide.removeAttribute('inert');
            } else {
                slide.setAttribute('inert', '');
            }
        });
    },

    _teardownSwiper() {
        if (this._swiper && typeof this._swiper.off === 'function' && this._onSlideChange) {
            this._swiper.off('slideChange', this._onSlideChange);
        }

        destroySwiper(this._swiper);
        this._swiper = null;
        this._onSlideChange = null;
    },

    destroy() {
        this._teardownSwiper();
        this._eventScope?.dispose?.();
        this._eventScope = null;
        this._root = null;
        this.dispose();
    },
}));
