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
                    this._pauseActiveVideo();
                    this.activeIndex = index;
                    if (this._swiper) this._swiper.slideTo(index);
                },

                next() {
                    this.setActive((this.activeIndex + 1) % this.imageCount);
                },

                prev() {
                    this.setActive((this.activeIndex - 1 + this.imageCount) % this.imageCount);
                },

                activateMediaById(mediaId) {
                    if (!mediaId) return;
                    const item = this.$el.querySelector(
                        '[data-media-id="' + CSS.escape(String(mediaId)) + '"]',
                    );
                    if (!item) return;
                    const mediaType = item.dataset.mediaType;
                    if (
                        mediaType === 'model' ||
                        mediaType === 'external_video' ||
                        mediaType === 'video'
                    ) {
                        const dialogId = this.$el.dataset.mediaModalId;
                        if (dialogId) {
                            const Events = window.__Theme__.Events;
                            Events.emit(Events.events.PRODUCT_MEDIA_MODAL_ACTIVATE, {
                                mediaId: Number(mediaId),
                            });
                            window.Alpine.store('dialog').open(dialogId);
                        }
                    }
                },

                _pauseActiveVideo() {
                    this.$el.querySelectorAll('video').forEach((video) => {
                        if (!video.paused) video.pause();
                    });
                },

                _handleThumbnailKeydown(event) {
                    const tablist = event.currentTarget;
                    const orientation = tablist.getAttribute('aria-orientation') || 'horizontal';
                    let nextIndex = null;

                    switch (event.key) {
                        case 'ArrowRight':
                            if (orientation === 'horizontal') {
                                nextIndex = (this.activeIndex + 1) % this.imageCount;
                            }
                            break;
                        case 'ArrowLeft':
                            if (orientation === 'horizontal') {
                                nextIndex =
                                    (this.activeIndex - 1 + this.imageCount) % this.imageCount;
                            }
                            break;
                        case 'ArrowDown':
                            if (orientation === 'vertical') {
                                nextIndex = (this.activeIndex + 1) % this.imageCount;
                            }
                            break;
                        case 'ArrowUp':
                            if (orientation === 'vertical') {
                                nextIndex =
                                    (this.activeIndex - 1 + this.imageCount) % this.imageCount;
                            }
                            break;
                        case 'Home':
                            nextIndex = 0;
                            break;
                        case 'End':
                            nextIndex = this.imageCount - 1;
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
                _eventScope: null,

                init() {
                    const Events = window.__Theme__.Events;
                    this._eventScope = Events.createScope();
                    this._eventScope.on(Events.events.PRODUCT_MEDIA_MODAL_ACTIVATE, (e) => {
                        if (e.detail?.mediaId) {
                            this.activeMediaId = e.detail.mediaId;
                        }
                    });
                },

                setMedia(mediaId) {
                    this.activeMediaId = mediaId;
                },

                destroy() {
                    this._eventScope?.dispose?.();
                    this._eventScope = null;
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
