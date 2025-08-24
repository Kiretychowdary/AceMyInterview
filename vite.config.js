import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://acemyinterview.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        headers: {
          'X-RapidAPI-Key': 'li690033ea2mshd19e1cbf16ab7e6p15099ajsnb73c9a715dc5',
          'X-RapidAPI-Host': 'acemyinterview.onrender.com'
        }
      }
    }
  }
})
