<script setup lang="ts">
import L from "leaflet";
import type {City} from "@interfaces/city";
import type {Store} from "@interfaces/store";
import {onMounted} from "vue";

const props = defineProps<{
  city: City
  zoom: number
  displayStores?: Store[]
  editableStore?: Store | null
}>()
const emit = defineEmits<{
  (e: 'update:storeItems', value: Partial<Store[]>): void
}>()
const map = ref<L.Map>()
const drawControl = ref<L.Control.Draw>()
const drawnDisplayItems = new L.FeatureGroup()
const drawnEditableItems = new L.FeatureGroup()
const pizzaIcon = L.icon({
  iconUrl: '/icons/pizza.svg', // путь к файлу
  iconSize: [30, 40],               // размер иконки
  iconAnchor: [15, 40],             // точка "основания" маркера
  popupAnchor: [0, -40],            // отступ попапа
})

function emitUpdate(stores: Store[]) {
  emit('update:storeItems', structuredClone(stores))
}

function renderStoreItems(){
  if (!map.value) return
}

onMounted(() => {
  const m = L.map('map', { attributionControl:false }).setView([props.city.point[1], props.city.point[0]], props.zoom)
  map.value = m

  map.value!.on('popupopen', function (e: any) {
    const button = e.popup.getElement().querySelector('.goto-store') as HTMLButtonElement
    if (button) {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id')
        if (id) {
          navigateTo(`/admin/cities/${props.city.id}/stores/${id}`)
        }
      })
    }
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(m)

  m.addLayer(drawnDisplayItems)
  m.addLayer(drawnEditableItems)

  m.on(L.Draw.Event.CREATED, function (event: any) {
    let hasMarker = false
    let hasPolygon = false

    drawnEditableItems.eachLayer(layer => {
      if (layer instanceof L.Marker) hasMarker = true
      if (layer instanceof L.Polygon) hasPolygon = true
    })

    const isMarker = event.layer instanceof L.Marker
    const isPolygon = event.layer instanceof L.Polygon

    if ((isMarker && hasMarker) || (isPolygon && hasPolygon)) {
      alert('Можно добавить только 1 маркер и 1 полигон')
      return
    }
    drawnEditableItems.addLayer(event.layer)
    const store = props.editableStore
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
    const store = props.editableStore
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

  renderStoreItems()
  drawControl.value = new L.Control.Draw({
    edit: {
      featureGroup: drawnEditableItems,
    },
    draw: {
      polygon: {},
      marker: {},
      circle: false,
      rectangle: false,
      polyline: false,
      circlemarker: false,
    },
  })
  map.value?.addControl(drawControl.value)
})
onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
  }
})

</script>

<template>
  <div id="map" class="w-full h-[600px] rounded-xl shadow-lg" />
</template>

<style scoped>
.leaflet-container {
  height: 100%;
  width: 100%;
}
</style>
