import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

import * as L from 'leaflet'
import 'leaflet-draw'

export default defineNuxtPlugin(() => ({
  provide: {
    L
  }
}))
