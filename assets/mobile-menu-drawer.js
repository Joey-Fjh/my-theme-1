import { define } from 'alpine-adapter';

define('mobileMenuDrawer', () => ({
    activeTopIndex: -1,
    thirdLevelParentTitle: '',
    thirdLevelLinks: [],

    init() {
        const menu = this.$refs.topMenu;
        if (!menu) return;

        const firstWithChildren = Array.from(menu.children).findIndex(
            (item) => item.dataset.hasChildren === 'true',
        );
        this.activeTopIndex = firstWithChildren >= 0 ? firstWithChildren : -1;
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
}));
