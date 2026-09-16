import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Dev: forward API calls to the local Express backend.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
