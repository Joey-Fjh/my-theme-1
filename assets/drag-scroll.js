import { define } from 'alpine-adapter';
import { useDisposable } from 'utils';

define('dragScroll', ({ axis = 'x', threshold = 6, clickGuardMs = 100 } = {}) => ({
    ...useDisposable(),
    axis,
    threshold,
    clickGuardMs,
    _pointerDown: false,
    _dragging: false,
    _startX: 0,
    _startY: 0,
    _startScrollLeft: 0,
    _startScrollTop: 0,
    _suppressClickUntil: 0,

    init() {
        this.on(this.$el, 'pointerdown', this.onPointerDown.bind(this));
        this.on(window, 'pointermove', this.onPointerMove.bind(this), {
            passive: false,
        });
        this.on(window, 'pointerup', this.endDrag.bind(this));
        this.on(window, 'pointercancel', this.endDrag.bind(this));
        this.on(this.$el, 'click', this.onClickCapture.bind(this), true);
        this.on(this.$el, 'dragstart', this.onDragStart.bind(this));
    },

    onPointerDown(event) {
        if (event.button !== 0) return;

        this._pointerDown = true;
        this._dragging = false;
        this._startX = event.clientX;
        this._startY = event.clientY;
        this._startScrollLeft = this.$el.scrollLeft;
        this._startScrollTop = this.$el.scrollTop;
        this.$el.classList.add('is-pointer-down');
    },

    onPointerMove(event) {
        if (!this._pointerDown) return;

        const deltaX = event.clientX - this._startX;
        const deltaY = event.clientY - this._startY;
        const distance = this.axis === 'y' ? Math.abs(deltaY) : Math.abs(deltaX);

        if (!this._dragging && distance >= this.threshold) {
            this._dragging = true;
            this.$el.classList.add('is-dragging');
        }

        if (!this._dragging) return;

        if (this.axis === 'y') {
            this.$el.scrollTop = this._startScrollTop - deltaY;
        } else {
            this.$el.scrollLeft = this._startScrollLeft - deltaX;
        }

        event.preventDefault();
    },

    endDrag() {
        if (!this._pointerDown) return;

        this._pointerDown = false;
        this.$el.classList.remove('is-pointer-down');

        if (this._dragging) {
            this._suppressClickUntil = performance.now() + this.clickGuardMs;
        }

        requestAnimationFrame(() => {
            this._dragging = false;
            this.$el.classList.remove('is-dragging');
        });
    },

    onClickCapture(event) {
        if (performance.now() < this._suppressClickUntil) {
            event.preventDefault();
            event.stopPropagation();
        }
    },

    onDragStart(event) {
        event.preventDefault();
    },

    destroy() {
        this.$el.classList.remove('is-dragging');
        this.$el.classList.remove('is-pointer-down');
        this.dispose();
    },
}));
