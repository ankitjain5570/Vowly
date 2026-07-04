import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        '**/Photobook/**',
        '**/Couple Photos/**',
        '**/Couple Avatars/**',
        '**/Sample Videos/**',
        '**/Audio File/**',
      ],
    },
  },
})
