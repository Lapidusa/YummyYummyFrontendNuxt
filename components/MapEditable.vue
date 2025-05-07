<script setup lang="ts">
  import L from 'leaflet'
  import 'leaflet-draw'
  import { onMounted } from 'vue'
  import type {Store} from "@interfaces/store";

  const props = defineProps<{
    coords: [number, number]
    zoom: number
    storeItems?: Store[] | Store
  }>()

  const map = ref<L.Map>()
  const emit = defineEmits<{
      (e: 'update:storeItems', value: Partial<Store[]>): void
    }>()
  const drawnItems = new L.FeatureGroup()
  function emitUpdate(stores: Store[]) {
    emit('update:storeItems', structuredClone(stores))
  }

  watch(() => props.storeItems, () => {
    renderStoreItems(props.storeItems)
  }, { deep: true, immediate: true })

  function renderStoreItems(data: Store[] | Store | undefined) {
    if (!map.value || !data) return

    const stores = Array.isArray(data) ? data : [data]

    drawnItems.eachLayer((layer: any) => {
      if ((layer as any).editing && (layer as any).editing.enabled()) {
        (layer as any).editing.disable()
      }
    })

    drawnItems.clearLayers()

    for (const store of stores) {
      if (!store || !store.point || store.point.length !== 2) continue;

      const [lat, lng] = store.point.map(Number)

      if (typeof lat !== 'number' || typeof lng !== 'number') continue;

      const marker = L.marker([lat, lng], { draggable: true })
       marker.on('moveend', () => {
         if (map.value && map.value.hasLayer(marker)) {
           const updatedLatLng = marker.getLatLng()
           store.point = [updatedLatLng.lat, updatedLatLng.lng]
           emitUpdate([store])
        }
      })
      drawnItems.addLayer(marker);

      if (Array.isArray(store.area) && store.area.length) {
        const polygon = L.polygon(store.area.map(p => [p[0], p[1]]), {
          color: 'blue',
          fillOpacity: 0.2
        });
        polygon.on('edit', () => {
          const latlngs = polygon.getLatLngs() as L.LatLng[][]
          store.area = latlngs[0].map(p => [p.lat, p.lng])
          emitUpdate([store])
        })
        drawnItems.addLayer(polygon);
      }
    }
  }

  onMounted(() => {
    const m = L.map('map').setView(props.coords, props.zoom)
    map.value = m

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(m)

    m.addLayer(drawnItems)

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        poly: {
          allowIntersection: false,
        },
      } as any,
      draw: {
        polygon: true,
        marker: true,
        circle: false,
        rectangle: false,
        polyline: false,
        circlemarker: false,
      } as any,
    })

    m.addControl(drawControl)

    m.on(L.Draw.Event.CREATED, function (event: any) {
      let hasMarker = false
      let hasPolygon = false

      drawnItems.eachLayer(layer => {
        if (layer instanceof L.Marker) hasMarker = true
        if (layer instanceof L.Polygon) hasPolygon = true
      })

      const isMarker = event.layer instanceof L.Marker
      const isPolygon = event.layer instanceof L.Polygon

      if ((isMarker && hasMarker) || (isPolygon && hasPolygon)) {
        alert('Можно добавить только 1 маркер и 1 полигон')
        return
      }
      drawnItems.addLayer(event.layer)
      const store = Array.isArray(props.storeItems) ? props.storeItems[0] : props.storeItems
      if (!store) return

      if (isMarker) {
        const latlng = event.layer.getLatLng()
        store.point = [latlng.lat, latlng.lng]
      } else if (isPolygon) {
        const latlngs = event.layer.getLatLngs() as L.LatLng[][]
        store.area = latlngs[0].map(p => [p.lat, p.lng])
      }

      emitUpdate([store])
    })
    m.on(L.Draw.Event.DELETED, function (event: any) {
    const store = Array.isArray(props.storeItems) ? props.storeItems[0] : props.storeItems
    if (!store) return

    event.layers.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        store.point = [0, 0]
      } else if (layer instanceof L.Polygon) {
        store.area = []
      }
    })

    emitUpdate([store])
  })

    renderStoreItems(props.storeItems)
  })

</script>

<template>
  <div id="map" class="w-full h-[600px] rounded-xl shadow-lg" />
</template>

<style scoped>
/* Чтобы правильно отображался курсор в leaflet-draw */
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>
