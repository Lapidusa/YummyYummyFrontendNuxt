<script setup lang="ts">
  import cloneDeep from 'lodash/cloneDeep'
  import { useRoute } from 'vue-router'
  import { toRaw } from 'vue'

  import {useStore} from "@composable/useStore";
  import {useCity} from "@composable/useCity";
  import {createEmptyStore, type Store, StoreFieldLabels} from "@interfaces/store";
  import {validateEmptyFieldsByLabels} from "@/utils/validators";
  import type {City} from "@interfaces/city";

  const MapEditable = defineAsyncComponent(() =>
    process.client ? import('@components/maps/MapEditable.vue') : Promise.resolve({})
  )
  const MapVisible = defineAsyncComponent(() =>
    process.client ? import('@components/maps/MapVisible.vue') : Promise.resolve({})
  )

  const route = useRoute();
  const UseStore = useStore();
  const UseCity = useCity();
  const cityId = computed(() => route.params.cityId as string)
  const cityCoords = ref<[number, number]>([0, 0])
  const city = ref<City>({
    id: '',
    name:'',
    point:[0,0]
  })
  const error = ref<string>('')
  const modalMode = ref<'none'| 'view' | 'add' | 'update'| 'delete'>('none')
  const visibleStores = ref<Store[]>([]);
  const isLoading = ref(false);

  const newStore = reactive(createEmptyStore());
  const newStoreCopy = computed(() => cloneDeep(newStore));
  const emptyStore = createEmptyStore();

  function validateAndSetError(): boolean {
    const errorMessage = validateEmptyFieldsByLabels(newStore, StoreFieldLabels)
    if (errorMessage) {
      error.value = errorMessage
      return false
    }
    error.value = ''
    return true
  }

  const removeStoreById = (id: string): Store[] => {
    return visibleStores.value.filter(store => store.id !== id);
  };

  const getActiveCity = async () => {
    const res = await UseStore.getStoresByCityId(cityId.value.toString() as string);
    visibleStores.value = res.stores;
  }

  const addStore = async () => {
    if (!validateAndSetError()) return
    isLoading.value = true;
    const res = await UseStore.addStore(newStore);
    isLoading.value = false;

    if (res.result){
      await getActiveCity()
      modalMode.value = 'none'
      Object.assign(newStore, emptyStore);
    } else {
      error.value = res.message;
    }
  }

  const updateStore = async () => {
    if (!validateAndSetError()) return

    const res = await UseStore.updateStore(newStore);

    if (res.result){
      await getActiveCity()
      modalMode.value = 'none'
    } else {
      error.value = res.message;
    }
  }

  const deleteStore = async () => {
    const res = await UseStore.deleteStore(newStore.id);

    if (res.result){
      await getActiveCity()
      modalMode.value = 'none'
      Object.assign(newStore, emptyStore);
    } else {
      error.value = res.message;
    }
  }

  function onStoreUpdate(updated: Store[]) {
    newStore.point = updated[0].point
    newStore.area = updated[0].area
  }

  const openModal = async (mode: typeof modalMode.value, store?: Store) => {
    Object.assign(newStore, store ?? { ...emptyStore, city_id: cityId.value });
    modalMode.value = mode;
  }

  const closeModal = () => {
    modalMode.value = 'none';
    error.value = '';
  }

  onMounted(async ()=>{
    await getActiveCity()
    const res = await UseCity.getCityById(cityId.value.toString() as string);
    city.value = res.city;
  })
</script>

