(function () {
    'use strict';

    class Utils {
        static rafThrottle(fn) {
            let ticking = false;
            let lastArgs = null;
            let rafId = null;
            const wrapper = function (...args) {
                lastArgs = args;
                if (!ticking) {
                    ticking = true;
                    rafId = requestAnimationFrame(() => {
                        fn.apply(this, lastArgs);
                        ticking = false;
                    });
                }
            };
            wrapper.dispose = () => {
                if (rafId) cancelAnimationFrame(rafId);
                ticking = false;
                lastArgs = null;
            };
            return wrapper;
        }

        static throttle(func, delay = 300) {
            let timeoutId;
            let lastExecTime = 0;

            return function (...args) {
                const currentTime = Date.now();

                if (currentTime - lastExecTime > delay) {
                    func.apply(this, args);
                    lastExecTime = currentTime;
                } else {
                    clearTimeout(timeoutId);

                    timeoutId = setTimeout(
                        () => {
                            func.apply(this, args);
                            lastExecTime = Date.now();
                        },
                        delay - (currentTime - lastExecTime),
                    );
                }
            };
        }

        static debounce(func, wait = 300, immediate = false) {
            let timeout;

            const wrapper = function (...args) {
                const context = this;

                const later = () => {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };

                const callNow = immediate && !timeout;

                clearTimeout(timeout);
                timeout = setTimeout(later, wait);

                if (callNow) func.apply(context, args);
            };

            wrapper.dispose = () => {
                clearTimeout(timeout);
                timeout = null;
            };

            return wrapper;
        }

        static setupProductLayout(el) {
            function getViewportHeight() {
                return window.visualViewport?.height || window.innerHeight;
            }

            function clearSticky(target) {
                if (!target) return;
                target.style.removeProperty('position');
                target.style.removeProperty('top');
                target.style.removeProperty('transition');
                target.style.removeProperty('align-self');
            }

            function applySticky(target) {
                if (!target) return;
                target.style.position = 'sticky';
                target.style.top = 'var(--product-sticky-top, 0px)';
                target.style.transition = 'top 120ms ease-out';
                target.style.alignSelf = 'start';
            }

            const mediaPanel = el.querySelector('[data-product-media-panel]');
            const mediaTarget = el.querySelector('[data-product-media-sticky-target]');
            const infoTarget = el.querySelector('[data-product-info-sticky-target]');
            const infoBlocks = el.querySelector('[data-product-info-panel] .product-info-blocks');
            const descriptionBlock = infoBlocks?.querySelector(
                '.product-info-blocks__description-block',
            );
            const description = descriptionBlock?.querySelector(
                '.product-info-blocks__description',
            );
            if (!mediaTarget || !infoTarget) return {};

            const desktopQuery = window.matchMedia('(min-width: 48rem)');
            let frame = 0;
            let stickySide = 'none';

            const setStickyOffset = () => {
                el.style.setProperty('--product-sticky-top', '0px');
            };

            const resetDescription = () => {
                infoBlocks?.style.removeProperty('max-height');
                descriptionBlock?.style.removeProperty('max-height');
                description?.style.removeProperty('max-height');
            };

            const resetSticky = () => {
                clearSticky(mediaTarget);
                clearSticky(infoTarget);
                stickySide = 'none';
            };

            const reset = () => {
                resetSticky();
                resetDescription();
            };

            const sync = () => {
                if (frame) cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => {
                    frame = 0;
                    setStickyOffset();

                    if (!desktopQuery.matches) {
                        reset();
                        return;
                    }

                    const mediaHeight = mediaTarget.getBoundingClientRect().height;
                    const infoHeight = infoTarget.getBoundingClientRect().height;
                    if (mediaHeight <= 0) {
                        reset();
                        return;
                    }

                    const availableViewport = Math.max(0, getViewportHeight());
                    const heightTolerance = 24;
                    const nextStickySide =
                        mediaHeight + heightTolerance < infoHeight ? 'media' : 'info';
                    const stickyTarget = nextStickySide === 'media' ? mediaTarget : infoTarget;
                    const stickyHeight = nextStickySide === 'media' ? mediaHeight : infoHeight;

                    clearSticky(mediaTarget);
                    clearSticky(infoTarget);

                    if (stickyHeight <= availableViewport) {
                        applySticky(stickyTarget);
                        stickySide = nextStickySide;
                    } else {
                        stickySide = 'none';
                    }

                    if (mediaPanel && infoBlocks && descriptionBlock && description) {
                        const maxReferenceHeight = Math.max(360, availableViewport);
                        const referenceHeight = Math.min(
                            mediaPanel.getBoundingClientRect().height,
                            maxReferenceHeight,
                        );

                        const styles = window.getComputedStyle(infoBlocks);
                        const gap = parseFloat(styles.rowGap || styles.gap) || 0;
                        const paddingY =
                            (parseFloat(styles.paddingTop) || 0) +
                            (parseFloat(styles.paddingBottom) || 0);
                        const children = Array.from(infoBlocks.children).filter(
                            (child) => child instanceof HTMLElement,
                        );
                        const otherBlocksHeight = children.reduce((total, child) => {
                            if (child === descriptionBlock) return total;
                            return total + child.getBoundingClientRect().height;
                        }, 0);
                        const gapsHeight = gap * Math.max(children.length - 1, 0);
                        const available = Math.max(
                            0,
                            referenceHeight - paddingY - gapsHeight - otherBlocksHeight,
                        );

                        descriptionBlock.style.maxHeight = `${Math.floor(available)}px`;
                        description.style.maxHeight = `${Math.floor(available)}px`;
                    } else {
                        resetDescription();
                    }
                });
            };

            const resizeObserver = new ResizeObserver(sync);
            resizeObserver.observe(mediaTarget);
            resizeObserver.observe(infoTarget);
            if (infoBlocks) {
                Array.from(infoBlocks.children).forEach((child) => resizeObserver.observe(child));
            }

            window.addEventListener('resize', sync);
            desktopQuery.addEventListener('change', sync);
            sync();

            return {
                description,
                descriptionBlock,
                desktopQuery,
                get frame() {
                    return frame;
                },
                infoBlocks,
                reset,
                resizeObserver,
                sync,
                get stickySide() {
                    return stickySide;
                },
            };
        }
    }

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.Utils = Utils;
})();
