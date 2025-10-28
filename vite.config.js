// /NMKRSVPLIDATAPERMANENT
//      "react-dom": "^18.2.0",
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite sometimes fails to resolve package entry points for certain packages
// (e.g. on Vercel). Add a defensive alias for `react-router` so the resolver
// finds a concrete file inside node_modules when bundling for production.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Use the compiled ESM entry from the package's dist folder which matches
      // the `module` field in react-router's package.json. This avoids pointing
      // at a non-existent `index.js` file.
      { find: 'react-router', replacement: path.resolve(__dirname, 'node_modules/react-router/dist/index.js') }
    ]
  }
})
