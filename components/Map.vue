<template>
  <div id="map" style="width:100%; height: calc(100% - 50px);"></div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
const props = defineProps<{
  edit: boolean
  coords?: [number, number]
  zoom?: number
}>()

const { $L } = useNuxtApp()
const L = $L as typeof import('leaflet')
const map = ref<L.Map>()
onMounted(() => {
  // const mapElement = document.querySelector('#map')
  // document.addEventListener('click', (event) => {
  //   mapElement.classList.toggle('is-active', event.target === mapElement)
  // })
  map.value = L.map('map').setView(props.coords!, props.zoom!)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value!)

  const drawnItems = new L.FeatureGroup()
  map.value.addLayer(drawnItems)

  if(props.edit) {
   const drawControl = new L.Control.Draw({
    edit: {
      featureGroup: drawnItems
    },
    draw: {
      polygon: true,
      marker: true
    }
  })
  map.value.addControl(drawControl)

  map.value.on(L.Draw.Event.CREATED, (event:any) => {
    const layer = event.layer
    drawnItems.addLayer(layer)
  })
  }
})
watch(() => props.coords, (newCoords: any) => {
  if (map.value && newCoords) {
    map.value.setView(newCoords, map.value.getZoom())
  }
})
</script>

<style>
#map {
  border-radius: 12px;
}
/*#map:not(.is-active) *{
  pointer-events: none;
}*/
.leaflet-pane{
  z-index: 0 !important;
}
.leaflet-top, .leaflet-control {
  z-index: 10 !important;
}
</style>
