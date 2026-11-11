import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { LINKS } from './src/config/links'

// The DTU Smart Library API sends no CORS headers, so the browser cannot call it directly.
// The dev server (and `vite preview`) forwards /api/smartlibrary to it. See src/data/library.ts.
const proxy = {
  '/api/smartlibrary': { target: LINKS.smartLibrary, changeOrigin: true, secure: true },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})
