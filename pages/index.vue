<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { useCategory } from "@composable/useCategory"
import type { Store } from "@interfaces/store"
import { useCityStore } from "@store/city"
import type {City} from "@interfaces/city";

const storeCity = useCityStore()
const activeCity = computed(() => {storeCity.city})
const store = ref<Store>()
const city = ref<City>()
const UseCategory = useCategory()

const initialData = async (storeId: string) => {
  const res = await UseCategory.getCategoryByStoreId(storeId)
  // сюда можно добавить сохранение результата или другие действия
}

// Вызов при монтировании компонента
onMounted(() => {
  if (storeCity.city?.id) {
    city.value = storeCity.city
    initialData(storeCity.city.id)
  }
})

watch(
    () => storeCity.city,
    (newCity) => {
      if (newCity?.id) {
        city.value = newCity
        initialData(newCity.id)
      }
    },
    { immediate: false, deep: true }
)
</script>


<template>
  <Header />
  <main class="main">
    <div class="main__container">

    </div>
  </main>
</template>
<style lang="sass">
.main
  @apply w-full
</style>
