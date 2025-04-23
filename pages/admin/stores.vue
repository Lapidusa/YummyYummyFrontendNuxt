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
  const isModalCityOpen = ref<boolean>(false);
  const changeModal = ref<boolean>(false);
  const editableCity = ref<Partial<City>>({ name: '' })

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
      isModalCityOpen.value = false
      cityStore.setCity(city);
    }
  }

  const changeModalCities = (changeContent: boolean) => {
    isModalCityOpen.value = !isModalCityOpen.value;
    changeModal.value = changeContent;
  }
  const addCity = () => {

  }

  const updateCity = () => {

  }
  const modalMode = ref<'none' | 'select' | 'add' | 'edit'| 'delete'>('none')

  const openModal = (mode: typeof modalMode.value) => {
    modalMode.value = mode;
  }

  const closeModal = () => {
    modalMode.value = 'none';
  }
  const deleteCity = async () => {
    if (activeCity.value && confirm(`Удалить город "${activeCity.value.name}"?`)) {
      const res = await UseCity.deleteCity({ id: activeCity.value.id })
      if (res.result) {
        changeModalCities(false)
      }
    }
  }

  onMounted(async () => {
    allCities.value = await UseCity.getAllCity()
    cityStore.initCityFromStorage()
    activeCity.value = city.value;
  })
</script>

<template>
  <div class="store">
    <button class="store__btn" @click="openModal('select')">
      {{ activeCity?.name }}
    </button>

    <button class="store__btn store__btn--add" @click="openModal('add')">
      <img src="@assets/icons/plus.svg" alt="add" />
    </button>

    <button class="store__btn store__btn--update" @click="openModal('edit')">
      <img src="@assets/icons/update.svg" alt="update" />
    </button>

    <button class="store__btn store__btn--delete" @click="openModal('delete')">
      <img src="@assets/icons/delete.svg" alt="delete" />
    </button>
  </div>

  <!-- Общая обёртка модалки -->
  <div
    v-if="modalMode !== 'none'"
    class="modal-store modal-store--active"
    id="static-modal"
    data-modal-backdrop="static"
    aria-hidden="true"
  >
    <!-- Модалка выбора города -->
    <template v-if="modalMode === 'select'">
      <div class="modal-store__title">Выберите свой город</div>
      <div class="modal-store__search">
        <img class="modal-store__search-icon" src="@assets/icons/search.svg" alt="Search" />
        <input
          type="search"
          class="modal-store__search"
          v-model.trim="searchTerm"
        />
        <button
          v-if="searchTerm"
          class="clear-button"
          @click.prevent="searchTerm = ''"
        >
          <img
            class="modal-store__search-clean"
            src="@assets/icons/x-letter.svg"
            alt="Clear Input"
          />
        </button>
      </div>
      <div class="modal-store__cities">
        <div
          class="modal-store__city"
          v-for="city in visibleCities"
          :key="city.id"
        >
          <button @click="changeCity(city.id)" class="modal-store__text--hover">
            {{ city.name }}
          </button>
        </div>
      </div>
    </template>

    <!-- Модалка добавления города -->
    <template v-else-if="modalMode === 'add'">
      <div class="modal-store__title">Добавить город</div>
      <input
        type="text"
        v-model.trim="editableCity.name"
        placeholder="Введите название города"
      />
      <button @click="addCity">Добавить</button>
    </template>

    <!-- Модалка редактирования города -->
    <template v-else-if="modalMode === 'edit'">
      <div class="modal-store__title">Редактировать город</div>
      <input
        type="text"
        v-model.trim="editableCity.name"
        :placeholder="activeCity?.name || 'Введите новое название'"
      />
      <button @click="updateCity">Обновить</button>
    </template>

    <!-- Кнопка закрытия -->
    <div class="modal-store__close cursor-pointer" @click="closeModal">
      <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
    </div>
  </div>
</template>

<style scoped lang="sass">
.store
  @apply flex items-center gap-3
  &__btn
    @apply font-bold hover:text-orange duration-300 ease-in
    &:nth-child(n+2)
      @apply  p-1 hover:bg-white hover:rounded-full
.modal-store
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