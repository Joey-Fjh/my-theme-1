module.exports = {
  multipass: true,
  plugins: [
    'removeDoctype',
    'removeComments',
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'fill',
          'stroke',
          'width',
          'height',
          'style',
          'class'
        ]
      }
    },
    {
      name: 'removeViewBox',
      active: false
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { fill: 'currentColor' },
          { 'aria-hidden': 'true' },
          { focusable: 'false' }
        ]
      }
    },
    'convertPathData'
  ]
}
