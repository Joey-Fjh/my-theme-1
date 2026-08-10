const reviewedFeatureIgnores = [
    'css-resize',
    'css-scrollbar',
    'css3-cursors',
    'css3-cursors-grab',
    'css3-cursors-newer',
    'extended-system-fonts',
    'intrinsic-width',
    'multicolumn',
];

function compatibilityRule(ignore = reviewedFeatureIgnores) {
    return [
        true,
        {
            ignore,
            severity: 'error',
        },
    ];
}

module.exports = {
    plugins: ['stylelint-no-unsupported-browser-features'],
    rules: {
        'plugin/no-unsupported-browser-features': compatibilityRule(),
    },
    overrides: [
        {
            files: ['tailwind/*.css'],
            rules: {
                'plugin/no-unsupported-browser-features': compatibilityRule([
                    ...reviewedFeatureIgnores,
                    'css-clip-path',
                    'css-marker-pseudo',
                ]),
            },
        },
        {
            files: ['assets/tailwind.output.css'],
            rules: {
                'plugin/no-unsupported-browser-features': compatibilityRule([
                    ...reviewedFeatureIgnores,
                    'css-clip-path',
                    'css-display-contents',
                    'css-marker-pseudo',
                    'css-mixblendmode',
                    'css-text-indent',
                    'css-touch-action',
                    'text-decoration',
                ]),
            },
        },
    ],
};
