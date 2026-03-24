(function () {
    'use strict';

    class ThemePerformance {
        static init() {
            if (!window.PerformanceObserver) return;
            const isDebug =
                window.location.search.includes('debug=true') || window.Shopify?.designMode;
            if (!isDebug) return;

            this.observeLongTasks();
            this.observeLCP();
        }

        static observeLongTasks() {
            try {
                new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) =>
                        console.warn(
                            `[Performance] Long Task: ${entry.duration.toFixed(0)}ms`,
                            entry,
                        ),
                    );
                }).observe({ entryTypes: ['longtask'] });
            } catch (e) {
                /* unsupported */
            }
        }

        static observeLCP() {
            try {
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.info(`[Performance] LCP: ${lastEntry.startTime.toFixed(0)}ms`);
                }).observe({
                    type: 'largest-contentful-paint',
                    buffered: true,
                });
            } catch (e) {
                /* unsupported */
            }
        }
    }

    window.__Theme__ = window.__Theme__ || {};
    window.__Theme__.ThemePerformance = ThemePerformance;
})();
