<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
  import 'leaflet/dist/leaflet.css'
  import 'leaflet-draw/dist/leaflet.draw.css'
  import type {Store} from "@interfaces/store";
  const props = defineProps<{
    coords: [number, number]
    zoom: number
    storeItems?: Store[] | Store
  }>()

  const { $L } = useNuxtApp()
  const L = $L as typeof import('leaflet')
  const map = ref<L.Map>()
  const drawnItems = new L.FeatureGroup()

  watch(() => props.coords, (newCoords: any) => {
    if (map.value && newCoords) {
      map.value.setView(newCoords, map.value.getZoom())
    }
  })
  watch(() => props.storeItems, () => {
    renderStoreItems(props.storeItems)
  }, { deep: true })


  function renderStoreItems(data: Store[] | Store | undefined) {
    if (!map.value || !data) return

    drawnItems.clearLayers()

    const stores = Array.isArray(data) ? data : [data]

    for (const store of stores) {
      if (!store || !store.point || store.point.length !== 2) continue;

      const [lat, lng] = store.point.map(Number)

      if (typeof lat !== 'number' || typeof lng !== 'number') continue;

      const marker = L.marker([lat, lng]);

      drawnItems.addLayer(marker);

      if (Array.isArray(store.area) && store.area.length) {
        const polygon = L.polygon(store.area.map(p => [p[0], p[1]]), {
          color: 'yellow',
          fillOpacity: 0.8
        });
        drawnItems.addLayer(polygon);
      }
    }
  }
  onMounted(() => {
    map.value = L.map('map').setView(props.coords, props.zoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.value!)

    map.value.addLayer(drawnItems)
    // nextTick(() => {
    //   map.value!.invalidateSize()
    // })
    setTimeout(() => {
    if (map.value) {
      map.value.invalidateSize()
    }
  }, 300)
  })
</script>

<style lang="sass">
#map
  @apply w-full min-h-52 flex-auto

.leaflet-pane
  z-index: 0 !important

.leaflet-top, .leaflet-control
  z-index: 10 !important

</style>

