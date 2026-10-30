const compat = require('eslint-plugin-compat');
const globals = require('globals');

module.exports = [
    {
        ignores: ['assets/vendor-*.js', 'assets/*.min.js'],
    },
    {
        ...compat.configs['flat/recommended'],
        files: ['assets/*.js'],
        ignores: ['assets/gift-card.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                QRCode: 'readonly',
                Shopify: 'readonly',
            },
        },
        settings: {
            lintAllEsApis: true,
        },
    },
    {
        ...compat.configs['flat/recommended'],
        files: ['assets/gift-card.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                QRCode: 'readonly',
            },
        },
        settings: {
            lintAllEsApis: true,
        },
    },
];
