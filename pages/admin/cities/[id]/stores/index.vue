<script setup lang="ts">
  import cloneDeep from 'lodash/cloneDeep'
  import { useRoute } from 'vue-router'
  import { toRaw } from 'vue'

  import {useStore} from "@composable/useStore";
  import {useCity} from "@composable/useCity";
  import {createEmptyStore, type Store} from "@interfaces/store";

  const MapEditable = defineAsyncComponent(() =>
    process.client ? import('@components/MapEditable.vue') : Promise.resolve({})
  )
  const route = useRoute();
  const UseStore = useStore();
  const UseCity = useCity();
  const cityId = route.params.id;
  const cityCoords = ref<[number, number]>([0, 0])
  const error = ref<string>('')
  const modalModeStore = ref<'none'| 'view' | 'add' | 'update'| 'delete'>('none')
  const visibleStores = ref<Store[]>([]);

  const newStore = reactive(createEmptyStore());
  const newStoreCopy = computed(() => cloneDeep(newStore));
  const emptyStore = createEmptyStore();

  const getActiveCity = async () => {
    const res = await UseStore.getStoresByCityId(cityId.toString() as string);
    visibleStores.value = res.stores;
  }
  const addStore = async () => {
    const res = await UseStore.addStore(newStore);
    if (res.result){
      await getActiveCity()
      modalModeStore.value = 'none'
      Object.assign(newStore, emptyStore);
    } else {
      error.value = res.message;
    }
  }
  const updateStore = async () => {
    const res = await UseStore.updateStore(newStore);
    if (res.result){
      await getActiveCity()
      modalModeStore.value = 'none'
    } else {
      error.value = res.message;
    }
  }

  const deleteStore = async () => {
    const res = await UseStore.deleteStore(newStore.id);
    if (res.result){
      await getActiveCity()
      modalModeStore.value = 'none'
    } else {
      error.value = res.message;
    }
  }

  function onStoreUpdate(updated: Store[]) {
    console.log("sasdasd", updated)
    newStore.point = updated[0].point
    newStore.area = updated[0].area
    console.log("AWD", newStore)

  }
  const openModal = async (mode: typeof modalModeStore.value, store?: Store) => {
    modalModeStore.value = mode;
    if (mode === 'add') {
      const res = await UseCity.getCityById(cityId.toString() as string);
      cityCoords.value = res.city.point;
    }
    if (store) {
      Object.assign(newStore, store);
      await getActiveCity();
    } else {
      Object.assign(newStore, emptyStore);
      newStore.city_id = cityId.toString();
    }
  }
  const closeModal = () => {
    modalModeStore.value = 'none';
    error.value = '';
  }
  onMounted(async ()=>{
    await getActiveCity()
  })
</script>

<template>
  <div class="stores">
    <button class="stores__btn--gradient" @click="openModal('add')">Создать магазин</button>
    <div class="stores__container">
      <NuxtLink :to="`/admin/cities/${cityId}/stores/${store.id}`" class="store" v-for="store in visibleStores" :key="store.id">
      <div class="store__data">
        <div class="store__address"><b>Адрес:</b> {{store.address}}</div>
        <div class="store__working"><b>Часы работы:</b> {{store.start_working_hours}} - {{store.end_working_hours}}</div>
        <div class="store__delivery"><b>Время доставки:</b> {{store.start_delivery_time}} - {{store.end_delivery_time}}</div>
        <div class="store__price"><b>Минимальная сумма заказа:</b> {{store.min_order_price}}</div>
        <div class="store__phone"><b>Телефон:</b> +{{store.phone_number}}</div>
      </div>
      <div class="store__actions" @click.stop>
        <button @click="openModal('view', store)"><img src="@assets/icons/eye.svg" alt="Посмотреть"></button>
        <button @click="openModal('update', store)"><img src="@assets/icons/update.svg" alt="Редактировать"></button>
        <button @click="openModal('delete', store)"><img src="@assets/icons/delete.svg" alt="Удалить"></button>
      </div>
    </NuxtLink>
    </div>
  </div>
  <div
    v-if="modalModeStore !== 'none'"
    class="modal-store"
    id="static-modal"
    data-modal-backdrop="static">
    <div class="modal-store modal-store--active">
      <div class="modal-store__close cursor-pointer" @click="closeModal">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
      </div>
      <div class="modal-store__container">
        <template v-if="modalModeStore === 'view'">
          <div class="modal-store__content">
            <MapVisible v-if="newStoreCopy"
              :coords="[newStoreCopy.point[0], newStoreCopy.point[1]]" :key="newStoreCopy.id"
              :zoom="12" :store-items="[toRaw(newStoreCopy)]"/>
          </div>
        </template>
        <template v-if="modalModeStore === 'add' || modalModeStore === 'update'">
          <div class="modal-store__form-scroll">
            <div class="modal-store__title">
              {{ modalModeStore === 'add' ? 'Добавить магазин' : 'Редактировать магазин' }}
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
              :coords="modalModeStore === 'add' ? [cityCoords[1], cityCoords[0]] : [newStoreCopy.point[0], newStoreCopy.point[1]]"
              :key="newStoreCopy.id"
              :zoom="12"
              class="modal-store__map"
              :store-items="modalModeStore === 'add' ? [toRaw(emptyStore)] : [toRaw(newStoreCopy)]"
              @update:storeItems="onStoreUpdate"
            />
            <p class="text-red" v-if="error">{{ error }}</p>
            <button
              class="modal-store__button--gradient"
              @click="modalModeStore === 'add' ? addStore() : updateStore()"
            >
              {{ modalModeStore === 'add' ? 'Добавить' : 'Обновить' }}
            </button>
          </div>
        </template>

        <template v-if="modalModeStore === 'delete'">
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
    @apply text-start
  &__actions
    @apply flex items-center flex-col content-center
    & button
      @apply hover:bg-lightGray p-2 rounded-full
.modal-store
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]
  &__form-scroll
    @apply flex flex-col gap-4 overflow-y-auto pr-2
    max-height: 100%
  &__map
    @apply flex-1 h-full
  &__title
    @apply text-3xl
  &__container
    @apply flex flex-col gap-4 flex-1 overflow-hidden h-full
  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 w-[90vw] h-[90vh]
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

</style>