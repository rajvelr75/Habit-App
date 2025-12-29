import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Habit Productivity App',
        short_name: 'Habits',
        description: 'Personal habit tracking and analytics',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg', // Browsers that support SVG
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
          },
          // Ideally we would have PNGs here too, but for this automated task SVG is safest fallback.
          // Requires user to manually generate PNGs for full support on iOS/Android.
        ]
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
