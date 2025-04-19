// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineNuxtConfig({

  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  css: ['@/assets/styles/main.scss'],

  alias: {
    '@': resolve(__dirname, './'),
    '@assets': resolve(__dirname, 'assets'),
    '@fonts': resolve(__dirname, 'assets/fonts'),
    '@icons': resolve(__dirname, 'assets/icons'),
    '@styles': resolve(__dirname, 'assets/styles'),
    '@components': resolve(__dirname, 'components'),
    '@store': resolve(__dirname, 'store'),
    '@composable': resolve(__dirname, 'composable'),
    '@interfaces': resolve(__dirname, 'interfaces'),
  },

  runtimeConfig: {
    public: {
      serverUrl: process.env.SERVER_URL
    }
  },
  vite: {
    plugins: [tsconfigPaths()]
  }
})
