module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['proposal-dynamic-import']
      }
    ]
  ],
  plugins: [
    ['@babel/transform-runtime'],
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
          '@dist': './dist'
        }
      }
    ]
  ]
};
