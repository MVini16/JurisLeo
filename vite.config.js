/* global process */
import { readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { NOVIDADES, VERSAO_ATUAL } from './src/data/novidades.js'

// escreve /versao.json no build, para a app instalada saber que há uma versão nova (ver src/services/atualizacao.js)
function versaoDaApp() {
  return {
    name: 'versao-da-app',
    generateBundle() {
      const { titulo, itens } = NOVIDADES[0]
      this.emitFile({ type: 'asset', fileName: 'versao.json', source: JSON.stringify({ versao: VERSAO_ATUAL, titulo, itens }) })
    },
  }
}

// a página-surpresa (public/s/) usa gsap (e plugins), three, anime.js e lenis: copia-os do node_modules para a pasta dela no build, para não os guardar no repositório
function copiarBibliotecasDaSurpresa() {
  const ficheiros = [
    ['gsap.min.js', 'node_modules/gsap/dist/gsap.min.js'],
    ['ScrollTrigger.min.js', 'node_modules/gsap/dist/ScrollTrigger.min.js'],
    ['three.module.min.js', 'node_modules/three/build/three.module.min.js'],
    ['anime.min.js', 'node_modules/animejs/lib/anime.min.js'],
    ['SplitText.min.js', 'node_modules/gsap/dist/SplitText.min.js'],
    ['ScrambleTextPlugin.min.js', 'node_modules/gsap/dist/ScrambleTextPlugin.min.js'],
    ['DrawSVGPlugin.min.js', 'node_modules/gsap/dist/DrawSVGPlugin.min.js'],
    ['MotionPathPlugin.min.js', 'node_modules/gsap/dist/MotionPathPlugin.min.js'],
    ['Physics2DPlugin.min.js', 'node_modules/gsap/dist/Physics2DPlugin.min.js'],
    ['lenis.min.js', 'node_modules/lenis/dist/lenis.min.js'],
  ]
  return {
    name: 'copiar-bibliotecas-surpresa',
    generateBundle() {
      for (const [nome, origem] of ficheiros) {
        this.emitFile({ type: 'asset', fileName: `s/titsvdzkihyi/${nome}`, source: readFileSync(origem) })
      }
    },
  }
}

// sem as chaves do firebase no .env o build sai com a app em branco: melhor falhar já aqui, com a explicação
function exigirChavesDoFirebase() {
  return {
    name: 'exigir-chaves-do-firebase',
    configResolved(config) {
      if (config.command !== 'build') return
      const env = { ...loadEnv(config.mode, config.root, 'VITE_'), ...process.env }
      const em_falta = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'].filter((k) => !env[k])
      if (em_falta.length > 0) {
        throw new Error(`Faltam no ficheiro .env: ${em_falta.join(', ')}. Sem isto a app publicada fica em branco. Copia o .env do outro computador (modelo em .env.example).`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    versaoDaApp(),
    exigirChavesDoFirebase(),
    copiarBibliotecasDaSurpresa(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'JurisLeo',
        short_name: 'JurisLeo',
        description: 'Organização académica para a Licenciatura em Direito',
        lang: 'pt-PT',
        theme_color: '#6B0F1A',
        background_color: '#FAF8F5',
        display: 'standalone',
        start_url: '/',
        // png para o iphone e o android (o iOS ignora ícones svg no ecrã principal); o desenho cabe na zona segura dos maskable
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // cacheia o essencial da app para abrir mesmo sem rede;
        // os dados em si (firestore) ficam a cargo da cache do próprio sdk
        globPatterns: ['**/*.{js,css,html,svg}'],
        // a página-surpresa (public/s/) não entra na cache da app nem é apanhada pelo fallback das rotas
        globIgnores: ['s/**'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/s\//],
        // as notificações push (public/push-sw.js)
        importScripts: ['push-sw.js'],
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
