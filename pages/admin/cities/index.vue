<script setup lang="ts">
  import {useCityStore} from "@store/city";
  import {type City, CityFieldLabels} from "@interfaces/city";
  import {useCity} from "@composable/useCity";
  import {useStore} from "@composable/useStore";
  import type {Store} from "@interfaces/store";
  import {validateEmptyFieldsByLabels} from "@/utils/validators";
  import CloseIcon from "@components/icons/closeIcon.vue";

  const MapVisible = defineAsyncComponent(() =>
    process.client ? import('@components/maps/MapVisible.vue') : Promise.resolve({})
  )

  const UseCity = useCity()
  const UseStore = useStore()
  const cityStore = useCityStore()
  const city = computed(() => cityStore.city)

  const allCities = ref<{ cities: City[] }>({ cities: [] })
  const activeCity = ref<City | null>()
  const storesByCity = ref<Store[]>([])
  const editableCity = ref<Partial<City>>({ name: '' })

  const error = ref<string>('')
  const searchTerm = ref<string>('');

  const modalModeCity = ref<'none' | 'select' | 'add' | 'edit'| 'delete'>('none')

  const visibleCities = computed(() => {
    const cities = allCities.value.cities.slice();

    cities.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    if (!searchTerm.value.length) return cities;

    const term = searchTerm.value.toLowerCase();
    return cities.filter(city => city.name.toLowerCase().includes(term));
  });

  const changeCity = async (id: string) => {
    const city = allCities.value.cities.find((city: { id: string; name: string})  => city.id === id);

    if (city) {
      activeCity.value = city
      modalModeCity.value = "none"
      cityStore.setCity(city);
      error.value = '';
      editableCity.value = {name: ''};
      await getStores(activeCity.value.id);
    }
  }

  const getStores = async (data: string) => {
    const res = await UseStore.getStoresByCityId(data);
    if (res.result) {
      storesByCity.value = res.stores
    }
  }

  function validateAndSetError(): boolean {
    const errorMessage = validateEmptyFieldsByLabels(editableCity.value, CityFieldLabels)
    if (errorMessage) {
      error.value = errorMessage
      return false
    }
    error.value = ''
    return true
  }

  const addCity = async () => {
    if (!validateAndSetError()) return

    const res = await UseCity.addCity({ name: editableCity.value.name });
    if (res.result) {
      modalModeCity.value = "none";
      allCities.value = await UseCity.getAllCities();
      cityStore.initCityFromStorage();
      activeCity.value = res.city;
      editableCity.value = {name: ''};
      error.value = '';
      activeCity.value = allCities.value.cities[allCities.value.cities.length - 1];
      cityStore.setCity(allCities.value.cities[allCities.value.cities.length - 1]);
    } else error.value = res.message;
  }

  const updateCity = async () => {
    if (!validateAndSetError()) return

    const res = await UseCity.addCity({ name: editableCity.value.name, id: activeCity.value?.id })
    if (res.result) {
      modalModeCity.value = "none"
      allCities.value = await UseCity.getAllCities()
      cityStore.initCityFromStorage()
      activeCity.value = city.value;
      editableCity.value = {name: ''};
      error.value = '';
    } else error.value = res.message;
  }

  const deleteCity = async () => {
    if (activeCity.value) {
      const res = await UseCity.deleteCity(activeCity.value.id)
      if (res.result) {
        modalModeCity.value = "none"
        allCities.value = await UseCity.getAllCities()
        activeCity.value = allCities.value.cities[0];
        cityStore.setCity(allCities.value.cities[0]);
        error.value = '';
      } else error.value = res.message;
    }
  }

  const openModal = (mode: typeof modalModeCity.value) => {
    modalModeCity.value = mode;
  }

  const closeModal = () => {
    modalModeCity.value = 'none';
    error.value = '';
  }

  watch(modalModeCity, (mode) => {
    if (mode === 'edit' && activeCity.value) {
      editableCity.value.name = activeCity.value.name;
    }
  })

  onMounted(async () => {
    allCities.value = await UseCity.getAllCities()
    cityStore.initCityFromStorage()
    activeCity.value = city.value;
    if (!activeCity.value) {
      activeCity.value = allCities.value.cities[0];
      cityStore.setCity(allCities.value.cities[0]);
    }
    if (activeCity.value) {
      await getStores(activeCity.value.id);
    }
  })
</script>

