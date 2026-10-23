import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages deploys under the repo subpath: the deploy workflow sets
// PAGES_BASE=/cyber-academy/ before building. Local dev and plain builds stay at '/'.
export default defineConfig({
  plugins: [react()],
  base: process.env.PAGES_BASE || '/',
  server: { port: 5173 },
  build: { chunkSizeWarningLimit: 1500 }
});
