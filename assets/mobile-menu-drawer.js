import { define } from 'alpine-adapter';

define('mobileMenuDrawer', () => ({
    activeTopIndex: -1,
    thirdLevelParentTitle: '',
    thirdLevelLinks: [],
    // '' | 'country' | 'language': the localization list shown in place of the menu.
    localizationPanel: '',
    localizationQuery: '',
    localizationEmpty: false,

    init() {
        const menu = this.$refs.topMenu;
        if (menu) {
            const firstWithChildren = Array.from(menu.children).findIndex(
                (item) => item.dataset.hasChildren === 'true',
            );
            this.activeTopIndex = firstWithChildren >= 0 ? firstWithChildren : -1;
        }

        this.$watch('localizationQuery', () => this._syncLocalizationEmpty());
    },

    openTop(index) {
        this.thirdLevelParentTitle = '';
        this.thirdLevelLinks = [];
        this.activeTopIndex = this.activeTopIndex === index ? -1 : index;
    },

    openThirdLevel(title, links) {
        this.thirdLevelParentTitle = title || '';
        this.thirdLevelLinks = Array.isArray(links) ? links : [];
    },

    openThirdLevelFromButton(button) {
        if (!button) return;
        const payload = button.getAttribute('data-third-payload');
        if (!payload) return;

        try {
            const parsed = JSON.parse(payload);
            this.openThirdLevel(parsed.title, parsed.links);
        } catch (_) {
            this.openThirdLevel('', []);
        }
    },

    backToSecondLevel() {
        this.thirdLevelParentTitle = '';
        this.thirdLevelLinks = [];
    },

    openLocalization(kind) {
        if (kind !== 'country' && kind !== 'language') return;
        // The same trigger closes its own panel.
        if (this.localizationPanel === kind) {
            this.closeLocalization();
            return;
        }

        this.localizationQuery = '';
        this.localizationEmpty = false;
        this.localizationPanel = kind;
        // x-show reveals the panel after the tick; focus on the next frame, once it is displayed.
        this.$nextTick(() =>
            requestAnimationFrame(() => {
                const panel = this._localizationPanelEl(kind);
                const target =
                    panel?.querySelector('.mobile-localization-panel__filter') ||
                    panel?.querySelector('[aria-current="true"]') ||
                    panel?.querySelector('.mobile-localization-panel__back');
                target?.focus({ preventScroll: false });
            }),
        );
    },

    closeLocalization() {
        const kind = this.localizationPanel;
        if (!kind) return;

        this.localizationPanel = '';
        this.localizationQuery = '';
        this.localizationEmpty = false;
        this.$nextTick(() => {
            this.$root
                .querySelector(`[data-localization-trigger="${kind}"]`)
                ?.focus({ preventScroll: true });
        });
    },

    matchesLocalization(item) {
        const query = this.localizationQuery.trim().toLowerCase();
        if (!query) return true;
        return (item?.dataset.filterText || '').includes(query);
    },

    _localizationPanelEl(kind) {
        return this.$root.querySelector(`[data-localization-panel="${kind}"]`);
    },

    _syncLocalizationEmpty() {
        const panel = this._localizationPanelEl(this.localizationPanel);
        if (!panel) {
            this.localizationEmpty = false;
            return;
        }
        const items = Array.from(panel.querySelectorAll('[data-filter-text]'));
        this.localizationEmpty =
            items.length > 0 && !items.some((item) => this.matchesLocalization(item));
    },
}));
