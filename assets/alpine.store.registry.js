(function () {
    'use strict';

    const Theme = window.__Theme__;
    if (!Theme?.AlpineStores || !Theme?.AlpineStoreGroups) return;

    const groups = Theme.AlpineStoreGroups;

    Object.assign(Theme.AlpineStores, {
        toast: groups.toast,
        dialog: groups.dialog,
        cart: groups.cart,
    });
})();
