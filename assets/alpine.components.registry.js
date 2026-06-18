(function () {
    'use strict';

    const Theme = window.__Theme__;
    if (!Theme?.AlpineComponents || !Theme?.AlpineComponentGroups) return;

    const groups = Theme.AlpineComponentGroups;

    Object.assign(
        Theme.AlpineComponents,
        groups.ui,
        groups.header,
        groups.pagination,
        groups.filters,
        groups.product,
        groups.productMedia,
        groups.productCards,
        groups.search,
        groups.overlays,
    );
})();