<template>
  <div class="stores">
    <button class="stores__btn--gradient" @click="openModal('add')">Создать магазин</button>
    <div class="stores__container">
      <div class="store" v-for="store in visibleStores" :key="store.id">
        <NuxtLink :to="`/admin/cities/${cityId}/stores/${store.id}/categories`" class="store__data">
          <div class="store__address"><b>Адрес:</b> {{store.address}}</div>
          <div class="store__working"><b>Часы работы:</b> {{store.start_working_hours}} - {{store.end_working_hours}}</div>
          <div class="store__delivery"><b>Время доставки:</b> {{store.start_delivery_time}} - {{store.end_delivery_time}}</div>
          <div class="store__price"><b>Минимальная сумма заказа:</b> {{store.min_order_price}}</div>
          <div class="store__phone"><b>Телефон:</b> +{{store.phone_number}}</div>
        </NuxtLink>
        <div class="store__actions">
          <button @click="openModal('view', store)"><img src="@assets/icons/eye.svg" alt="Посмотреть"></button>
          <button @click="openModal('update', store)"><img src="@assets/icons/update.svg" alt="Редактировать"></button>
          <button @click="openModal('delete', store)"><img src="@assets/icons/delete.svg" alt="Удалить"></button>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="modalMode !== 'none'"
    class="modal-store"
    data-modal-backdrop="static">
    <div class="modal-store modal-store--active"
    :class="{'modal-store--small': modalMode === 'delete'}">

      <div class="modal-store__close cursor-pointer" @click="closeModal">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
      </div>
      <div class="modal-store__container">
        <template v-if="modalMode === 'view'">
          <div class="modal-store__content">
            <MapVisible v-if="newStoreCopy"
              :city="city" :key="newStoreCopy.id"
              :zoom="12" :store-items="[toRaw(newStoreCopy)]"/>
          </div>
        </template>
        <template v-if="modalMode === 'add' || modalMode === 'update'">
          <div class="modal-store__form-scroll">
            <div class="modal-store__title">
              {{ modalMode === 'add' ? 'Добавить магазин' : 'Редактировать магазин' }}
            </div>
            <input v-model="newStore.address" type="text" placeholder="Адрес" />
            <div class="modal-store__working">
              <p>Время работы: </p>
              <div class="modal-store__working-inputs">
                <input v-model="newStore.start_working_hours" type="time" placeholder="Начало работы" /> -
                <input v-model="newStore.end_working_hours" type="time" placeholder="Конец работы" />
              </div>
            </div>
            <div class="modal-store__delivery">
              <p>Время доставки: </p>
              <div class="modal-store__delivery-inputs">
                <input v-model="newStore.start_delivery_time" type="time" placeholder="Начало доставки" /> -
                <input v-model="newStore.end_delivery_time" type="time" placeholder="Конец доставки" />
              </div>
            </div>

            <PhoneNumber v-model="newStore.phone_number" />
            <div class="modal-store__price flex gap-3">
              <p>Мин. сумма для заказа</p>
              <input class="w-auto" v-model.number="newStore.min_order_price" type="number" placeholder="Мин. сумма заказа" />
            </div>
            <MapEditable
              :city="city"
              :key="modalMode + '-' + (newStore.id || 'new')"
              :zoom="12"
              class="modal-store__map"
              :editable-store="newStore"

              :displayStores="modalMode === 'add' ? visibleStores : removeStoreById(newStoreCopy.id)"
              @update:storeItems="onStoreUpdate"
            />

            <p class="text-red" v-if="error">{{ error }}</p>
            <button
              class="modal-store__button--gradient" :disabled="isLoading"
              @click="modalMode === 'add' ? addStore() : updateStore()"
            >
              {{ modalMode === 'add' ? 'Добавить' : 'Обновить' }}
            </button>
          </div>
        </template>

        <template v-if="modalMode === 'delete'">
          <div class="modal-store__title">Удалить магазин {{ newStore.address }}?</div>
          <p class="text-red" v-if="error">{{ error }}</p>
          <div class="flex gap-3">
            <button @click="deleteStore" class="modal-store__button--gradient">Удалить</button>
            <button @click="closeModal" class="modal-store__button--outline">Отмена</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<style lang="sass">
   .modal-store__form-scroll #map
      min-height: 500px
</style>
<style scoped lang="sass">
@use '@assets/styles/mixins' as *
.stores
  @apply flex flex-col gap-3 items-start

  &__btn--gradient
    @include button-orange-gradient

  &__container
    @apply flex flex-wrap gap-3

.store
  @apply bg-gray flex gap-6 p-3 rounded-3xl max-w-[500px]

  &__data
    @apply text-start font-semibold

  &__actions
    @apply flex items-center flex-col content-center

    & button
      @apply hover:bg-lightGray p-2 rounded-full

.modal-store
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]

  &__form-scroll
    @apply flex flex-col gap-4 overflow-y-auto pr-2

  &__map
    @apply flex-1 h-full

  &__title
    @apply text-3xl

  &__container
    @apply flex flex-col gap-4 flex-1 overflow-hidden h-full

  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50
    width: calc(100% - 100px)
    height: calc(100% - 100px)

  &--small
    @apply w-fit h-fit

  &__content
    @apply flex flex-col overflow-hidden flex-auto overflow-y-auto

  &__working, &__delivery
    @apply flex gap-2

  &__button--outline
    @include button-orange-outline
    @apply flex-1

  &__button--gradient
    @include button-orange-gradient
    @apply flex-1

.closeModal
  @apply absolute top-1 -right-10;

b
  font-weight: 800
</style>