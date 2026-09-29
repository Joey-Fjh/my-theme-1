import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

define('featuredProducts', () => ({
    ...useDisposable(),
    _root: null,
    _swipers: [],

    init() {
        this._root = this.$el;
        this.$nextTick(() => {
            void this._initSwipers();
        });
    },

    _readSwiperScriptUrl() {
        return this._root?.dataset?.swiperSrc || '';
    },

    async _initSwipers() {
        const swiperEls = this._root?.querySelectorAll('.swiper');
        if (!swiperEls?.length) return;

        const scriptUrl = this._readSwiperScriptUrl();
        if (!scriptUrl) return;

        try {
            await loadSwiper(scriptUrl);
            if (!this._root) return;

            const promises = [];
            swiperEls.forEach((swiperEl) => {
                const mobileItems = parseInt(swiperEl.getAttribute('data-mobile-items'), 10) || 2;
                const pcItems = parseInt(swiperEl.getAttribute('data-pc-items'), 10) || 4;

                const options = {
                    slidesPerView: mobileItems,
                    spaceBetween: 3,
                    observer: true,
                    observeParents: true,
                    breakpoints: {
                        768: {
                            slidesPerView: pcItems,
                            spaceBetween: 8,
                        },
                    },
                };

                const panel = swiperEl.closest('[role="tabpanel"]');
                const nextEl = panel?.querySelector('.swiper-button-next');
                const prevEl = panel?.querySelector('.swiper-button-prev');
                const paginationEl = panel?.querySelector('.swiper-pagination');

                if (nextEl && prevEl) {
                    options.navigation = { nextEl, prevEl };
                }
                if (paginationEl) {
                    options.pagination = { el: paginationEl, clickable: true };
                }

                promises.push(
                    createSwiper(swiperEl, options).then((instance) => {
                        if (!this._root) {
                            destroySwiper(instance);
                            return;
                        }
                        this._swipers.push(instance);
                    }),
                );
            });

            await Promise.all(promises);
        } catch (_) {
            this._destroySwipers();
        }
    },

    _destroySwipers() {
        this._swipers.forEach((instance) => destroySwiper(instance));
        this._swipers = [];
    },

    destroy() {
        this._destroySwipers();
        this._root = null;
        this.dispose();
    },
}));
