import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 8080,
    proxy: {
      '/api': {
        // In Docker Compose, use service name 'server'; for local dev, use localhost
        target: process.env.API_URL || 'http://server:3001',
        changeOrigin: true,
      },
    },
  },
})
