import { define, store, data } from 'alpine-adapter';
import { createCollectionFiltersState } from './collection-filters.js';
import {
    readCollectionFormParams,
    requestCollectionSectionHtml,
    resolveFiltersDialogId,
    resolveFiltersFormId,
    resolveSearchFilterActionUrl,
} from './collection-filters-helpers.js';
import ShopifyHttp, { SectionRefresher } from 'https';

const PRODUCT_REFRESH_SELECTORS = ['[data-search-results-content]', '[data-search-drawer-body]'];
const TYPE_CHANGE_SELECTORS = ['[data-search-type-shell]', '[data-search-drawer-shell]'];

export function createSearchFiltersState(sectionId = null, selectors = null) {
    const base = createCollectionFiltersState(sectionId, selectors);

    return {
        ...base,

        renderedResultType: 'product',

        init() {
            const ds = this.$el?.dataset;
            const initial = (ds?.searchResultType || 'product').toLowerCase();
            this.renderedResultType =
                initial === 'article' || initial === 'page' || initial === 'product'
                    ? initial
                    : 'product';

            base.init.call(this);
        },

        buildFilterActionUrl(targetHref) {
            return resolveSearchFilterActionUrl(targetHref, this._getFormParams());
        },

        _getFormParams() {
            const params = readCollectionFormParams(resolveFiltersFormId(this));
            try {
                const currentSort = new URL(
                    window.location.href,
                    window.location.origin,
                ).searchParams.get('sort_by');
                if (currentSort && !params.has('sort_by')) {
                    params.set('sort_by', currentSort);
                }
            } catch (_) {
                /* ignore */
            }
            return params;
        },

        _getSearchResultType(url) {
            try {
                const parsed = new URL(url, window.location.origin);
                const type = (parsed.searchParams.get('type') || 'product').toLowerCase();
                if (type === 'article' || type === 'page' || type === 'product') return type;
            } catch (_) {
                /* ignore */
            }
            return 'product';
        },

        _getSearchDialogStore() {
            return store('dialog') || null;
        },

        _isSearchFilterDialogOpen() {
            const dialog = this._getSearchDialogStore();
            return Boolean(dialog?.isOpen?.(resolveFiltersDialogId(this)));
        },

        _hasSearchFilterDialogLifecycle() {
            const dialog = this._getSearchDialogStore();
            const dialogId = resolveFiltersDialogId(this);
            return Boolean(dialog?.isOpen?.(dialogId) || dialog?.isClosing?.(dialogId));
        },

        _getSearchFilterTrigger() {
            return this.$el?.querySelector?.('[data-search-filter-trigger]') || null;
        },

        _getSearchDialogPanel() {
            const dialogId = resolveFiltersDialogId(this);
            return document.querySelector(
                `[data-dialog-root][data-dialog-id="${dialogId}"] [data-dialog-panel]`,
            );
        },

        _captureDrawerFocusIntent() {
            const active = document.activeElement;
            if (!active || active === document.body) return { kind: 'panel' };

            const panel = this._getSearchDialogPanel();
            if (!panel || !panel.contains(active)) return { kind: 'panel' };

            const name = active.getAttribute?.('name') || active.name;
            if (!name) return { kind: 'panel' };

            return {
                kind: 'control',
                name,
                value: active.value || '',
            };
        },

        _findDrawerFocusTarget(intent) {
            const panel = this._getSearchDialogPanel();
            if (!panel) return null;

            if (intent?.kind === 'control' && intent.name) {
                let match = null;
                if (intent.value !== '') {
                    match = panel.querySelector(
                        `[name="${CSS.escape(intent.name)}"][value="${CSS.escape(intent.value)}"]`,
                    );
                }
                if (!match) {
                    match = panel.querySelector(`[name="${CSS.escape(intent.name)}"]`);
                }
                if (match && panel.contains(match)) return match;
            }

            return null;
        },

        _forceCloseSearchFilterDialog() {
            const dialog = this._getSearchDialogStore();
            dialog?.forceClose?.(resolveFiltersDialogId(this));
        },

        _parkFocusBeforeTypeChange() {
            const trigger = this._getSearchFilterTrigger();
            if (trigger?.isConnected && typeof trigger.focus === 'function') {
                trigger.focus({ preventScroll: true });
                return;
            }

            const tab =
                this.$el?.querySelector?.('[role="tab"][aria-selected="true"]') ||
                this.$el?.querySelector?.('[role="tab"].is-active');
            if (tab?.isConnected && typeof tab.focus === 'function') {
                tab.focus({ preventScroll: true });
            }
        },

        _announceSearchResults() {
            const live = this.$el?.querySelector?.('[data-search-results-live]');
            const source = this.$el?.querySelector?.('[data-search-results-status]');
            if (!live || !source) return;

            const nextText = (source.textContent || '').trim();
            if (!nextText) return;

            if (live.textContent === nextText) {
                live.textContent = '';
            }
            requestAnimationFrame(() => {
                live.textContent = nextText;
            });
        },

        _focusActiveSearchTab() {
            const focusTab = () => {
                const tab =
                    this.$el?.querySelector?.('[role="tab"][aria-selected="true"]') ||
                    this.$el?.querySelector?.('[role="tab"].is-active');
                if (tab && typeof tab.focus === 'function' && tab.isConnected) {
                    tab.focus({ preventScroll: true });
                    return true;
                }
                return false;
            };

            requestAnimationFrame(() => {
                if (focusTab()) return;
                requestAnimationFrame(focusTab);
            });
        },

        _reconcileSearchFilterDialog({
            nextType,
            dialogWasOpen,
            focusIntent,
            closedDialogForTypeChange,
        }) {
            if (nextType !== 'product') {
                this._forceCloseSearchFilterDialog();
                if (closedDialogForTypeChange) {
                    this._focusActiveSearchTab();
                }
                return;
            }

            if (!dialogWasOpen) return;

            const dialog = this._getSearchDialogStore();
            const dialogId = resolveFiltersDialogId(this);
            if (!dialog?.isOpen?.(dialogId)) return;

            const trigger = this._getSearchFilterTrigger();
            const focusElement = this._findDrawerFocusTarget(focusIntent);

            dialog.refreshOpenContent(dialogId, {
                returnFocusTo: trigger,
                focusElement,
            });
        },

        _executeFetch(url, updateHistory) {
            if (!ShopifyHttp || !SectionRefresher || !this.sectionId) return;

            if (this.abortController) this.abortController.abort();
            this.abortController = new AbortController();
            const activeController = this.abortController;

            const prevType = this.renderedResultType || 'product';
            const nextType = this._getSearchResultType(url);
            const typeChanged = prevType !== nextType;
            const dialogWasOpen = this._isSearchFilterDialogOpen();
            const dialogLifecycle = this._hasSearchFilterDialogLifecycle();
            const focusIntent = dialogWasOpen ? this._captureDrawerFocusIntent() : null;
            let closedDialogForTypeChange = false;

            if (dialogLifecycle && nextType !== 'product') {
                this._forceCloseSearchFilterDialog();
                closedDialogForTypeChange = true;
                this._parkFocusBeforeTypeChange();
            }

            const previousSelectors = this.selectors;
            this.selectors =
                !typeChanged && nextType === 'product'
                    ? PRODUCT_REFRESH_SELECTORS
                    : TYPE_CHANGE_SELECTORS;

            requestCollectionSectionHtml(ShopifyHttp, url, this.sectionId, activeController.signal)
                .then((html) => {
                    if (typeof html !== 'string' || !html.trim()) return;
                    if (this.abortController !== activeController) return;

                    SectionRefresher.render(html, this.buildDomMap());
                    this.renderedResultType = nextType;

                    if (updateHistory) {
                        window.history.pushState({ path: url }, '', url);
                    }

                    this.syncControlsFromUrl(url);
                    this._announceSearchResults();
                    this._reconcileSearchFilterDialog({
                        nextType,
                        dialogWasOpen,
                        focusIntent,
                        closedDialogForTypeChange,
                    });
                })
                .catch((err) => {
                    if (err?.isAbort || err?.name === 'AbortError') return;
                    if (updateHistory) window.location.href = url;
                })
                .finally(() => {
                    if (this.abortController === activeController) {
                        this.selectors = previousSelectors;
                        this.isLoading = false;
                        this.abortController = null;
                    }
                });
        },

        onSearchResultTabClick(event) {
            const el = event?.currentTarget;
            const href = el?.href;
            if (!href) return;
            event.preventDefault();

            const tabRoot = this.$el.querySelector('[data-module-id="tab-control"]');
            const tabScope = data(tabRoot);
            const index = tabScope?.tabIndexFor?.(el);

            this.loadUrl(href);
            if (Number.isFinite(index) && index >= 0) {
                tabScope?.setActive?.(index);
            }
        },

        onSearchResultTabPopstate(href) {
            if (!this.isUrlMatch(href)) return;
            const tabRoot = this.$el.querySelector('[data-module-id="tab-control"]');
            const tabScope = data(tabRoot);
            const tab = [...(tabScope?.tabs || [])].find((candidate) => candidate.href === href);
            const index = tab ? tabScope.tabIndexFor(tab) : -1;
            if (index >= 0) tabScope?.setActive?.(index);
        },

        onPaginationNavClick(event) {
            const link = event?.target?.closest?.('[data-pagination-nav] a');
            if (!link) return;
            event.preventDefault();
            this.loadUrl(link.href);
        },
    };
}

define('searchFilters', (sectionId = null, selectors = null) =>
    createSearchFiltersState(sectionId, selectors),
);
