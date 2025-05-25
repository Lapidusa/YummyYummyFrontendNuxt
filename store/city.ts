import {defineStore} from "pinia";
import type {City} from "@interfaces/city";

export const useCityStore = defineStore('city', {
  state: () => ({
    city: null as City | null,
  }),
  actions: {
    setCity(city: City) {
      this.city = city
      localStorage.setItem("city", JSON.stringify(city))
    },
    clearCity() {
      this.city = null
    },
    initCityFromStorage() {
      let cityRaw = localStorage.getItem("city");
       if (cityRaw !== 'undefined' && cityRaw !== null) {
         this.city = JSON.parse(cityRaw);
      }
    }
  }
})
