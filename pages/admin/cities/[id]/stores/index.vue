<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import {useStore} from "@composable/useStore";
  import {useCity} from "@composable/useCity";
  import type {Store} from "@interfaces/store";
  import type {City} from "@interfaces/city";
  import { toRaw } from 'vue'

  const route = useRoute();
  const UseStore = useStore();
  const UseCity = useCity();
  const cityId = route.params.id;

  const error = ref<string>('')
  const activeCity = ref<City>();
  const modalModeStore = ref<'none'| 'view' | 'add' | 'update'| 'delete'>('none')
  const visibleStores = ref<Store[]>([]);
  const newStoreCopy = computed(() => ({ ...newStore }))
  const newStore = reactive<Store>({
    id: '',
    address: '',
    start_working_hours: '',
    end_working_hours: '',
    start_delivery_time: '',
    end_delivery_time: '',
    phone_number: '',
    min_order_price: 500,
    city_id: '',
    created_at: new Date(),
    updated_at: new Date(),
    area: [],
    point: [0, 0]
  });
  const emptyStore: Store = {
    id: '',
    address: '',
    start_working_hours: '',
    end_working_hours: '',
    start_delivery_time: '',
    end_delivery_time: '',
    phone_number: '',
    min_order_price: 500,
    city_id: '',
    created_at: new Date(),
    updated_at: new Date(),
    area: [],
    point: [0, 0]
  };
  const getActiveCity = async () => {
    const res = await UseStore.getStoresByCityId(cityId.toString() as string);
    visibleStores.value = res.stores;
  }
  const addStore = async () => {
    const res = await UseStore.addStore(newStore);
    if (res.result){
      modalModeStore.value = 'none'
      Object.assign(newStore, emptyStore);
    } else {
      error.value = res.message;
    }
  }
  const updateStore = async () => {
    const res = await UseStore.updateStore(newStore);
    if (res.result){
      modalModeStore.value = 'none'
    } else {
      error.value = res.message;
    }
  }
  const deleteStore = async () => {
    const res = await UseStore.deleteStore(newStore.id);
    if (res.result){
      modalModeStore.value = 'none'
    } else {
      error.value = res.message;
    }
  }
  const openModal = async (mode: typeof modalModeStore.value, store?: Store) => {
    modalModeStore.value = mode;
    if (mode === 'add') {
      const res = await UseCity.getCityById(cityId.toString() as string);
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
    <div @click="openModal('view', store)" class="store" v-for="store in visibleStores" :key="store.id">
      <div class="store__data">
        <div class="store__address"><b>Адрес:</b> {{store.address}}</div>
        <div class="store__working"><b>Часы работы:</b> {{store.start_working_hours}} - {{store.end_working_hours}}</div>
        <div class="store__delivery"><b>Время доставки:</b> {{store.start_delivery_time}} - {{store.end_delivery_time}}</div>
        <div class="store__price"><b>Минимальная сумма заказа:</b> {{store.min_order_price}}</div>
        <div class="store__phone"><b>Телефон:</b> +{{store.phone_number}}</div>
      </div>
      <div class="store__actions" @click.stop>
        <button @click="openModal('update', store)"><img src="@assets/icons/update.svg" alt="Редактировать"></button>
        <button @click="openModal('delete', store)"><img src="@assets/icons/delete.svg" alt="Удалить"></button>
      </div>
    </div>
  </div>
<div
    v-if="modalModeStore !== 'none'"
    class="modal-store"
    id="static-modal"
    data-modal-backdrop="static"
    aria-hidden="true"
  >
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
<!--:store-items="[toRaw(newStore)]"-->
        <template v-if="modalModeStore === 'add' || modalModeStore === 'update'">
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

          <p class="text-red" v-if="error">{{ error }}</p>
            <MapEditable />
          <button
            class="modal-store__button--gradient"
            @click="modalModeStore === 'add' ? addStore() : updateStore()"
          >
            {{ modalModeStore === 'add' ? 'Добавить' : 'Обновить' }}
          </button>
        </template>

        <template v-if="modalModeStore === 'delete'">
          <div class="modal-store__title">Удалить магазин {{ newStore.address }}?</div>
          <button @click="deleteStore" class="modal-store__button--gradient">Удалить</button>
          <p class="text-red" v-if="error">{{ error }}</p>
          <button @click="closeModal" class="modal-store__button--outline">Отмена</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
@use '@assets/styles/mixins' as *
.stores
  @apply flex flex-wrap gap-3 items-start
  &__btn--gradient
    @include button-orange-gradient
.store
  @apply bg-gray flex gap-6 p-3 rounded-3xl max-w-[500px]
  &__data
    @apply text-start
  &__actions
    @apply flex items-start
    & button
      @apply hover:bg-lightGray p-2 rounded-full
.modal-store
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]
  &__title
    @apply text-3xl
  &__container
    @apply flex flex-col gap-4 flex-1 overflow-hidden h-full
  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 w-[90vw] h-[90vh]
  &__content
    @apply flex flex-col overflow-hidden flex-auto
  &__working, &__delivery
    @apply flex gap-2
.closeModal
  @apply absolute top-1 -right-10;

</style>