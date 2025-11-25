import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://launch.meme',
        changeOrigin: true,
        secure: true,
      },
      '/connection/websocket': {
        target: 'wss://launch.meme',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
})
