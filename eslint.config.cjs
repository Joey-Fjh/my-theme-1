const compat = require('eslint-plugin-compat');
const globals = require('globals');

module.exports = [
    {
        ignores: ['assets/vendor-*.js', 'assets/*.min.js'],
    },
    {
        ...compat.configs['flat/recommended'],
        files: ['assets/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                Alpine: 'readonly',
                QRCode: 'readonly',
                Shopify: 'readonly',
                Swiper: 'readonly',
            },
        },
        settings: {
            lintAllEsApis: true,
        },
    },
];
