<script setup lang="ts">
  import {useRoute} from "#imports";
  import {useStore} from "@composable/useStore";
  import {useCategory} from "@composable/useCategory";
  import {
    type Category,
    type CategoryRequest,
    TypeCategory,
    createEmptyCategoryRequest,
    type SwapDataCategory
  } from "@interfaces/category";
  import type {Store} from "@interfaces/store";

  const UseCategory = useCategory();
  const UseStore = useStore();
  const route = useRoute();

  const storeId = computed(() => route.params.storeId);
  const cityId = computed(() => route.params.cityId);
  const swapData = ref<SwapDataCategory>({first_category: '', second_category: ''});
  const modalMode = ref<'none' | 'add' | 'update'| 'delete'>('none')
  const error = ref<string>('')
  const allStores = ref<Store[]>([])
  const categories = ref<Category[]>([])
  const newCategory = reactive(createEmptyCategoryRequest());
  const emptyCategory = createEmptyCategoryRequest();

  const swapCategory = async () => {
    const res = await UseCategory.swapPositionCategories();
    if (res.result){

    } else {
      error.value = res.message;
    }
  }

  const createCategory = async () => {
    const res = await UseCategory.createCategory();
    if (res.result){

    } else {
      error.value = res.message;
    }
  }

  const updateCategory = async () => {
    const res = await UseCategory.updateCategory();
    if (res.result){

    } else {
      error.value = res.message;
    }
  }

  const deleteCategory = async () => {
    const res = await UseCategory.deleteCategory();
    if (res.result){

    } else {
      error.value = res.message;
    }
  }

  const openModal = async (mode: typeof modalMode.value, category?: CategoryRequest) => {
    modalMode.value = mode;
    if (mode === 'add') {

    }
    if (category) {
      Object.assign(newCategory, category);
    } else {
      Object.assign(newCategory, emptyCategory);
    }
  }

  const closeModal = () => {
    modalMode.value = 'none';
    error.value = '';
  }

  onMounted(async () => {
    const res = await UseCategory.getCategoryByStoreId(storeId.value);
    categories.value = res.categories;
    const data = await UseStore.getStoresByCityId(cityId.value);
    allStores.value = data.stores;
  })
</script>

<template>

  <div class="categories">
    <button class="categories__btn--gradient" @click="openModal('add')">Создать категорию</button>
    <div class="category" v-for="category in categories" :key="category.id">
      <NuxtLink :class="category.is_available ? 'category__link group' : 'category__link group line-through'">
        {{ category.name }}
        <div class="tooltip group-hover:opacity-100">

          <div class="tooltip__data">
            <p>Тип категории: {{ category.type }}</p>
            <p>Доступен: <span :class="category.is_available ? 'text-green': 'text-red'">{{category.is_available ? 'Да' : 'Нет'}}</span></p>
          </div>
          <div class="tooltip__actions">
            <button @click="openModal('update', category)"><img src="@assets/icons/update.svg" alt="Редактировать"></button>
            <button @click="openModal('delete', category)"><img src="@assets/icons/delete.svg" alt="Удалить"></button>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>

  <div v-if="modalMode !== 'none'" class="modal-category" data-modal-backdrop="static">
    <div class="modal-category modal-category--active"
    :class="{'modal-category--small': modalMode === 'add'}">
      <div class="modal-category__close cursor-pointer" @click="closeModal">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
      </div>
      <div class="modal-category__container">
        <template v-if="modalMode === 'add' || modalMode === 'update'">
          <div class="modal-category__title">
            {{ modalMode === "add" ? 'Добавить категорию' : 'Редактировать категорию' }}
          </div>

          <input
            v-model="newCategory.name"
            type="text"
            placeholder="Название"
            class="input"
          />

          <div class="modal-category__address">
            <label>Магазин по адресу</label>
            <select v-model="newCategory.store_id" class="select">
              <option disabled value="">Выберите адрес</option>
              <option
                v-for="store in allStores"
                :key="store.id"
                :value="store.id"
              >
                {{ store.address }}
              </option>
            </select>
          </div>

          <div class="modal-category__available">
            <div class="radio-group">
            <label>Доступно</label>
            <label>
              <input
                type="radio"
                :value="true"
                v-model="newCategory.is_available"
              />
              Да
            </label>
            <label>
              <input
                type="radio"
                :value="false"
                v-model="newCategory.is_available"
              />
              Нет
            </label>
          </div>
          </div>
          <div class="modal-category__type-category">
            <label>Тип категории</label>
            <select v-model="newCategory.type" class="select">
              <option :value="TypeCategory.GROUP">Группа</option>
              <option :value="TypeCategory.PIZZA">Пицца</option>
              <option :value="TypeCategory.CONSTRUCTOR">Конструктор</option>
            </select>
          </div>
        </template>

        <template v-else-if="modalMode === 'delete'">
          <div class="modal-category__title">Удалить категорию {{newCategory.name}}?</div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
@use 'assets/styles/mixins' as *
.categories
  @apply flex flex-col gap-3 items-baseline
  &__btn--gradient
    @include button-orange-gradient
.category
  @apply relative

  &__link
    @include text-hover
    @apply text-xl relative

.tooltip
  @apply absolute left-full ml-2 -translate-x-1/2 flex gap-3
  @apply bg-white text-black text-base p-2 rounded-[10px] shadow-lg
  @apply opacity-0 transition-opacity duration-300 whitespace-nowrap z-10
  &__actions
    @apply w-max flex flex-col gap-1
  &__data
    @apply flex flex-col
.modal-category
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]
  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 w-[90vw] h-[90vh]
  &--small
    @apply w-fit h-fit
  &__title
    @apply text-3xl
  &__container
    @apply flex flex-col gap-4
.closeModal
  @apply absolute top-1 -right-10;
</style>