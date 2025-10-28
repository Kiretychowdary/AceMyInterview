// /NMKRSVPLIDATAPERMANENT
// vite.config.js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-router', 'react-router-dom'],
  },
  build: {
    commonjsOptions: {
      include: [/react-router/, /node_modules/],
    },
  },
})
