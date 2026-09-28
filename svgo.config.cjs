module.exports = {
    multipass: true,
    plugins: [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeTitle',
        'removeDesc',
        {
            name: 'removeAttrs',
            params: {
                attrs: ['fill', 'stroke', 'width', 'height', 'style', 'class', 'id', 't', 'p-id'],
            },
        },
        {
            name: 'removeViewBox',
            active: false,
        },
        {
            name: 'addAttributesToSVGElement',
            params: {
                attributes: [
                    { fill: 'currentColor' },
                    { 'aria-hidden': 'true' },
                    { focusable: 'false' },
                ],
            },
        },
        'convertPathData',
    ],
};
