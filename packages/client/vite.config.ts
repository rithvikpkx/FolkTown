import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: new URL('index.html', import.meta.url).pathname,
        facades: new URL('facades.html', import.meta.url).pathname,
      },
    },
  },
});
