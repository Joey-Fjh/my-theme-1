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
}));
