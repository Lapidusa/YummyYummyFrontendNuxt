<script setup lang="ts">
  import {useCityStore} from "@store/city";
  import type {City} from "@interfaces/city";
  import {useCity} from "@composable/useCity";
  const cityStore = useCityStore()
  const UseCity = useCity()
  const city = computed(() => cityStore.city)
  const allCities = ref<{ cities: City[] }>({ cities: [] })
  const searchTerm = ref<string>('');
  const activeCity = ref<City | null>(null)
  const editableCity = ref<Partial<City>>({ name: '' })
  const modalModeCity = ref<'none' | 'select' | 'add' | 'edit'| 'delete'>('none')

  const visibleCities = computed(()=>{
    if (!searchTerm.value.length) return allCities.value.cities
    const term = searchTerm.value.toLowerCase()

    return allCities.value.cities.filter((city) => (
      city.name.toLowerCase().includes(term)
    ));
  });

  const changeCity = (id: string) => {
    const city = allCities.value.cities.find((city: { id: string; name: string})  => city.id === id);
    if (city) {
      activeCity.value = city
      modalModeCity.value = "none"
      cityStore.setCity(city);
      editableCity.value = {name: ''};
    }
  }

  const addCity = async () => {
    if (activeCity.value) {
      const res = await UseCity.addCity({ name: editableCity.value.name })
      if (res.result) {
        modalModeCity.value = "none"
        allCities.value = await UseCity.getAllCity()
        cityStore.initCityFromStorage()
        activeCity.value = city.value;
        editableCity.value = {name: ''};
      }
    }
  }

  const updateCity = async () => {
    if (activeCity.value) {
      const res = await UseCity.addCity({ name: editableCity.value.name, id: activeCity.value.id })
      if (res.result) {
        modalModeCity.value = "none"
        allCities.value = await UseCity.getAllCity()
        cityStore.initCityFromStorage()
        activeCity.value = city.value;
        editableCity.value = {name: ''};
      }
    }
  }

  const deleteCity = async () => {
    if (activeCity.value) {
      const res = await UseCity.deleteCity(activeCity.value.id)
      if (res.result) {
        modalModeCity.value = "none"
        allCities.value = await UseCity.getAllCity()
        cityStore.initCityFromStorage()
        activeCity.value = allCities.value.cities[0];
      }
    }
  }

  const openModal = (mode: typeof modalModeCity.value) => {
    modalModeCity.value = mode;
  }

  const closeModal = () => {
    modalModeCity.value = 'none';
  }

  watch(modalModeCity, (mode) => {
    if (mode === 'edit' && activeCity.value) {
      editableCity.value.name = activeCity.value.name;
    }
  })

  onMounted(async () => {
    allCities.value = await UseCity.getAllCity()
    cityStore.initCityFromStorage()
    activeCity.value = city.value;
    if(activeCity.value) {

    }
  })
</script>

<template>
  <div class="city">
    <button class="city__btn" @click="openModal('select')">
      {{ activeCity?.name }}
    </button>

    <button class="city__btn city__btn--add" @click="openModal('add')">
      <img src="@assets/icons/plus.svg" alt="add" />
    </button>

    <button class="city__btn city__btn--update" @click="openModal('edit')">
      <img src="@assets/icons/update.svg" alt="update" />
    </button>

    <button class="city__btn city__btn--delete" @click="openModal('delete')">
      <img src="@assets/icons/delete.svg" alt="delete" />
    </button>
  </div>

  <div
    v-if="modalModeCity !== 'none'"
    class="modal-city"
    id="static-modal"
    data-modal-backdrop="static"
    aria-hidden="true"
  >
    <div class="modal-city modal-city--active">
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
        <button @click="addCity">Добавить</button>
      </template>

      <template v-else-if="modalModeCity === 'edit'">
        <div class="modal-city__title">Редактировать город</div>
        <input
          type="text"
          v-model.trim="editableCity.name"
          :placeholder="activeCity?.name || 'Введите новое название'"
        />
        <button @click="updateCity">Обновить</button>
      </template>

      <template v-else-if="modalModeCity === 'delete'">
        <div class="modal-city__title">Удалить город {{activeCity?.name}}?</div>
        <button @click="deleteCity">Удалить</button>
        <button @click="closeModal">Отмена</button>
      </template>

      <div class="modal-city__close cursor-pointer" @click="closeModal">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
      </div>
    </div>

  </div>
</template>

<style scoped lang="sass">
.city
  @apply flex items-center gap-3
  &__btn
    @apply font-bold hover:text-orange duration-300 ease-in
    &:nth-child(n+2)
      @apply  p-1 hover:bg-white hover:rounded-full
.modal-city
  @apply fixed inset-0 bg-black bg-opacity-50 flex flex-col gap-3
  &__title
    @apply text-2xl font-bold
  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute top-1/2 left-1/2 shadow-lg p-6 w-fit h-fit z-50
  &__search
    @apply relative
    &-icon
      @apply absolute top-1/4 left-2 z-10
    &-clean
      @apply absolute top-1/4 right-2 z-10 fill-orange
.closeModal
  @apply absolute top-1 -right-10;

</style>