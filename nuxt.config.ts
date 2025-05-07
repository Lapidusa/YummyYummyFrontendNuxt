import { resolve } from 'path'

export default defineNuxtConfig({
  ssr: true,
  alias: {
    '@': resolve(__dirname, './'),
    '@lib': resolve(__dirname, 'lib'),
    '@assets': resolve(__dirname, 'assets'),
    '@fonts': resolve(__dirname, 'assets/fonts'),
    '@icons': resolve(__dirname, 'assets/icons'),
    '@styles': resolve(__dirname, 'assets/styles'),
    '@components': resolve(__dirname, 'components'),
    '@store': resolve(__dirname, 'store'),
    '@composable': resolve(__dirname, 'composable'),
    '@interfaces': resolve(__dirname, 'interfaces'),
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  typescript: {
    strict: true,
    shim: false,
  },

  devtools: { enabled: true },
  css: ['@/assets/styles/main.scss',
    'leaflet/dist/leaflet.css',
    'leaflet-draw/dist/leaflet.draw.css',],

  runtimeConfig: {
    public: {
      serverUrl: process.env.SERVER_URL,
      mapAPI: process.env.API_KEY_YANDEX,
    }
  },
  compatibilityDate: '2025-04-27',
})