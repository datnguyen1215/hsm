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
