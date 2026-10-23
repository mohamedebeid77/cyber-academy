import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config';

// Classic-script (IIFE) build so the bundle can execute inside jsdom for smoke tests.
export default mergeConfig(
  base,
  defineConfig({
    build: {
      outDir: 'dist-smoke',
      minify: false,
      rollupOptions: {
        output: {
          format: 'iife',
          inlineDynamicImports: true,
          entryFileNames: 'assets/bundle.js',
          // single-file IIFE build: no manual chunking possible
          manualChunks: undefined
        }
      }
    }
  })
);
