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
  <!-- «Прилипший» под шапкой див -->
  <div class="main__subheader container">
    <div class="main__categories">
      <div class="main_category" v-for="category in categories">

      </div>
    </div>
    <div class="main__cart">
      <button class="main__cart-btn btn--gradient">
        Корзина
      </button>
    </div>
  </div>

  <main class="main__container">
    <div class="main__container mt-96">
      sdlasd
    </div>
    <div class="main__container mt-96">
      sdlasd
    </div>
  </main>
</template>
<style lang="sass">
@use 'assets/styles/mixins' as *
.main
  padding: 34px

  &__subheader
    @apply sticky top-0 bg-white bg-opacity-10 backdrop-blur-2xl
    @apply flex justify-between

.container
  @apply p-[34px]

.btn--gradient
  @include button-orange-gradient
</style>
