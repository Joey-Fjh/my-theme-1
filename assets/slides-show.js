import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';
import ThemeEvents from 'events';
import { loadSwiper, createSwiper, destroySwiper } from 'carousel-swiper';

/**
 * Expose only the visible slide. `activeSlide` comes from `swiper.slides[swiper.activeIndex]`:
 * on `slideChange` Swiper has not yet moved the `swiper-slide-active` class, and loop mode
 * reorders the DOM. Without Swiper (one slide) the first slide is the visible one.
 */
function syncSlideAriaHidden(swiperContainer, activeSlide = null) {
    const slides = swiperContainer.querySelectorAll('.swiper-slide');
    const visible = activeSlide || slides[0] || null;
    slides.forEach((slide) => {
        const isActive = slide === visible;
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        if (isActive) {
            slide.removeAttribute('inert');
        } else {
            slide.setAttribute('inert', '');
        }
    });
}

function syncPaginationVisuals(swiperContainer, activeIndex, progress = 1) {
    const buttons = swiperContainer.querySelectorAll('[data-slides-show-pagination-button]');
    buttons.forEach((button, index) => {
        const isActive = index === activeIndex;
        button.setAttribute('aria-current', isActive ? 'true' : 'false');
        const dot = button.querySelector('.slides-show__dot');
        dot?.classList.toggle('is-active', isActive);
        const fill = button.querySelector('.slides-show__dot-fill');
        if (!fill) return;
        if (isActive) {
            fill.setAttribute('data-slides-show-progress-fill', '');
            fill.style.setProperty('--slides-show-progress', String(progress));
        } else {
            fill.removeAttribute('data-slides-show-progress-fill');
            fill.style.removeProperty('--slides-show-progress');
        }
    });
}

