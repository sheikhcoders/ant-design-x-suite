import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      external: ['crypto', 'stream', 'fs', 'path', 'os', 'zlib', 'node:crypto', 'node:fs', 'node:path'],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});