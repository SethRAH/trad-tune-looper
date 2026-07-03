import { defineConfig } from 'vite';

export default defineConfig({
  base: '/trad-tune-looper/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
