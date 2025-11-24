import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProd = process.env.NODE_ENV === 'production'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ['framer-motion', 'recharts', 'lucide-react', 'react-hot-toast', 'wagmi', 'viem'],
  },
  esbuild: {
    drop: isProd ? ['console', 'debugger'] : [],
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
          wagmi: ['wagmi', 'viem'],
          ui: ['lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
})
