import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // убрали .wasm
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js']
      },
      manifest: {
        name: 'Blog Platform',
        short_name: 'BlogApp',
        description: 'Социальная платформа для блогов',
        theme_color: '#4267B2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})