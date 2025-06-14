<script setup lang="ts">
  import {useRoute, validateEmptyFieldsByLabels} from "#imports";
  import {useStore} from "@composable/useStore";
  import {useCategory} from "@composable/useCategory";
  import {
    type Category,
    type CategoryRequest,
    TypeCategory,
    TypeCategoryLabels,
    CategoryFieldLabels,
    createEmptyCategory
  } from "@interfaces/category";
  import {type Store} from "@interfaces/store";
  import CloseIcon from "@components/icons/closeIcon.vue";

  const UseCategory = useCategory();
  const UseStore = useStore();
  const route = useRoute();

  const storeId = computed(() => route.params.storeId);
  const cityId = computed(() => route.params.cityId);
  const modalMode = ref<'none' | 'add' | 'update'| 'delete'>('none')
  const error = ref<string>('')
  const allStores = ref<Store[]>([])
  const categories = ref<Category[]>([])
  const newCategory = reactive(createEmptyCategory());

  const emptyCategoryRequest = createEmptyCategory();

  function validateAndSetError(): boolean {
    const errorMessage = validateEmptyFieldsByLabels(newCategory, CategoryFieldLabels)
    if (errorMessage) {
      error.value = "Заполните обязательные поля: - " + errorMessage
      return false
    }
    error.value = ''
    return true
  }

  const swapCategory = async (categoryId1: string, categoryId2:string) => {
    const res = await UseCategory.swapPositionCategories(categoryId1, categoryId2);
    if (res.result){
      await initialData();
      error.value = ''
    } else {
      error.value = res.message
    }
  }

  const createCategory = async () => {
    if (!validateAndSetError()) return
    const res = await UseCategory.createCategory(newCategory);
    if (res.result){
      closeModal();
      await initialData();
    } else {
      error.value = res.message;
    }
  }

  const updateCategory = async (categoryId:string) => {
    if (!validateAndSetError()) return
    newCategory.id = categoryId;
    const res = await UseCategory.updateCategory(newCategory);
    if (res.result){
      closeModal();
      await initialData();
    } else {
      error.value = res.message;
    }
  }

  const deleteCategory = async (categoryId: string) => {
    const res = await UseCategory.deleteCategory(categoryId);
    if (res.result){
      closeModal();
      await initialData();
    } else {
      error.value = res.message;
    }
  }

  const openModal = async (mode: typeof modalMode.value, category?: CategoryRequest) => {
    modalMode.value = mode;
    if (category) {
      Object.assign(newCategory, category);
    } else {
      Object.assign(newCategory, emptyCategoryRequest);
    }
  }

  const closeModal = () => {
    modalMode.value = 'none';
    error.value = '';
  }

  const initialData = async () =>{
    const res = await UseCategory.getCategoryByStoreId(storeId.value);
    categories.value = res.categories;
    const data = await UseStore.getStoresByCityId(cityId.value);
    allStores.value = data.stores;
  }

  onMounted(async () => {
    await initialData()
  })
</script>

<template>

  <div class="categories">
    <button class="categories__btn--gradient flex" @click="openModal('add')">Создать категорию</button>
    <div class="categories__container">
      <div class="category group" v-for="(category, index) in categories" :key="category.id">
        <NuxtLink :to="`/admin/cities/${cityId}/stores/${storeId}/categories/${category.id}`" :class="category.is_available ? 'category__link' : 'category__link group line-through'">
          {{ category.name }}
        </NuxtLink>
        <div class="tooltip group-hover:opacity-100">
          <button @click="swapCategory(category.id, categories[index-1]?.id)" v-if="categories[0].id !== category.id">
            <img class="category__img" src="@assets/icons/arrow-l.svg" alt="left">
          </button>
          <div class="tooltip__data">
            <p>Тип категории: {{ TypeCategoryLabels[category.type] }}</p>
            <p>Доступен: <span :class="category.is_available ? 'text-green': 'text-red'">{{category.is_available ? 'Да' : 'Нет'}}</span></p>
          </div>
          <div class="tooltip__actions">
            <button @click="openModal('update', category)"><img class="category__img" src="@assets/icons/update.svg" alt="Редактировать"></button>
            <button @click="openModal('delete', category)"><img class="category__img" src="@assets/icons/delete.svg" alt="Удалить"></button>
          </div>
          <button @click="swapCategory(category.id, categories[index+1]?.id)" v-if="categories[categories.length - 1].id!==category.id">
            <img class="category__img" src="@assets/icons/arrow-r.svg" alt="right">
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="modalMode !== 'none'" class="modal-category" data-modal-backdrop="static">
    <div class="modal-category modal-category--active">
      <div class="modal-category__close cursor-pointer" @click="closeModal">
        <CloseIcon class="closeModal"/>
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
            <div class="radio-group flex gap-4">
            <label>Доступно</label>
              <ToggleInputYesOrNo v-model="newCategory.is_available"/>
            </div>
          </div>
          <div class="modal-category__type-category">
            <label>Тип категории</label>
            <select v-model="newCategory.type" class="select">
              <option :value="TypeCategory.GROUP"> {{ TypeCategoryLabels[TypeCategory.GROUP] }} </option>
              <option :value="TypeCategory.PIZZA"> {{ TypeCategoryLabels[TypeCategory.PIZZA] }} </option>
              <option :value="TypeCategory.CONSTRUCTOR"> {{ TypeCategoryLabels[TypeCategory.CONSTRUCTOR] }} </option>
            </select>
          </div>

          <p class="text-red" v-if="error">{{ error }}</p>

          <button
              class="modal-category__button--gradient"
              @click="modalMode === 'add' ? createCategory() : updateCategory(newCategory.id)"
            >
              {{ modalMode === 'add' ? 'Добавить' : 'Обновить' }}
          </button>
        </template>

        <template v-else-if="modalMode === 'delete'">
          <div class="modal-category__title">Удалить категорию {{ newCategory.name }}?</div>
          <p class="text-red" v-if="error">{{ error }}</p>
          <div class="flex gap-3 justify-center">
            <button @click="deleteCategory(newCategory.id)" class="modal-category__button--gradient">Удалить</button>
            <button @click="closeModal" class="modal-category__button--outline">Отмена</button>
          </div>
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

  &__container
    @apply flex gap-4 flex-wrap items-baseline
.category
  @apply relative

  &__link
    @include text-hover
    @apply text-xl relative

  &__img
    @apply w-5 h-5 object-contain

.tooltip
  @apply absolute left-full w-max -translate-x-1/2 flex gap-3 items-center
  @apply bg-white text-black text-base p-2 rounded-[10px] shadow-lg
  @apply opacity-0 pointer-events-none transition-opacity duration-300 whitespace-nowrap z-10

  .group:hover &
    @apply opacity-100 pointer-events-auto

  &__actions
    @apply w-max flex flex-col gap-1

  &__data
    @apply flex flex-col

.modal-category
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]

  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 w-fit h-fit

  &--small
    @apply w-fit h-fit

  &__title
    @apply text-3xl

  &__container
    @apply flex flex-col gap-4

  &__button--gradient
    @include button-orange-gradient
    @apply flex-1

  &__button--outline
    @include button-orange-outline
    @apply flex-1
.closeModal
  @apply absolute top-1 -right-10 opacity-100 fill-white
</style>