function prefersReducedMotion() {
    return (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}

function motionEnabled() {
    if (document.body.dataset.motionEnabled === 'false') return false;
    if (prefersReducedMotion()) return false;
    return true;
}

define('slidesShow', () => ({
    ...useDisposable(),
    _root: null,
    _swiper: null,
    _swiperContainer: null,
    _onSlideChange: null,
    _onAutoplayTimeLeft: null,
    _onKeydown: null,
    _hoverPaused: false,
    _focusPaused: false,
    _userPaused: false,
    _editorPaused: false,
    _hasSlideChanged: false,
    _progress: 1,
    _eventScope: null,
    _offEditorSelect: null,
    _offEditorDeselect: null,

    init() {
        this._root = this.$el;
        this._eventScope = ThemeEvents.createScope({ target: this._root });

        const events = ThemeEvents.events;
        // `assets/base.js` forwards Theme Editor block events to this module root without bubbling.
        this._offEditorSelect = ThemeEvents.on(
            events.SHOPIFY_BLOCK_SELECT,
            (e) => this._onEditorBlockSelect(e),
            { target: this._root },
        );
        this._offEditorDeselect = ThemeEvents.on(
            events.SHOPIFY_BLOCK_DESELECT,
            (e) => this._onEditorBlockDeselect(e),
            { target: this._root },
        );

        this.$nextTick(() => {
            void this._initSwiper();
        });
    },

    _readConfig() {
        const dataset = this._root?.dataset || {};
        return {
            autoplaySetting: dataset.autoplay === 'true',
            delayMs: Number(dataset.autoplayDelayMs) || 5000,
            slideCount: Number(dataset.slideCount) || 0,
            sectionId: dataset.sectionId || '',
        };
    },

    _shouldRunAutoplay(config) {
        if (config.slideCount <= 1) return false;
        if (!config.autoplaySetting) return false;
        if (prefersReducedMotion()) return false;
        return true;
    },

    _readSwiperScriptUrl() {
        return this._root?.dataset?.swiperSrc || '';
    },

    _showControls() {
        const controls = this._root?.querySelector('[data-slides-show-controls]');
        if (controls) controls.hidden = false;
    },

    _activeSlide() {
        const swiper = this._swiper;
        if (!swiper?.slides) return null;
        return swiper.slides[swiper.activeIndex] || null;
    },

    // The slide's position in the section (Liquid `data-slide-index`), not its loop DOM position.
    _getSlideIndexForBlockId(blockId) {
        if (!blockId || !this._root) return -1;
        const slide = [...this._root.querySelectorAll('.swiper-slide')].find(
            (el) => el.dataset.blockId === String(blockId),
        );
        const index = Number(slide?.dataset.slideIndex);
        return Number.isInteger(index) ? index : -1;
    },

    _onEditorBlockSelect(event) {
        const detail = event.detail || {};
        if (detail.sectionId && String(detail.sectionId) !== this._readConfig().sectionId) {
            return;
        }
        const index = this._getSlideIndexForBlockId(detail.blockId);
        if (index < 0 || !this._swiper) return;

        this._editorPaused = true;
        this._swiper.autoplay?.stop?.();
        if (typeof this._swiper.slideToLoop === 'function') {
            this._swiper.slideToLoop(index);
        } else {
            this._swiper.slideTo(index);
        }
    },

    _onEditorBlockDeselect(event) {
        const detail = event.detail || {};
        if (detail.sectionId && String(detail.sectionId) !== this._readConfig().sectionId) {
            return;
        }
        this._editorPaused = false;
        this._maybeResumeAutoplay();
    },

    _setProgress(progress) {
        const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
        this._progress = clamped;
        const swiper = this._swiper;
        const activeIndex =
            swiper && typeof swiper.realIndex === 'number'
                ? swiper.realIndex
                : swiper?.activeIndex || 0;
        if (this._swiperContainer) {
            syncPaginationVisuals(this._swiperContainer, activeIndex, clamped);
        }
    },

    _updateTextMotionClasses() {
        const swiperContainer = this._swiperContainer;
        if (!swiperContainer || !motionEnabled()) return;

        swiperContainer.querySelectorAll('.swiper-slide').forEach((slide) => {
            const groups = slide.querySelectorAll('[data-slides-show-text-motion]');
            groups.forEach((group) => {
                group.classList.remove('is-slides-show-text-enter');
            });
        });

        if (!this._hasSlideChanged) return;

        const active = this._activeSlide();
        if (!active) return;

        active.querySelectorAll('[data-slides-show-text-motion]').forEach((group, index) => {
            group.style.setProperty('--slides-show-text-index', String(index));
            group.classList.add('is-slides-show-text-enter');
        });
    },

    _onSlideChanged() {
        const swiper = this._swiper;
        const swiperContainer = this._swiperContainer;
        if (!swiper || !swiperContainer) return;

        syncSlideAriaHidden(swiperContainer, this._activeSlide());
        const activeIndex =
            typeof swiper.realIndex === 'number' ? swiper.realIndex : swiper.activeIndex || 0;
        // A new slide starts with an empty pill while autoplay runs and motion is on.
        if (swiper.autoplay?.running && motionEnabled()) this._progress = 0;
        syncPaginationVisuals(swiperContainer, activeIndex, this._progress);

        // The listener is attached after Swiper init, so every call is a real change;
        // the first slide at page load never reaches this path.
        this._hasSlideChanged = true;
        this._updateTextMotionClasses();
    },

    _pauseForInteraction() {
        this._swiper?.autoplay?.stop?.();
    },

    _maybeResumeAutoplay() {
        const config = this._readConfig();
        if (!this._shouldRunAutoplay(config)) return;
        if (this._userPaused || this._editorPaused || this._hoverPaused || this._focusPaused) {
            return;
        }
        this._swiper?.autoplay?.start?.();
    },

    _bindInteractionPause() {
        const root = this._root;
        if (!root) return;

        this.on(root, 'mouseenter', () => {
            this._hoverPaused = true;
            this._pauseForInteraction();
        });
        this.on(root, 'mouseleave', () => {
            this._hoverPaused = false;
            this._maybeResumeAutoplay();
        });
        this.on(root, 'focusin', () => {
            this._focusPaused = true;
            this._pauseForInteraction();
        });
        this.on(root, 'focusout', (event) => {
            if (root.contains(event.relatedTarget)) return;
            this._focusPaused = false;
            this._maybeResumeAutoplay();
        });
    },

    _bindPagination() {
        const swiperContainer = this._swiperContainer;
        if (!swiperContainer) return;

        swiperContainer
            .querySelectorAll('[data-slides-show-pagination-button]')
            .forEach((button) => {
                this.on(button, 'click', () => {
                    const index = Number(button.dataset.slideIndex);
                    if (!Number.isFinite(index) || !this._swiper) return;
                    if (typeof this._swiper.slideToLoop === 'function') {
                        this._swiper.slideToLoop(index);
                    } else {
                        this._swiper.slideTo(index);
                    }
                });
            });

        const toggle = swiperContainer.querySelector('[data-slides-show-autoplay-toggle]');
        if (toggle) {
            this.on(toggle, 'click', () => this._toggleUserPause(toggle));
        }
    },

    _toggleUserPause(toggle) {
        const config = this._readConfig();
        if (!this._shouldRunAutoplay(config) && config.autoplaySetting) {
            return;
        }
        if (!config.autoplaySetting) return;

        this._userPaused = !this._userPaused;
        if (this._userPaused) {
            this._swiper?.autoplay?.stop?.();
            toggle.setAttribute('data-state', 'paused');
        } else {
            toggle.setAttribute('data-state', 'playing');
            this._maybeResumeAutoplay();
        }
        this._syncToggleLabels(toggle);
        this._syncToggleIcons(toggle);
    },

    _syncToggleIcons(toggle) {
        const isPaused = toggle.getAttribute('data-state') === 'paused';
        const pauseIcon = toggle.querySelector('.slides-show__autoplay-icon--pause');
        const playIcon = toggle.querySelector('.slides-show__autoplay-icon--play');
        pauseIcon?.classList.toggle('hidden', isPaused);
        playIcon?.classList.toggle('hidden', !isPaused);
    },

    _syncToggleLabels(toggle) {
        const pauseLabel = toggle.dataset.labelPause || '';
        const playLabel = toggle.dataset.labelPlay || '';
        const isPaused = toggle.getAttribute('data-state') === 'paused';
        toggle.setAttribute('aria-label', isPaused ? playLabel : pauseLabel);
    },

    async _initSwiper() {
        const swiperContainer = this._root?.querySelector('.swiper');
        this._swiperContainer = swiperContainer;
        if (!swiperContainer) return;

        const config = this._readConfig();
        const slides = this._root.querySelectorAll('.swiper-slide');
        if (slides.length <= 1) {
            syncSlideAriaHidden(swiperContainer);
            return;
        }

        const scriptUrl = this._readSwiperScriptUrl();
        if (!scriptUrl) return;

        const runAutoplay = this._shouldRunAutoplay(config);
        if (!config.autoplaySetting || prefersReducedMotion()) {
            this._setProgress(1);
        }

        try {
            await loadSwiper(scriptUrl);
            if (!this._root) return;

            this._swiper = await createSwiper(swiperContainer, {
                loop: slides.length > 1,
                slidesPerView: 1,
                effect: 'fade',
                fadeEffect: { crossFade: true },
                pagination: false,
                navigation: false,
                autoplay: runAutoplay
                    ? {
                          delay: config.delayMs,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: false,
                      }
                    : false,
            });

            if (!this._root) {
                destroySwiper(this._swiper);
                this._swiper = null;
                return;
            }

            this._showControls();
            this._bindInteractionPause();
            this._bindPagination();

            const toggle = swiperContainer.querySelector('[data-slides-show-autoplay-toggle]');
            if (toggle) {
                if (!config.autoplaySetting || prefersReducedMotion()) {
                    toggle.hidden = true;
                } else {
                    toggle.setAttribute('data-state', runAutoplay ? 'playing' : 'paused');
                    this._syncToggleLabels(toggle);
                    this._syncToggleIcons(toggle);
                }
            }

            this._onSlideChange = () => this._onSlideChanged();
            this._swiper?.on?.('slideChange', this._onSlideChange);

            // With motion off (theme switch or reduced motion) the pill stays full and still.
            const animateProgress = motionEnabled();
            this._onAutoplayTimeLeft = (_swiper, _timeLeft, progress) => {
                if (!animateProgress) return;
                if (!runAutoplay || this._userPaused || this._editorPaused) return;
                if (this._hoverPaused || this._focusPaused) return;
                // Swiper passes the remaining fraction (1 → 0); the pill fills as time passes.
                this._setProgress(1 - progress);
            };
            this._swiper?.on?.('autoplayTimeLeft', this._onAutoplayTimeLeft);

            if (!runAutoplay || !animateProgress) {
                this._setProgress(1);
            }

            syncSlideAriaHidden(swiperContainer, this._activeSlide());
            syncPaginationVisuals(swiperContainer, this._swiper.realIndex ?? 0, this._progress);

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
        if (this._swiper && typeof this._swiper.off === 'function') {
            if (this._onSlideChange) {
                this._swiper.off('slideChange', this._onSlideChange);
            }
            if (this._onAutoplayTimeLeft) {
                this._swiper.off('autoplayTimeLeft', this._onAutoplayTimeLeft);
            }
        }

        destroySwiper(this._swiper);
        this._swiper = null;
        this._onSlideChange = null;
        this._onAutoplayTimeLeft = null;
        this._onKeydown = null;
        this._swiperContainer = null;
    },

    destroy() {
        if (this._offEditorSelect) {
            this._offEditorSelect();
            this._offEditorSelect = null;
        }
        if (this._offEditorDeselect) {
            this._offEditorDeselect();
            this._offEditorDeselect = null;
        }
        if (this._eventScope) {
            this._eventScope.dispose();
            this._eventScope = null;
        }
        this._teardownSwiper();
        this._root = null;
        this.dispose();
    },
}));
