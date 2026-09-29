import { define } from 'alpine-adapter';
import ThemeEvents from 'events';

define('dropdown', () => {
    const headerMenuActiveEvent = ThemeEvents.events.HEADER_MENU_ACTIVE_CHANGED;

    return {
        openEls: [],
        hoverOpened: false,

        emitHeaderMenuActive(active) {
            ThemeEvents.emit(headerMenuActiveEvent, { active: Boolean(active) });
        },

        onHeaderEnter() {
            this.cancelHoverClose();
            this.emitHeaderMenuActive(true);
        },

        onDropdownPanelMouseEnter() {
            this.cancelHoverClose();
            this.cancelHoverOpen();
            this.onHeaderEnter();
        },

        onSuperMenuPanelMouseEnter() {
            this.cancelHoverClose();
            this.cancelHoverOpen();
            this.onHeaderEnter();
        },

        onNestedDropdownPanelMouseEnter() {
            this.cancelHoverClose();
            this.onHeaderEnter();
        },

        onHeaderLeave() {
            this.emitHeaderMenuActive(false);
        },

        onHeaderFocusIn() {
            this.emitHeaderMenuActive(true);
        },

        onHeaderFocusOut(event) {
            if (this.$el.contains(event?.relatedTarget)) return;

            this.emitHeaderMenuActive(false);
        },

        closeAndDeactivate(from = 0) {
            this.cancelHoverOpen();
            this.close(from);
            this.emitHeaderMenuActive(false);
        },

        closeHoverAndDeactivate() {
            if (!this.canHoverOpen()) {
                this.emitHeaderMenuActive(false);
                return;
            }

            this.cancelHoverOpen();
            this.scheduleHoverClose();
        },

        cancelHoverClose() {
            clearTimeout(this._hoverCloseTimer);
        },

        scheduleHoverClose() {
            if (!this.canHoverOpen()) return;

            this.cancelHoverClose();
            this._hoverCloseTimer = window.setTimeout(() => {
                if (this.hoverOpened) {
                    this.close(0);
                }

                this.emitHeaderMenuActive(false);
            }, 180);
        },

        onMenuTriggerClickEvent(event) {
            const target = event?.target;

            if (!(target instanceof Element)) return;

            const trigger = target.closest('summary.dropdown-trigger');
            if (!trigger || !this.$el.contains(trigger)) return;

            event.preventDefault();
            event.stopPropagation();

            this.cancelHoverOpen();
            this.toggle(trigger.parentElement);
        },

        onMenuKeydown(event) {
            if (event?.key !== 'Escape') return;

            this.cancelHoverOpen();

            const topDetails = this.openEls.find(Boolean);
            if (!topDetails) {
                this.emitHeaderMenuActive(false);
                return;
            }

            // Only take Escape and move focus when focus is inside the open menu; otherwise just close.
            const focusInside = topDetails.contains(document.activeElement);
            const trigger = topDetails.querySelector(':scope > summary.dropdown-trigger');

            this.closeAndDeactivate(0);

            if (!focusInside) return;

            event.preventDefault();

            if (trigger instanceof HTMLElement) {
                trigger.focus();
            }
        },

        toggle(target) {
            this.cancelHoverOpen();

            const current = target.closest('[data-dropdown]');

            if (!current) return;

            const deep = Number(current.dataset.deep);

            if (this.openEls[deep] === current) {
                this.close(deep);
                return;
            }

            this.open(current, deep);

            if (this.isDesktopClickTrigger()) {
                this.hoverOpened = false;
            }
        },

        scheduleHoverOpen(target, delay = 120) {
            if (!this.canHoverOpen()) return;

            const current = target?.matches?.('[data-dropdown]')
                ? target
                : target?.closest?.('[data-dropdown]');

            if (!current) return;

            const deep = Number(current.dataset.deep);
            const openedAtDeep = this.openEls[deep];

            if (openedAtDeep === current) {
                this.cancelHoverOpen();
                return;
            }

            this.cancelHoverOpen();
            this._pendingHoverTarget = current;

            this._hoverOpenTimer = window.setTimeout(() => {
                if (this._pendingHoverTarget !== current) return;

                this.cancelHoverClose();

                const stillOpen = this.openEls[deep];

                if (stillOpen && stillOpen !== current) {
                    this.switchOpen(current, deep, { replayMotion: false });
                } else {
                    this.open(current, deep, { replayMotion: true });
                }

                this.hoverOpened = true;
                this._pendingHoverTarget = null;
                this._hoverOpenTimer = null;
            }, delay);
        },

        cancelHoverOpen() {
            clearTimeout(this._hoverOpenTimer);
            this._hoverOpenTimer = null;
            this._pendingHoverTarget = null;
        },

        openOnHoverEvent(event) {
            if (!this.canHoverOpen()) return;

            const target = event?.target;

            if (!(target instanceof Element)) return;

            const trigger = target.closest('summary.dropdown-trigger');

            if (!trigger || !this.$el.contains(trigger)) return;

            this.scheduleHoverOpen(trigger.parentElement);
        },

        open(current, deep, { replayMotion = true } = {}) {
            if (this.openEls[deep] !== current) {
                this.closeFromDepth(deep);
            }

            current.setAttribute('open', '');

            if (replayMotion) {
                this.replayLayeredPanelMotion(current);
            } else {
                this.ensureLayeredPanelVisible(current);
            }

            this.openEls[deep] = current;
        },

        switchOpen(current, deep, { replayMotion = false } = {}) {
            const previous = this.openEls[deep];

            if (previous === current) return;

            for (let i = this.openEls.length - 1; i > deep; i--) {
                const el = this.openEls[i];

                if (el) {
                    this.resetLayeredPanelMotion(el);
                    el.removeAttribute('open');
                }
            }

            this.openEls.length = Math.min(this.openEls.length, deep + 1);

            current.setAttribute('open', '');

            if (replayMotion) {
                this.replayLayeredPanelMotion(current);
            } else {
                this.ensureLayeredPanelVisible(current);
            }

            this.openEls[deep] = current;

            if (previous && previous !== current) {
                this.resetLayeredPanelMotion(previous);
                previous.removeAttribute('open');
            }
        },

        ensureLayeredPanelVisible(target) {
            const panel = target.querySelector(':scope > .panel-motion-layered');

            if (!panel) return;

            panel.removeAttribute('data-panel-motion');
        },

        canHoverOpen() {
            return (
                window.matchMedia?.('(any-hover: hover) and (any-pointer: fine)')?.matches &&
                this.$el.dataset.desktopMenuTrigger === 'hover'
            );
        },

        isDesktopClickTrigger() {
            return this.$el.dataset.desktopMenuTrigger === 'click';
        },

        replayLayeredPanelMotion(target) {
            const panel = target.querySelector(':scope > .panel-motion-layered');

            if (!panel) return;

            panel.removeAttribute('data-panel-motion');
            void panel.offsetWidth;
            panel.setAttribute('data-panel-motion', 'enter');
        },

        resetLayeredPanelMotion(target) {
            const panel = target.querySelector(':scope > .panel-motion-layered');

            if (!panel) return;

            panel.removeAttribute('data-panel-motion');
        },

        close(from = 0) {
            this.cancelHoverOpen();
            this.closeFromDepth(from);
            this.hoverOpened = false;
        },

        closeFromDepth(from) {
            for (let i = from; i < this.openEls.length; i++) {
                const el = this.openEls[i];

                if (el) {
                    this.resetLayeredPanelMotion(el);
                    el.removeAttribute('open');
                }
            }

            this.openEls.length = from;
        },
    };
});
