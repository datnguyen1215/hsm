import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/hsm.js',
      name: 'hsm',
      fileName: () => `hsm.${'js'}`,
      formats: ['es']
    },
    sourcemap: true,
    minify: false,
    terserOptions: {
      format: {
        comments: (_, comment) => {
          const { value, type } = comment;
          if (type === 'comment2') {
            // multiline comment
            // keep comments starting with '!'
            return /^!|@preserve|@license|@cc_on/i.test(value);
          }
        }
      }
    }
  }
});
