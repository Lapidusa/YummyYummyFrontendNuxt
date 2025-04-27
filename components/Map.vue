<template>
  <div id="map" style="height: 600px;"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

const { $L } = useNuxtApp()

onMounted(() => {
  const mapElement = document.querySelector('#map')
  document.addEventListener('click', (event) => {
    mapElement.classList.toggle('is-active', event.target === mapElement)
  })
  const map = $L.map('map').setView([55.751244, 37.618423], 10) // Москва, чтобы как в Яндексе

  $L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  // Инициализация слоя для отрисовки
  const drawnItems = new $L.FeatureGroup()
  map.addLayer(drawnItems)

  // Инициализация панели инструментов
  const drawControl = new $L.Control.Draw({
    edit: {
      featureGroup: drawnItems
    },
    draw: {
      polygon: true,
      polyline: true,
      rectangle: true,
      circle: true,
      marker: true
    }
  })
  map.addControl(drawControl)

  // Событие когда пользователь нарисовал что-то
  map.on($L.Draw.Event.CREATED, (event) => {
    const layer = event.layer
    drawnItems.addLayer(layer)
  })
})
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
}
#map:not(.is-active) *{
  pointer-events: none;
}
</style>
