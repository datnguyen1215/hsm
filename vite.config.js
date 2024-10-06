import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/hsm.js',
      name: 'hsm',
      fileName: format => `hsm.${'js'}`,
      formats: ['es']
    },
    sourcemap: true,
    minify: false
  }
});
