// /NMKRSVPLIDATAPERMANENT
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ✅ Compatible with React Router v6.30+ and Vercel builds
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      // map react-router-dom first (specific) to avoid regex collisions
      { find: 'react-router-dom', replacement: path.resolve(__dirname, 'node_modules/react-router-dom/dist/index.js') },
      // point react-router to the package dist ESM build
      { find: 'react-router', replacement: path.resolve(__dirname, 'node_modules/react-router/dist/index.js') }
    ]
  },
  optimizeDeps: {
    include: ['react-router', 'react-router-dom']
  }
})
