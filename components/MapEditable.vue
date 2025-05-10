<script setup lang="ts">
  import L from 'leaflet'
  import 'leaflet-draw'
  import { onMounted } from 'vue'
  import type {Store} from "@interfaces/store";
  import type {City} from "@interfaces/city";

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

  const drawnItems = new L.FeatureGroup()

  const drawnDisplayItems = new L.FeatureGroup()
  const drawnEditableItems = new L.FeatureGroup()

  function emitUpdate(stores: Store[]) {
    emit('update:storeItems', structuredClone(stores))
  }

  watch(() => props.displayStores, renderStoreItems, { deep: true, immediate: true })
  watch(() => props.editableStore, renderStoreItems, { deep: true, immediate: true })

  const pizzaIcon = L.icon({
        iconUrl: '/icons/pizza.svg', // путь к файлу
        iconSize: [30, 40],               // размер иконки
        iconAnchor: [15, 40],             // точка "основания" маркера
        popupAnchor: [0, -40],            // отступ попапа
      })

  function renderStoreItems() {
    if (!map.value) return

    drawnDisplayItems.clearLayers()
    drawnEditableItems.clearLayers()

    // Только отображаемые магазины
    for (const store of props.displayStores || []) {
      if (!store.point || store.point.length !== 2) continue
      const [lat, lng] = store.point.map(Number)

      const popupContent = `
        <div>
          <strong>${store.address}</strong>
          <p style="margin: 0">+${store.phone_number}</p>
          <button class="goto-store" data-id="${store.id}" style="color:orange;text-decoration:underline;background:none;border:none;padding:0;margin-top:4px;cursor:pointer;">
            Перейти к магазину
          </button>
        </div>
      `

      const marker = L.marker([lat, lng], {
        draggable: false,
        icon: pizzaIcon
      })
      marker.bindPopup(popupContent)
      drawnDisplayItems.addLayer(marker)

      if (Array.isArray(store.area) && store.area.length) {
        const polygon = L.polygon(store.area.map(p => [p[0], p[1]]), {
          color: '#888',
          fillOpacity: 0.1,
        })
        polygon.bindPopup(popupContent)
        drawnDisplayItems.addLayer(polygon)
      }
    }

    // Редактируемый магазин
    const store = props.editableStore
    if (store && store.point && store.point.length === 2) {
      const [lat, lng] = store.point.map(Number)

      const marker = L.marker([lat, lng], {
        draggable: false,
        icon: pizzaIcon
      })
      marker.on('moveend', () => {
        const latlng = marker.getLatLng()
        store.point = [latlng.lat, latlng.lng]
        emitUpdate([store])
      })
      drawnEditableItems.addLayer(marker)
    }

    if (store && Array.isArray(store.area) && store.area.length) {
      const polygon = L.polygon(store.area.map(p => [p[0], p[1]]), {
        color: 'orange',
        fillOpacity: 0.3,
      })
      polygon.on('edit', () => {
        const latlngs = polygon.getLatLngs() as L.LatLng[][]
        store.area = latlngs[0].map(p => [p.lat, p.lng])
        emitUpdate([store])
      })
      drawnEditableItems.addLayer(polygon)
    }
  }


  onMounted(() => {
    const m = L.map('map', { attributionControl:false }).setView([props.city.point[1],props.city.point[0]], props.zoom)
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
    if (drawControl.value) {
      map.value?.removeControl(drawControl.value)
    }
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