<template>
  <div class="wrapper">
    <div class="stores">
      <div class="city">
        <button class="city__btn" @click="openModal('select')">
          {{ activeCity?.name }}
        </button>

        <p v-if="Object.keys(allCities.cities).length === 0">Нет городов</p>

        <button class="city__btn city__btn--add" @click="openModal('add')">
          <img src="@assets/icons/plus.svg" alt="add" />
        </button>

        <template v-if="Object.keys(allCities.cities).length !== 0">
          <button class="city__btn city__btn--update" @click="openModal('edit')">
            <img src="@assets/icons/update.svg" alt="update" />
          </button>

          <button class="city__btn city__btn--delete" @click="openModal('delete')">
            <img src="@assets/icons/delete.svg" alt="delete" />
          </button>
        </template>
      </div>

      <div class="store" v-if="activeCity">
        <NuxtLink  :to="`/admin/cities/${activeCity.id}/stores`" class="store__btn--gradient">
          Магазины
        </NuxtLink>
      </div>
    </div>

    <MapVisible v-if="activeCity"
                :city="activeCity"
                :zoom="10"
                :store-items="storesByCity" class="map"/>
    <div
        v-if="modalModeCity !== 'none'"
        class="modal-city"
        id="static-modal"
        data-modal-backdrop="static"
        aria-hidden="true"
    >
      <div class="modal-city modal-city--active">
        <div class="modal-city__close cursor-pointer" @click="closeModal">
          <CloseIcon class="closeModal"/>
        </div>
        <div class="modal-city__container">
          <template v-if="modalModeCity === 'select'">
            <div class="modal-city__title">Выберите свой город</div>
            <div class="modal-city__search">
              <img class="modal-city__search-icon" src="@assets/icons/search.svg" alt="Search" />
              <input
                  type="search"
                  class="modal-city__search"
                  v-model.trim="searchTerm"
              />
              <button
                  v-if="searchTerm"
                  class="clear-button"
                  @click.prevent="searchTerm = ''"
              >
                <img
                    class="modal-city__search-clean"
                    src="@assets/icons/x-letter.svg"
                    alt="Clear Input"
                />
              </button>
            </div>
            <div class="modal-city__cities">
              <div
                  class="modal-city__city"
                  v-for="city in visibleCities"
                  :key="city.id"
              >
                <button @click="changeCity(city.id)" class="modal-city__text--hover">
                  {{ city.name }}
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="modalModeCity === 'add'">
            <div class="modal-city__title">Добавить город</div>
            <input
                type="text"
                v-model.trim="editableCity.name"
                placeholder="Введите название города"
            />
            <p class="text-red" v-if="error">{{error}}</p>
            <button class="modal-city__button--gradient" @click="addCity">Добавить</button>
          </template>

          <template v-else-if="modalModeCity === 'edit'">
            <div class="modal-city__title">Редактировать город</div>
            <input
                type="text"
                v-model.trim="editableCity.name"
                :placeholder="activeCity?.name || 'Введите новое название'"
            />
            <p class="text-red" v-if="error">{{error}}</p>
            <button @click="updateCity" class="modal-city__button--gradient">Обновить</button>
          </template>

          <template v-else-if="modalModeCity === 'delete'">
            <div class="modal-city__title">Удалить город {{activeCity?.name}}?</div>
            <p class="text-red" v-if="error">{{error}}</p>
            <div class="modal-city__button">
              <button @click="deleteCity" class="modal-city__button--gradient">Удалить</button>
              <button @click="closeModal" class="modal-city__button--outline">Отмена</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped lang="sass">
@use '@assets/styles/mixins' as *
.city
  @apply flex items-center gap-3

  &__btn
    @apply font-bold hover:text-orange duration-300 ease-in

    &:nth-child(n+2)
      @apply  p-1 hover:bg-white hover:rounded-full

.modal-city
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]

  &__container
    @apply flex flex-col gap-4

  &__title
    @apply text-2xl font-bold

  &--active

    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute top-1/2 left-1/2 shadow-lg p-6 w-fit h-fit z-50
  &__button
    @apply flex gap-2

    &--gradient
      @apply flex-1
      @include button-orange-gradient

    &--outline
      @include button-orange-outline
      @apply flex-1

  &__search
    @apply relative

    &-icon
      @apply absolute top-1/4 left-2 z-10

    &-clean
      @apply absolute top-1/4 right-2 z-10 fill-orange

.store
  @include button-orange-gradient

.stores
  @apply flex justify-between items-center pb-5

.wrapper
  @apply flex flex-col w-full
  height: calc(100vh - 40px)

.map
  @apply rounded-lg
.closeModal
  @apply absolute top-1 -right-10;
</style>
