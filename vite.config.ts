import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  // '/' par défaut (AI Studio, local). GitHub Pages fournit VITE_BASE=/<depot>/ (voir .github/workflows).
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    // HMR is disabled in AI Studio via DISABLE_HMR env var. Do not modify.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: { chunkSizeWarningLimit: 2000 },
}));
