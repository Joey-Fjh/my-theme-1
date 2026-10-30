import { define } from 'alpine-adapter';
import ShopifyHttp from 'https';
import {
    buildCollectionNavigationHref,
    requestCollectionNavigationSectionHtml,
} from './collection-filters-helpers.js';

define('collectionNavigationCatalog', () => ({
    loading: false,
    error: false,
    done: false,
    sourceDone: false,
    loadedHandles: new Set(),
    pendingItems: [],
    abortController: null,
    endpointPath: '',
    sectionId: 'collection-navigation-items',
    dialogId: '',
    sortBy: '',
    listEl: null,
    loadSize: 12,
    nextPage: 1,

    init() {
        const ds = this.$el?.dataset;
        if (!ds) return;

        this.endpointPath = ds.endpointPath || window.location.pathname;
        this.sectionId = ds.sectionId || 'collection-navigation-items';
        this.dialogId = ds.dialogId || '';
        this.sortBy = ds.sortBy || '';
        this.listEl = this.$el.querySelector('[data-collection-navigation-list]');
        this.loadSize = Math.max(1, Number(ds.loadSize) || 12);

        const initialSourceOffset = Math.max(0, Number(ds.initialSourceOffset) || 0);
        this.nextPage = Math.floor(initialSourceOffset / this.loadSize) + 1;
        this.sourceDone = ds.initialHasMore !== 'true';
        this.done = this.sourceDone;

        this.$el.querySelectorAll('[data-collection-navigation-item]').forEach((link) => {
            const handle = link.getAttribute('data-collection-handle');
            if (handle) this.loadedHandles.add(handle);
        });

        this.$watch('$store.dialog.active', (activeId) => {
            if (activeId !== this.dialogId) return;
            this.refreshSortState();
        });
    },

    destroy() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    },

    readSortByFromLocation() {
        return new URLSearchParams(window.location.search).get('sort_by') || '';
    },

    syncNavigationLinkHrefs() {
        this.$el.querySelectorAll('[data-collection-navigation-item]').forEach((link) => {
            const basePath = link.getAttribute('data-collection-navigation-base-path');
            if (!basePath) return;

            link.setAttribute('href', buildCollectionNavigationHref(basePath, this.sortBy));
        });
    },

    refreshSortState() {
        this.sortBy = this.readSortByFromLocation();
        this.syncNavigationLinkHrefs();
    },

    retry() {
        this.error = false;
        this.loadMore();
    },

    appendPendingItems(limit) {
        let appended = 0;

        while (this.pendingItems.length && appended < limit) {
            this.listEl.appendChild(this.pendingItems.shift());
            appended += 1;
        }

        return appended;
    },

    enqueueBatchItems(batch) {
        batch.querySelectorAll('[data-collection-navigation-item]').forEach((item) => {
            const handle = item.getAttribute('data-collection-handle');
            if (!handle || this.loadedHandles.has(handle)) return;

            this.loadedHandles.add(handle);
            this.pendingItems.push(document.importNode(item, true));
        });
    },

    async loadMore() {
        if (this.loading || this.done || !this.listEl) return;

        this.refreshSortState();

        if (!ShopifyHttp) {
            this.error = true;
            return;
        }

        this.loading = true;
        this.error = false;

        if (this.abortController) this.abortController.abort();
        this.abortController = new AbortController();
        const activeController = this.abortController;

        try {
            let appended = this.appendPendingItems(this.loadSize);
            let requestGuard = 0;

            while (appended < this.loadSize && !this.sourceDone && requestGuard < 10) {
                const html = await requestCollectionNavigationSectionHtml(
                    ShopifyHttp,
                    this.endpointPath,
                    this.sectionId,
                    this.nextPage,
                    this.sortBy,
                    activeController.signal,
                );

                if (typeof html !== 'string' || !html.trim()) {
                    throw new Error('empty-response');
                }
                if (this.abortController !== activeController) return;

                const doc = new DOMParser().parseFromString(html, 'text/html');
                const batch = doc.querySelector('[data-collection-navigation-batch]');
                if (!batch) {
                    throw new Error('missing-batch');
                }

                this.nextPage += 1;
                this.enqueueBatchItems(batch);
                this.sourceDone = batch.getAttribute('data-has-next-page') !== 'true';
                appended += this.appendPendingItems(this.loadSize - appended);
                requestGuard += 1;
            }

            this.syncNavigationLinkHrefs();
            this.done = this.sourceDone && this.pendingItems.length === 0;
        } catch (err) {
            if (err?.isAbort || err?.name === 'AbortError') return;
            this.error = true;
        } finally {
            if (this.abortController === activeController) {
                this.loading = false;
                this.abortController = null;
            }
        }
    },
}));
