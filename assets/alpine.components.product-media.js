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
                mediaCount: 0,
                _galleryRoot: null,
                _thumbnailMediaQuery: null,
                _swiper: null,
                _eventScope: null,

                init() {
                    this._galleryRoot = this.$el;
                    this.mediaCount = Number(this._galleryRoot.dataset.mediaCount) || 0;
                    this._thumbnailMediaQuery = window.matchMedia('(min-width: 48rem)');
                    this.on(this._thumbnailMediaQuery, 'change', () =>
                        this._syncThumbnailOrientation(),
                    );
                    this._syncThumbnailOrientation();
                    this.$nextTick(() => this._initSwiper());
                    const Events = window.__Theme__.Events;
                    const events = Events.events;
                    this._eventScope = Events.createScope();

                    const onSlideToRequest = (e) => {
                        const targetId = e.detail?.id;
                        const galleryId = this._galleryRoot?.id || '';
                        if (targetId) {
                            if (targetId !== galleryId) return;
                        } else if (galleryId) {
                            return;
                        }
                        if (typeof e.detail?.index === 'number') this.setActive(e.detail.index);
                    };

                    this._eventScope.on(events.PRODUCT_GALLERY_SLIDE_TO_REQUEST, onSlideToRequest);
                },

                setActive(index) {
                    if (this.mediaCount === 0) return;
                    index = Math.max(0, Math.min(index, this.mediaCount - 1));
                    this._pauseActiveVideo();
                    this.activeIndex = index;
                    if (this._swiper) this._swiper.slideTo(index);
                    this._syncSlideInert();
                },

                next() {
                    this.setActive((this.activeIndex + 1) % this.mediaCount);
                    this.$nextTick(() => this._revealActiveThumbnail());
                },

                prev() {
                    this.setActive((this.activeIndex - 1 + this.mediaCount) % this.mediaCount);
                    this.$nextTick(() => this._revealActiveThumbnail());
                },

                activateMediaById(mediaId) {
                    if (!mediaId || !this._galleryRoot) return;
                    const item = this._galleryRoot.querySelector(
                        '[data-media-id="' + CSS.escape(String(mediaId)) + '"]',
                    );
                    if (!item) return;
                    const mediaType = item.dataset.mediaType;
                    if (
                        mediaType === 'model' ||
                        mediaType === 'external_video' ||
                        mediaType === 'video'
                    ) {
                        const dialogId = this._galleryRoot.dataset.mediaModalId;
                        if (dialogId) {
                            const Events = window.__Theme__.Events;
                            Events.emit(Events.events.PRODUCT_MEDIA_MODAL_ACTIVATE, {
                                mediaId: Number(mediaId),
                                dialogId,
                            });
                            window.Alpine.store('dialog').open(dialogId);
                        }
                    }
                },

                _pauseActiveVideo() {
                    this._galleryRoot?.querySelectorAll('video').forEach((video) => {
                        if (!video.paused) video.pause();
                    });
                },

                _syncSlideInert() {
                    const swiperRoot = this._galleryRoot?.querySelector('[data-gallery-swiper]');
                    if (!swiperRoot) return;
                    swiperRoot.querySelectorAll('.swiper-slide').forEach((slide, index) => {
                        const isActive = index === this.activeIndex;
                        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
                        if (isActive) {
                            slide.removeAttribute('inert');
                        } else {
                            slide.setAttribute('inert', '');
                        }
                    });
                },

                _revealActiveThumbnail() {
                    const thumbnail = this._galleryRoot?.querySelector(
                        `[data-gallery-thumbnail="${this.activeIndex}"]`,
                    );
                    thumbnail?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                },

                _syncThumbnailOrientation() {
                    const tablist = this._galleryRoot?.querySelector('[data-gallery-thumbnails]');
                    if (!tablist) return;

                    const desktopOrientation = tablist.dataset.desktopOrientation || 'horizontal';
                    const orientation = this._thumbnailMediaQuery?.matches
                        ? desktopOrientation
                        : 'horizontal';

                    tablist.setAttribute('aria-orientation', orientation);
                },

                _handleThumbnailKeydown(event) {
                    const tablist = event.currentTarget;
                    const orientation = tablist.getAttribute('aria-orientation') || 'horizontal';
                    let nextIndex = null;

                    switch (event.key) {
                        case 'ArrowRight':
                            if (orientation === 'horizontal') {
                                nextIndex = (this.activeIndex + 1) % this.mediaCount;
                            }
                            break;
                        case 'ArrowLeft':
                            if (orientation === 'horizontal') {
                                nextIndex =
                                    (this.activeIndex - 1 + this.mediaCount) % this.mediaCount;
                            }
                            break;
                        case 'ArrowDown':
                            if (orientation === 'vertical') {
                                nextIndex = (this.activeIndex + 1) % this.mediaCount;
                            }
                            break;
                        case 'ArrowUp':
                            if (orientation === 'vertical') {
                                nextIndex =
                                    (this.activeIndex - 1 + this.mediaCount) % this.mediaCount;
                            }
                            break;
                        case 'Home':
                            nextIndex = 0;
                            break;
                        case 'End':
                            nextIndex = this.mediaCount - 1;
                            break;
                    }

                    if (nextIndex === null) return;

                    event.preventDefault();
                    this.setActive(nextIndex);

                    const nextThumb = tablist.querySelector(
                        `[data-gallery-thumbnail="${nextIndex}"]`,
                    );
                    if (nextThumb) nextThumb.focus();
                },

                _initSwiper() {
                    if (typeof Swiper === 'undefined') return;

                    const mainEl = this._galleryRoot?.querySelector('[data-gallery-swiper]');
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
                                this._syncSlideInert();
                            },
                        },
                    });
                    this._syncSlideInert();
                },

                destroy() {
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    if (this._swiper?.destroy) this._swiper.destroy(true, true);
                    this._thumbnailMediaQuery = null;
                    this._galleryRoot = null;
                    this.dispose();
                },
            };
        },

        imageLightbox({ imageCount = 1, initialIndex = 0 } = {}) {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                imageCount: Math.max(1, Number(imageCount) || 1),
                lightboxOpen: false,
                lightboxClosing: false,
                lightboxIndex: Math.max(0, Number(initialIndex) || 0),
                _previousBodyOverflow: null,
                _returnFocusTo: null,
                _trapHandler: null,
                _lightboxGeneration: 0,

                init() {
                    const ds = this.$el?.dataset;
                    if (!ds) return;
                    if (ds.lightboxImageCount) {
                        const parsed = Number(ds.lightboxImageCount);
                        if (Number.isFinite(parsed) && parsed > 0) this.imageCount = parsed;
                    }
                },

                get lightboxLabel() {
                    return `${this.lightboxIndex + 1} / ${this.imageCount}`;
                },

                openLightbox(index = this.lightboxIndex) {
                    const DialogMotion = window.__Theme__.DialogMotion;

                    this._returnFocusTo = document.activeElement;
                    this.lightboxIndex = this._normalizeIndex(index);
                    this.lightboxOpen = true;
                    this.lightboxClosing = false;

                    const generation = ++this._lightboxGeneration;
                    const root = this.$refs.lightboxDialog;
                    const usesMotion = DialogMotion && root && DialogMotion.hasMotion(root);

                    const focusLightbox = () => {
                        if (generation !== this._lightboxGeneration) return;
                        if (!this.lightboxOpen) return;

                        this._moveFocusIntoLightbox();
                    };

                    requestAnimationFrame(() => {
                        if (generation !== this._lightboxGeneration) return;
                        if (!this.lightboxOpen) return;

                        this._attachTrap();
                    });

                    if (!usesMotion) {
                        this._lockBodyScroll();
                        requestAnimationFrame(() => {
                            focusLightbox();
                        });
                        return;
                    }

                    DialogMotion.playEnter(root, {
                        trigger: this._returnFocusTo,
                        lockScroll: true,
                        onEnterStart: focusLightbox,
                    });
                },

                closeLightbox() {
                    if (!this.lightboxOpen || this.lightboxClosing) return;

                    const DialogMotion = window.__Theme__.DialogMotion;

                    this.lightboxClosing = true;
                    this._lightboxGeneration += 1;

                    const returnTo = this._returnFocusTo;
                    const root = this.$refs.lightboxDialog;
                    this._detachTrap();

                    const unlock = () => {
                        if (DialogMotion && typeof DialogMotion.unlockScroll === 'function') {
                            DialogMotion.unlockScroll();
                        } else {
                            this._unlockBodyScroll();
                        }
                    };

                    const finish = () => {
                        this.lightboxOpen = false;
                        this.lightboxClosing = false;
                        unlock();
                        this._returnFocusTo = null;

                        if (
                            returnTo &&
                            returnTo.isConnected &&
                            typeof returnTo.focus === 'function' &&
                            this._isElementVisible(returnTo)
                        ) {
                            returnTo.focus({ preventScroll: true });
                        }
                    };

                    if (DialogMotion && root && DialogMotion.hasMotion(root)) {
                        DialogMotion.playExit(root, { trigger: returnTo }).then(finish);
                        return;
                    }

                    finish();
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

                _FOCUSABLE_SELECTOR: [
                    'a[href]',
                    'button:not([disabled])',
                    'input:not([disabled]):not([type="hidden"])',
                    'select:not([disabled])',
                    'textarea:not([disabled])',
                    '[tabindex]:not([tabindex="-1"])',
                ].join(', '),

                _isElementVisible(el) {
                    if (!el.offsetParent && el !== document.body) {
                        let ancestor = el.parentElement;
                        while (ancestor && ancestor !== document.body) {
                            if (getComputedStyle(ancestor).display === 'none') return false;
                            ancestor = ancestor.parentElement;
                        }
                    }
                    return getComputedStyle(el).visibility !== 'hidden';
                },

                _isFocusable(el) {
                    if (el.hasAttribute('disabled')) return false;
                    if (el.hasAttribute('inert')) return false;
                    if (el.getAttribute('tabindex') === '-1') return false;
                    if (!this._isElementVisible(el)) return false;
                    return true;
                },

                _getFocusableElements(container) {
                    return Array.from(container.querySelectorAll(this._FOCUSABLE_SELECTOR)).filter(
                        (el) => this._isFocusable(el),
                    );
                },

                _moveFocusIntoLightbox() {
                    const dialog = this.$refs.lightboxDialog;
                    if (!dialog) return;

                    const focusable = this._getFocusableElements(dialog);
                    if (focusable.length > 0) {
                        focusable[0].focus({ preventScroll: true });
                    } else {
                        dialog.focus({ preventScroll: true });
                    }
                },

                _trapFocus(e) {
                    if (e.key !== 'Tab') return;

                    const dialog = this.$refs.lightboxDialog;
                    if (!dialog) return;

                    const focusable = this._getFocusableElements(dialog);
                    if (focusable.length === 0) {
                        e.preventDefault();
                        dialog.focus();
                        return;
                    }

                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === first || document.activeElement === dialog) {
                            e.preventDefault();
                            last.focus();
                        }
                    } else {
                        if (document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
                    }

                    if (!dialog.contains(document.activeElement)) {
                        e.preventDefault();
                        (e.shiftKey ? last : first).focus();
                    }
                },

                _attachTrap() {
                    this._detachTrap();
                    this._trapHandler = this._trapFocus.bind(this);
                    document.addEventListener('keydown', this._trapHandler, true);
                },

                _detachTrap() {
                    if (this._trapHandler) {
                        document.removeEventListener('keydown', this._trapHandler, true);
                        this._trapHandler = null;
                    }
                },

                destroy() {
                    this._lightboxGeneration += 1;
                    this._detachTrap();
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
                _animateFrame: null,

                init() {
                    if (!this._shouldAnimateSweep()) {
                        this.position = 50;
                    }

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

                _prefersReducedMotion() {
                    const Utils = window.__Theme__?.Utils;
                    if (typeof Utils?.prefersReducedMotion === 'function') {
                        return Utils.prefersReducedMotion();
                    }
                    return (
                        typeof window.matchMedia === 'function' &&
                        window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    );
                },

                _shouldAnimateSweep() {
                    return (
                        document.body?.dataset?.motionEnabled !== 'false' &&
                        !this._prefersReducedMotion()
                    );
                },

                _cancelSweep() {
                    if (!this._animateFrame) return;
                    cancelAnimationFrame(this._animateFrame);
                    this._animateFrame = null;
                },

                animateToCenter() {
                    this._cancelSweep();

                    if (!this._shouldAnimateSweep()) {
                        this.position = 50;
                        return;
                    }

                    const start = 0;
                    const end = 50;
                    const duration = 800;
                    const startTime = performance.now();
                    this.position = start;

                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        this.position = start + (end - start) * easeOut;

                        if (progress < 1) {
                            this._animateFrame = requestAnimationFrame(animate);
                        } else {
                            this._animateFrame = null;
                        }
                    };

                    this._animateFrame = requestAnimationFrame(animate);
                },

                startDrag(e) {
                    this._cancelSweep();
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

                handleKeydown(e) {
                    this._cancelSweep();
                    const step = 5;
                    let handled = true;

                    switch (e.key) {
                        case 'ArrowLeft':
                        case 'ArrowDown':
                            this.position = Math.max(0, this.position - step);
                            break;
                        case 'ArrowRight':
                        case 'ArrowUp':
                            this.position = Math.min(100, this.position + step);
                            break;
                        case 'Home':
                            this.position = 0;
                            break;
                        case 'End':
                            this.position = 100;
                            break;
                        default:
                            handled = false;
                    }

                    if (handled) e.preventDefault();
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
                    this._cancelSweep();
                    this.dispose();
                },
            };
        },

        productMediaModal() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                activeMediaId: null,
                dialogId: '',
                _rootEl: null,
                _dialogUnwatch: null,
                _eventScope: null,
                _modelViewerUIs: [],

                init() {
                    this._rootEl = this.$el;
                    const Events = window.__Theme__.Events;
                    this._eventScope = Events.createScope();
                    this.dialogId =
                        this._rootEl?.dataset?.dialogId ||
                        this._rootEl?.dataset?.mediaModalId ||
                        '';
                    this._eventScope.on(Events.events.PRODUCT_MEDIA_MODAL_ACTIVATE, (e) => {
                        const targetDialogId = e.detail?.dialogId;
                        if (targetDialogId && this.dialogId && targetDialogId !== this.dialogId) {
                            return;
                        }
                        if (e.detail?.mediaId) {
                            this.setMedia(e.detail.mediaId);
                        }
                    });

                    if (typeof this.$watch === 'function') {
                        this._dialogUnwatch = this.$watch(
                            () => {
                                const dialog = window.Alpine?.store?.('dialog');
                                return `${dialog?.active || ''}:${dialog?.closing || ''}`;
                            },
                            () => {
                                const dialog = window.Alpine?.store?.('dialog');
                                const isOpen =
                                    dialog?.active === this.dialogId &&
                                    dialog?.closing !== this.dialogId;
                                if (!isOpen) this.stopMedia();
                            },
                        );
                    }

                    this._loadModelViewerUI();
                },

                setMedia(mediaId) {
                    const nextMediaId = Number(mediaId);
                    if (!Number.isFinite(nextMediaId) || nextMediaId <= 0) return;

                    this.stopMedia();
                    this.activeMediaId = nextMediaId;
                    this.$nextTick(() => this._mountExternalVideo(nextMediaId));
                },

                stopMedia() {
                    if (!this._rootEl) return;

                    this._rootEl.querySelectorAll('video').forEach((video) => {
                        video.pause();
                        try {
                            video.currentTime = 0;
                        } catch (_) {}
                    });

                    this._rootEl.querySelectorAll('[data-external-video-host]').forEach((host) => {
                        while (host.firstChild) host.removeChild(host.firstChild);
                    });

                    this._modelViewerUIs.forEach(({ ui }) => ui?.pause?.());
                    this._rootEl
                        .querySelectorAll('model-viewer')
                        .forEach((modelViewer) => modelViewer.pause?.());
                    this.activeMediaId = null;
                },

                _mountExternalVideo(mediaId) {
                    if (!this._rootEl || this.activeMediaId !== mediaId) return;

                    const mediaRoot = this._rootEl.querySelector(
                        '[data-product-media-id="' + CSS.escape(String(mediaId)) + '"]',
                    );
                    const template = mediaRoot?.querySelector('[data-external-video-template]');
                    const host = mediaRoot?.querySelector('[data-external-video-host]');
                    if (!template || !host) return;

                    while (host.firstChild) host.removeChild(host.firstChild);
                    host.appendChild(template.content.cloneNode(true));
                },

                _loadModelViewerUI() {
                    const modelViewers = this._rootEl?.querySelectorAll('model-viewer');
                    if (!modelViewers?.length) return;

                    const styleId = 'shopify-model-viewer-ui-styles';
                    if (!document.getElementById(styleId)) {
                        const stylesheet = document.createElement('link');
                        stylesheet.id = styleId;
                        stylesheet.rel = 'stylesheet';
                        stylesheet.href =
                            'https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css';
                        document.head.appendChild(stylesheet);
                    }

                    const Shopify = window.Shopify;
                    if (!Shopify?.loadFeatures) return;

                    Shopify.loadFeatures([
                        {
                            name: 'model-viewer-ui',
                            version: '1.0',
                            onLoad: (errors) => {
                                if (errors || !this._rootEl?.isConnected) return;
                                const ModelViewerUI = window.Shopify?.ModelViewerUI;
                                if (!ModelViewerUI) return;

                                const initialized = new Set(
                                    this._modelViewerUIs.map(({ element }) => element),
                                );
                                this._rootEl.querySelectorAll('model-viewer').forEach((element) => {
                                    if (initialized.has(element)) return;
                                    this._modelViewerUIs.push({
                                        element,
                                        ui: new ModelViewerUI(element),
                                    });
                                });
                            },
                        },
                    ]);
                },

                destroy() {
                    this.stopMedia();
                    if (typeof this._dialogUnwatch === 'function') this._dialogUnwatch();
                    this._dialogUnwatch = null;
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
                    this._modelViewerUIs.forEach(({ ui }) => ui?.destroy?.());
                    this._modelViewerUIs = [];
                    this._rootEl = null;
                    this.dispose();
                },
            };
        },

        mediaVideo() {
            return {
                ...AlpineComponentsFactory.useDisposable(),
                isPlaying: false,
                isMuted: true,
                hasPlayed: false,
                _videoCleanups: [],

                init() {
                    const videos = this._getAllVideos();
                    if (!videos.length) return;

                    const visible = this._getVideo();
                    if (visible) {
                        this.isMuted = visible.muted;
                        this.isPlaying = !visible.paused;
                    }

                    const onPlay = () => {
                        const shouldMoveFocus = document.activeElement === this.$refs?.playButton;
                        const current = this._getVideo();
                        if (current && !current.paused) {
                            this.isPlaying = true;
                            this.hasPlayed = true;
                            if (shouldMoveFocus) {
                                this.$nextTick(() => this._focusPlaybackControl('pauseButton'));
                            }
                        }
                    };
                    const onPause = () => {
                        const shouldMoveFocus = document.activeElement === this.$refs?.pauseButton;
                        const current = this._getVideo();
                        if (current && current.paused) {
                            this.isPlaying = false;
                            if (shouldMoveFocus) {
                                this.$nextTick(() => this._focusPlaybackControl('playButton'));
                            }
                        }
                    };
                    const onVolumeChange = () => {
                        const current = this._getVideo();
                        if (current) {
                            this.isMuted = current.muted;
                        }
                    };

                    videos.forEach((video) => {
                        video.addEventListener('play', onPlay);
                        video.addEventListener('pause', onPause);
                        video.addEventListener('volumechange', onVolumeChange);
                    });

                    this._videoCleanups.push(() => {
                        videos.forEach((video) => {
                            video.removeEventListener('play', onPlay);
                            video.removeEventListener('pause', onPause);
                            video.removeEventListener('volumechange', onVolumeChange);
                        });
                    });
                },

                _getAllVideos() {
                    const el = this.$el;
                    if (!el) return [];
                    return Array.from(el.querySelectorAll('video'));
                },

                _getVideo() {
                    const el = this.$el;
                    if (!el) return null;
                    const desktop = el.querySelector('[data-video-desktop]');
                    const mobile = el.querySelector('[data-video-mobile]');
                    const desktopVideo = desktop?.querySelector('video');
                    const mobileVideo = mobile?.querySelector('video');
                    if (mobileVideo && mobile.offsetParent !== null) return mobileVideo;
                    if (desktopVideo && desktop.offsetParent !== null) return desktopVideo;
                    return desktopVideo || mobileVideo || el.querySelector('video');
                },

                _pauseOthers(currentVideo) {
                    const videos = this._getAllVideos();
                    videos.forEach((v) => {
                        if (v !== currentVideo && !v.paused) v.pause();
                    });
                },

                _focusPlaybackControl(refName) {
                    const control = this.$refs?.[refName];
                    if (!(control instanceof HTMLElement)) return;

                    control.focus({ preventScroll: true });
                },

                play() {
                    const video = this._getVideo();
                    if (video) {
                        this._pauseOthers(video);
                        video.play().catch(() => {});
                    }
                },

                pause() {
                    const video = this._getVideo();
                    if (video) {
                        video.pause();
                    }
                },

                toggleMute() {
                    const video = this._getVideo();
                    if (video) {
                        video.muted = !video.muted;
                        this.isMuted = video.muted;
                    }
                },

                destroy() {
                    this._videoCleanups.forEach((fn) => fn());
                    this._videoCleanups = [];
                    const videos = this._getAllVideos();
                    videos.forEach((v) => {
                        if (!v.paused) v.pause();
                    });
                    this.dispose();
                },
            };
        },
    };
})();
