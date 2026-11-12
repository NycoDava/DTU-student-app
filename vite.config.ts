import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { LINKS } from './src/config/links'

// The DTU Smart Library API sends no CORS headers, so the browser cannot call it directly.
// The dev server (and `vite preview`) forwards /api/smartlibrary to it. See src/data/library.ts.
// /api/local/* goes to the local DTU data server (server/index.js, 127.0.0.1 only). If it is not running,
// the app falls back to the demo data. A static build has no proxy, so it is always in demo mode.
const proxy = {
  '/api/smartlibrary': { target: LINKS.smartLibrary, changeOrigin: true, secure: true },
  '/api/local': {
    target: 'http://127.0.0.1:8787',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/local/, '/api'),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})
