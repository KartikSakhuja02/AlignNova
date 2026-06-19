import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Output to frontend_dist/ at the project root so FastAPI can serve it
    outDir: '../frontend_dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy all /api/* requests to the FastAPI backend during local dev
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
