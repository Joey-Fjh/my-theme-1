(function () {
    'use strict';

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.AlpineComponentGroups = window.__Theme__.AlpineComponentGroups || {};

    const AlpineComponentsFactory = window.__Theme__?.AlpineComponentsFactory;
    const ComponentGroups = window.__Theme__.AlpineComponentGroups;

    if (!AlpineComponentsFactory) return;

    ComponentGroups.productMedia = {
        productGallery() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                activeIndex: 0,
                imageCount: 0,
                _swiper: null,
                _eventScope: null,

                init() {
                    this.imageCount = Number(this.$el.dataset.imageCount) || 0;
                    this.$nextTick(() => this._initSwiper());
                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

                    const onSlideToRequest = (e) => {
                        if (e.detail?.id && e.detail.id !== this.$el.id) return;
                        if (typeof e.detail?.index === 'number') this.setActive(e.detail.index);
                    };

                    this._eventScope.on(events.PRODUCT_GALLERY_SLIDE_TO_REQUEST, onSlideToRequest);
                },

                setActive(index) {
                    if (this.imageCount === 0) return;
                    index = Math.max(0, Math.min(index, this.imageCount - 1));
                    this.activeIndex = index;
                    if (this._swiper) this._swiper.slideTo(index);
                },

                next() {
                    this.setActive((this.activeIndex + 1) % this.imageCount);
                },

                prev() {
                    this.setActive((this.activeIndex - 1 + this.imageCount) % this.imageCount);
                },

                _initSwiper() {
                    if (typeof Swiper === 'undefined') return;

                    const mainEl = this.$el.querySelector('[data-gallery-swiper]');
                    if (!mainEl) return;

                    this._swiper = new Swiper(mainEl, {
                        slidesPerView: 1,
                        spaceBetween: 0,
                        pagination: {
                            el: mainEl.querySelector('.swiper-pagination'),
                            clickable: true,
                        },
                        on: {
                            slideChange: (s) => {
                                this.activeIndex = s.activeIndex;
                            },
                        },
                    });
                },

                destroy() {
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    if (this._swiper?.destroy) this._swiper.destroy(true, true);
                    this.dispose();
                },
            };
        },

        imageLightbox({ imageCount = 1, initialIndex = 0 } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                imageCount: Math.max(1, Number(imageCount) || 1),
                lightboxOpen: false,
                lightboxIndex: Math.max(0, Number(initialIndex) || 0),
                _previousBodyOverflow: null,

                get lightboxLabel() {
                    return `${this.lightboxIndex + 1} / ${this.imageCount}`;
                },

                openLightbox(index = this.lightboxIndex) {
                    this.lightboxIndex = this._normalizeIndex(index);
                    this.lightboxOpen = true;
                    this._lockBodyScroll();
                },

                closeLightbox() {
                    this.lightboxOpen = false;
                    this._unlockBodyScroll();
                },

                nextLightbox() {
                    this.lightboxIndex = this._normalizeIndex(this.lightboxIndex + 1);
                },

                prevLightbox() {
                    this.lightboxIndex = this._normalizeIndex(this.lightboxIndex - 1);
                },

                _normalizeIndex(index) {
                    const total = this.imageCount;
                    return ((Number(index) % total) + total) % total;
                },

                _lockBodyScroll() {
                    if (this._previousBodyOverflow === null) {
                        this._previousBodyOverflow = document.body.style.overflow || '';
                    }
                    document.body.style.overflow = 'hidden';
                },

                _unlockBodyScroll() {
                    if (this._previousBodyOverflow === null) return;
                    document.body.style.overflow = this._previousBodyOverflow;
                    this._previousBodyOverflow = null;
                },

                destroy() {
                    if (this.lightboxOpen) this.closeLightbox();
                    this.dispose();
                },
            };
        },

        imageMagnifier({
            scale = 2,
            previewMode = 'magnify',
            previewWidth = 0,
            previewHeight = 0,
            previewMaxWidth = 560,
            previewGap = 12,
        } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                active: false,
                imageReady: false,
                previewFrameStyle: '',
                previewImageStyle: '',
                scale: Math.max(1, Number(scale) || 2),
                previewMode,
                previewWidth: Math.max(0, Number(previewWidth) || 0),
                previewHeight: Math.max(0, Number(previewHeight) || 0),
                previewMaxWidth: Math.max(240, Number(previewMaxWidth) || 560),
                previewGap: Math.max(0, Number(previewGap) || 12),
                zoomImage: '',
                zoomImageLoaded: false,
                disabled: false,
                _frame: 0,
                _isHovering: false,
                _preloadPromise: null,
                _pointer: null,

                init() {
                    this.scale = Math.max(1, Number(this.$el.dataset.zoomScale) || this.scale);
                    this.previewMode = this.$el.dataset.previewMode || this.previewMode;
                    this.previewWidth = this._readPositiveNumber(
                        this.$el.dataset.previewWidth,
                        this.previewWidth,
                    );
                    this.previewHeight = this._readPositiveNumber(
                        this.$el.dataset.previewHeight,
                        this.previewHeight,
                    );
                    this.previewMaxWidth =
                        Math.max(240, Number(this.$el.dataset.previewMaxWidth)) ||
                        this.previewMaxWidth;
                    this.previewGap =
                        Math.max(0, Number(this.$el.dataset.previewGap)) || this.previewGap;
                    this.zoomImage = this.$el.dataset.zoomImage || '';
                    this.disabled = this._detectTouch();
                },

                openMagnifier(event) {
                    if (this.disabled || !this._isMousePointer(event)) return;
                    this._isHovering = true;
                    this.imageReady = this.zoomImageLoaded;
                    this.moveMagnifier(event);
                    if (this._syncPreview()) {
                        this.active = true;
                    }
                    this._preloadZoomImage().then(() => {
                        if (!this._isHovering) return;
                        this._syncPreview();
                        this.imageReady = true;
                    });
                },

                moveMagnifier(event) {
                    if (this.disabled || !this._isMousePointer(event)) return;
                    this._pointer = {
                        x: event.clientX,
                        y: event.clientY,
                        target: event.currentTarget,
                    };

                    if (this._frame) return;
                    this._frame = requestAnimationFrame(() => {
                        this._frame = 0;
                        this._syncPreview();
                    });
                },

                closeMagnifier() {
                    this.active = false;
                    this._isHovering = false;
                    this._pointer = null;
                },

                _syncPreview() {
                    if (!this._pointer?.target || !this.zoomImage) return false;

                    const rect = this._pointer.target.getBoundingClientRect();
                    const x = this._clamp((this._pointer.x - rect.left) / rect.width, 0, 1);
                    const y = this._clamp((this._pointer.y - rect.top) / rect.height, 0, 1);
                    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                    const viewportHeight =
                        window.innerHeight || document.documentElement.clientHeight;
                    const width = this.previewWidth
                        ? Math.min(this.previewWidth, viewportWidth - this.previewGap * 2)
                        : Math.min(this.previewMaxWidth, viewportWidth * 0.45);
                    const height = this.previewHeight
                        ? Math.min(this.previewHeight, viewportHeight - this.previewGap * 2)
                        : Math.min(rect.height, viewportHeight - this.previewGap * 2);
                    const canPlaceRight = rect.right + this.previewGap + width <= viewportWidth;
                    const left = canPlaceRight
                        ? rect.right + this.previewGap
                        : Math.max(this.previewGap, rect.left - this.previewGap - width);
                    const top = this._clamp(
                        rect.top,
                        this.previewGap,
                        Math.max(this.previewGap, viewportHeight - height - this.previewGap),
                    );
                    const safeUrl = String(this.zoomImage).replace(/"/g, '\\"');
                    const frameStyles = [
                        `position: fixed`,
                        `left: ${Math.round(left)}px`,
                        `top: ${Math.round(top)}px`,
                        `width: ${Math.round(width)}px`,
                        `height: ${Math.round(height)}px`,
                        `--image-magnifier-position: ${x * 100}% ${y * 100}%`,
                    ];
                    const imageStyles = [
                        `background-image: url("${safeUrl}")`,
                        `background-repeat: no-repeat`,
                    ];

                    if (this.previewMode === 'contain') {
                        imageStyles.push('background-position: center');
                        imageStyles.push('background-size: contain');
                    } else {
                        imageStyles.push('background-position: var(--image-magnifier-position)');
                        imageStyles.push(`background-size: ${this.scale * 100}%`);
                    }

                    this.previewFrameStyle = frameStyles.join(';');
                    this.previewImageStyle = imageStyles.join(';');
                    return true;
                },

                _preloadZoomImage() {
                    if (this.zoomImageLoaded) return Promise.resolve();
                    if (this._preloadPromise) return this._preloadPromise;

                    this._preloadPromise = new Promise((resolve) => {
                        if (!this.zoomImage) {
                            resolve();
                            return;
                        }

                        const image = new Image();
                        image.onload = () => {
                            const decode = image.decode?.();
                            if (decode?.then) {
                                decode
                                    .catch(() => {})
                                    .finally(() => {
                                        this.zoomImageLoaded = true;
                                        resolve();
                                    });
                                return;
                            }

                            this.zoomImageLoaded = true;
                            resolve();
                        };
                        image.onerror = () => {
                            this.zoomImageLoaded = true;
                            resolve();
                        };
                        image.src = this.zoomImage;
                    });

                    return this._preloadPromise;
                },

                _detectTouch() {
                    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
                        return false;
                    }
                    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
                },

                _isMousePointer(event) {
                    return !event?.pointerType || event.pointerType === 'mouse';
                },

                _clamp(value, min, max) {
                    return Math.min(Math.max(value, min), max);
                },

                _readPositiveNumber(value, fallback = 0) {
                    const number = Number(value);
                    return Number.isFinite(number) && number > 0 ? number : fallback;
                },

                destroy() {
                    if (this._frame) cancelAnimationFrame(this._frame);
                    this.dispose();
                },
            };
        },

        beforeAfterComparison() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                position: 0,
                isDragging: false,

                init() {
                    this.on(document, 'mouseup', () => this.endDrag());
                    this.on(document, 'touchend', () => this.endDrag());
                    this.on(document, 'mousemove', (e) => {
                        if (this.isDragging) this.updatePosition(e);
                    });
                    this.on(
                        document,
                        'touchmove',
                        (e) => {
                            if (this.isDragging) this.updatePosition(e);
                        },
                        { passive: true },
                    );
                },

                animateToCenter() {
                    const start = 0;
                    const end = 50;
                    const duration = 800;
                    const startTime = performance.now();

                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        this.position = start + (end - start) * easeOut;

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };

                    requestAnimationFrame(animate);
                },

                startDrag(e) {
                    this.isDragging = true;
                    this.updatePosition(e);
                },

                onDrag(e) {
                    if (!this.isDragging) return;
                    this.updatePosition(e);
                },

                endDrag() {
                    this.isDragging = false;
                },

                updatePosition(e) {
                    const container = this.$refs?.container;
                    if (!container) return;

                    const rect = container.getBoundingClientRect();
                    if (!rect || rect.width <= 0) return;

                    const clientX = e.type.includes('touch')
                        ? (e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX)
                        : e.clientX;

                    if (clientX == undefined) return;

                    const x = clientX - rect.left;
                    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

                    this.position = percentage;
                },

                destroy() {
                    this.dispose();
                },
            };
        },
    };
})();
