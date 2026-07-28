import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The API has no CORS policy and we are not touching it, so the dev server
// proxies /api straight through. Same-origin from the browser's point of view.
const API_TARGET = process.env.API_TARGET ?? 'http://localhost:5225'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
