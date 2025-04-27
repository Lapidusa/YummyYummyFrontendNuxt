import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

// ТАЩИМ сам Leaflet
import L from 'leaflet'
// И ЯВНО подключаем leaflet-draw
import 'leaflet-draw'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('L', L)
})
