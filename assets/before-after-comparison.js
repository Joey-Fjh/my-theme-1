import { define } from 'alpine-adapter';
import { useDisposable, Utils } from 'utils';

define('beforeAfterComparison', () => ({
    ...useDisposable(),
    position: 0,
    isDragging: false,
    _animateFrame: null,

    init() {
        if (!this._shouldAnimateSweep()) {
            this.position = 50;
        }
    },

    _prefersReducedMotion() {
        return Utils.prefersReducedMotion();
    },

    _shouldAnimateSweep() {
        return document.body?.dataset?.motionEnabled !== 'false' && !this._prefersReducedMotion();
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

    // Pointer events with capture; the drag area's touch-action: pan-y leaves vertical
    // swipes to the page, which then cancels the pointer instead of moving the slider.
    startDrag(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this._cancelSweep();
        this.isDragging = true;
        this.$refs.container?.setPointerCapture?.(e.pointerId);
        // A touch only moves the slider once it moves sideways, so a tap or scroll start does not jump it.
        if (e.pointerType === 'mouse') this.updatePosition(e);
    },

    onDrag(e) {
        if (!this.isDragging) return;
        this.updatePosition(e);
    },

    endDrag(e) {
        this.isDragging = false;
        if (e?.pointerId !== undefined && this.$refs.container?.hasPointerCapture?.(e.pointerId)) {
            this.$refs.container.releasePointerCapture(e.pointerId);
        }
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

        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        this.position = percentage;
    },

    destroy() {
        this._cancelSweep();
        this.dispose();
    },
}));
