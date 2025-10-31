// /NMKRSVPLIDATAPERMANENT
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ✅ PERMANENT FIX for React Router + Vercel builds
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle react-router resolution
    {
      name: 'resolve-react-router',
      resolveId(source) {
        if (source === 'react-router') {
          return this.resolve('react-router-dom')
        }
        return null
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom']
        }
      }
    }
  }
})
