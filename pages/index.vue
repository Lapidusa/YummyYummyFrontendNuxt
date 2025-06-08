<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { useCityStore } from "@store/city"
import type {City} from "@interfaces/city";
import {useCity} from "@composable/useCity";
import type {Category} from "@interfaces/category";
import {createEmptyProduct, createEmptyPizza, type Product, TypeProduct, type Pizza} from "@interfaces/product";
import type {Ingredient} from "@interfaces/ingredient";
import {useIngredient} from "@composable/useIngredient";

const config = useRuntimeConfig()
const storeCity = useCityStore();
const UseIngredient = useIngredient()
const UseCity = useCity();
const viewItem = ref<Product | Pizza>( createEmptyProduct() )
const city = ref<City>();
const categories = ref<Category[]>();
const ingredients =ref<Ingredient[]>([]);

const modalMode = ref< 'none' | 'view' >('none')

const initialData = async (cityId: string) => {
  const res = await UseCity.getFullDataByCity(cityId)
  categories.value = res.stores[0].categories;
  const resIngredients = await UseIngredient.getIngredients()
  ingredients.value = resIngredients.ingredients;
}

function openModalProduct(productData:Product){
  modalMode.value = 'view';
  viewItem.value = productData;
}

const closeModal = () => {
  modalMode.value = 'none';
}

function getDisplayVariant (product: Product) {
  const len = product.variants.length
  if (len === 0) return null
  return product.variants[len % 2 === 0 ? len - 1 : Math.floor(len / 2)]
}

function getMinPrice (product: Product):number | null {
  if (!product.variants.length) return null
  return Math.min(...product.variants.map(v=>v.price))
}

function getStructure(ingredients: Ingredient[]): string {
  const names = ingredients
      .filter(item => !item.is_deleted && item.name)
      .map(item => item.name.trim());

  if (names.length === 0) return "";

  const formatted = names.map((name, idx) => {
    const first = name.charAt(0);
    const rest = name.slice(1);
    if (idx === 0) {
      return first.toUpperCase() + rest;
    } else {
      return first.toLowerCase() + rest;
    }
  });
  return formatted.join(", ");
}
const formattedIngredients = computed(() => {
  const ings = (viewItem.value as Pizza).ingredients || []
  return ings
      .filter(i => i.name)
      .map((i, idx) => {
        const raw = i.name.trim()
        const first = raw.charAt(0)
        const rest  = raw.slice(1)
        const name = idx === 0
            ? first.toUpperCase() + rest
            : first.toLowerCase() + rest

        return {
          id:         i.id,
          name,
          isDeleted:  i.is_deleted
        }
      })
})

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
  <div class="main-subheader container">
    <div class="main-categories">
      <div class="main-subheader__category" v-for="category in categories">
        <a :href="'#' + category.id" class="main-subheader__category-name">{{category.name}}</a>
      </div>
    </div>
    <div class="main-cart">
      <button class="main-cart__btn btn--gradient">
        Корзина
      </button>
    </div>
  </div>

  <main class="main container">
    <div class="main-category" v-for="category in categories" :key="category.id">
      <a class="main-category__name" :id="category.id">{{category.name}}</a>
      <div class="main-category__products">
        <button @click="openModalProduct(product)" type="button" class="main-category__product" v-for="product in category.products">
          <div class="main-category__product-container">
            <img
                :src="`${config.public.serverUrl}${getDisplayVariant(product)!.image}`"
                :alt="getDisplayVariant(product)!.size"
                v-if="getDisplayVariant(product)"
                class="w-full aspect-square object-contain"
            />
            <p class="main-category__product-text font-extrabold text-xl">{{product.name}}</p>
            <p class="main-category__product-text">{{product.type === TypeProduct.PIZZA && product.ingredients ? getStructure(product.ingredients) : product.description}}</p>
          </div>
          <div class="main-category__product-container flex gap-2 justify-between items-center">
            <div class="main-category__product-text font-bold text-xl">от {{getMinPrice(product)}} ₽</div>
            <div class="btn--gradient">Выбрать</div>
          </div>
        </button>
      </div>
    </div>
  </main>

  <div v-if="modalMode !== 'none'" class="modal-product">
    <div class="modal-product modal-product--active">
      <div class="modal-product__close cursor-pointer" @click="closeModal">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
      </div>
      <div class="modal-product__container">
        <div class="w-full aspect-square">
          <img
              :src="`${config.public.serverUrl}${getDisplayVariant(viewItem)!.image}`"
              :alt="getDisplayVariant(viewItem)!.size"
              v-if="getDisplayVariant(viewItem)"
              class="w-full aspect-square object-contain"
          />
        </div>
        <div class="modal-product__data">
          <div class="modal-product__title">{{viewItem.name}}</div>

          <p class="modal-product__text">
            <template v-for="(ing, idx) in formattedIngredients" :key="ing.id">
              <!-- если удалён — рендерим кнопку с классом removed -->
              <button
                  v-if="ing.isDeleted"
                  class="removed"
                  type="button"
              >
                {{ ing.name }}
              </button>

              <span v-else>
                {{ ing.name }}
              </span>
              <!-- запятая между элементами, кроме последнего -->
              <span v-if="idx < formattedIngredients.length - 1">, </span>
            </template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="sass">
@use 'assets/styles/mixins' as *
.main
  @apply px-[34px] flex flex-col gap-4

  &-subheader
    @apply sticky top-0 bg-white bg-opacity-60 backdrop-blur-2xl py-3
    @apply flex justify-between

    &__category
      &-name
        @apply text-xl hover:text-orange duration-300 cursor-pointer
  &-category
    @apply flex flex-col gap-3
    &__products
      @apply grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4

    &__product
      @apply p-[30px] rounded-[45px] duration-300 cursor-pointer hover:shadow-[0_0_25px_0_rgba(177,177,177,0.1)]
      @apply flex flex-col gap-2 justify-between

      &-text
        @apply text-start

      &-container:first-child
        @apply flex flex-col gap-3

    &__name
      @apply text-3xl font-bold
  &-categories
    @apply flex gap-3 items-center

.modal-product
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]

  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 w-max -translate-x-1/2 absolute max-w-[80%]
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 h-max

  &__container
    @apply flex

  &__title
    @apply text-3xl

.container
  @apply px-[34px]

.closeModal
  @apply absolute top-1 -right-10;

.btn--gradient
  @include button-orange-gradient
.removed
  @apply decoration-dashed underline underline-offset-4;
</style>
