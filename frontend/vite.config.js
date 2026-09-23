import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MapLibre's worker is an ES module, so build it as one.
  worker: { format: 'es' },
  build: {
    // MapLibre alone is about 1 MB minified. It already lives in its own
    // lazy-loaded chunk (see App.jsx), so the default 500 kB warning is noise.
    chunkSizeWarningLimit: 1400,
  },
})
