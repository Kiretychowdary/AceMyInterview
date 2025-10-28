// /NMKRSVPLIDATAPERMANENT
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Compatible with React Router v6.30+ and Vercel builds
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      // explicitly force Vite to use proper router paths
      'react-router': 'react-router/index.js',
      'react-router-dom': 'react-router-dom/index.js'
    }
  },
  optimizeDeps: {
    include: ['react-router', 'react-router-dom']
  },
  build: {
    rollupOptions: {
      // 🧩 prevent bundling issues with ESM resolution
      external: ['react-router']
    }
  }
})
