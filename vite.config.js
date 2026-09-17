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
        name: 'JurisLeo',
        short_name: 'JurisLeo',
        description: 'Organização académica para a Licenciatura em Direito',
        lang: 'pt-PT',
        theme_color: '#6B0F1A',
        background_color: '#FAF8F5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // cacheia o essencial da app para abrir mesmo sem rede;
        // os dados em si (firestore) ficam a cargo da cache do próprio sdk
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    // restringe o vitest ao código do projeto — sem isto ele também percorre
    // pastas fora do projeto (ex: repos/ de outras ferramentas) à procura de testes
    include: ['src/**/*.test.{js,jsx}'],
  },
})
