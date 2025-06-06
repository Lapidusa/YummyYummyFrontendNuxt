<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
  import 'leaflet/dist/leaflet.css'
  import 'leaflet-draw/dist/leaflet.draw.css'
  import L from 'leaflet'
  import type {Store} from "@interfaces/store";
  import type {City} from "@interfaces/city";

  const props = defineProps<{
    city: City
    zoom: number
    storeItems?: Store[] | Store
  }>()

  const map = ref<L.Map>()
  const drawnItems = new L.FeatureGroup()

  watch(() => props.city, (newCoords) => {
    if (map.value && Array.isArray(newCoords.point) && newCoords.point.length === 2) {
      map.value.setView([newCoords.point[1],newCoords.point[0]], props.zoom) //setView на flyTo если мягко
    }
  })

  watch(() => props.storeItems, () => {
    renderStoreItems(props.storeItems)
  }, { deep: true })


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

      const popupContent = `
        <div>
          <strong>${store.address}</strong>
          <p style="margin: 0">+${store.phone_number}</p>
          <button class="goto-store" data-id="${store.id}" style="color:orange;text-decoration:underline;background:none;border:none;padding:0;margin-top:4px;cursor:pointer;">
            Перейти к магазину
          </button>
        </div>
      `
      const pizzaIcon = L.icon({
        iconUrl: '/icons/pizza.svg', // путь к файлу
        iconSize: [30, 40],          // размер иконки
        iconAnchor: [15, 40],        // точка "основания" маркера
        popupAnchor: [0, -40],       // отступ попапа
      })

      const marker = L.marker([lat, lng], {
        draggable: false,
        icon: pizzaIcon
      })
      marker.on('moveend', () => {
        if (map.value && map.value.hasLayer(marker)) {
          const updatedLatLng = marker.getLatLng()
          store.point = [updatedLatLng.lat, updatedLatLng.lng]
        }
      })
      marker.bindPopup(popupContent)
      drawnItems.addLayer(marker);

      if (Array.isArray(store.area) && store.area.length) {
        const polygon = L.polygon(store.area.map(p => [p[0], p[1]]), {
          color: 'orange',
          fillOpacity: 0.2
        });
        polygon.on('edit', () => {
          const latlngs = polygon.getLatLngs() as L.LatLng[][]
          store.area = latlngs[0].map(p => [p.lat, p.lng])
        })
        polygon.bindPopup(popupContent)
        drawnItems.addLayer(polygon);
      }
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
            navigateTo(`/admin/cities/${props.city.id}/stores/${id}/categories`)
          }
        })
      }
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(m)

    m.addLayer(drawnItems)

    renderStoreItems(props.storeItems)
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

