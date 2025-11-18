// /NMKRSVPLIDATAPERMANENT
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ MINIMAL CONFIG - Vercel Build Fix
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
