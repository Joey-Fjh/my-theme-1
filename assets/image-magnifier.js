import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('imageMagnifier', () => ({
    ...useDisposable(),
    active: false,
    imageReady: false,
    previewFrameStyle: '',
    previewImageStyle: '',
    scale: 2,
    previewMode: 'magnify',
    previewWidth: 0,
    previewHeight: 0,
    previewMaxWidth: 560,
    previewGap: 12,
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
            Math.max(240, Number(this.$el.dataset.previewMaxWidth)) || this.previewMaxWidth;
        this.previewGap = Math.max(0, Number(this.$el.dataset.previewGap)) || this.previewGap;
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
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
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
        const imageStyles = [`background-image: url("${safeUrl}")`, `background-repeat: no-repeat`];

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
}));
