<script setup lang="ts">
  import { onMounted, ref, watch } from "vue"
  import { useCityStore } from "@store/city"
  import type {City} from "@interfaces/city";
  import {useCity} from "@composable/useCity";
  import type {Category} from "@interfaces/category";
  import {
    createEmptyProduct,
    type Product,
    TypeProduct,
    type Pizza,
    TypeDoughLabels
  } from "@interfaces/product";
  import type {Ingredient, IngredientWithQuantity} from "@interfaces/ingredient";
  import {useIngredient} from "@composable/useIngredient";
  import {createEmptyPizza} from "@interfaces/product";
  import {useCartItem} from "@composable/useCart";
  import {
    type CartItemRequest,
    createEmptyCartItem,
    type RemovedIngredient
  } from "@interfaces/cart";
  import CloseIcon from "@components/icons/closeIcon.vue";
  import {useUserStore} from "@store/user";
  import type {User} from "@interfaces/user";

  const config = useRuntimeConfig();
  const storeCity = useCityStore();
  const UseIngredient = useIngredient();
  const UseCartItem = useCartItem();
  const UseCity = useCity();
  const userStore = useUserStore();
  const userData = computed<User | null>(() => userStore.user);

  const viewProduct = ref<Product >( createEmptyProduct() );
  const viewPizza = ref<Pizza>( createEmptyPizza() );
  const cart = reactive<CartItemRequest[]>([]);

  const city = ref<City>();
  const activeProduct = ref<Product | Pizza>();
  const categories = ref<Category[]>();
  const ingredients =ref<Ingredient[]>([]);
  const selectedIngredients =ref<IngredientWithQuantity[]>([]);
  const deletedIngredients = ref<RemovedIngredient[]>([]);

  const isAuthorized = ref<boolean>(false);
  const isRole = ref<number>(0);
  const showWarning = ref<boolean>(false);
  const selectedVariantIndex = ref<number>(0);

  const price = ref(0);

  const modalMode = ref< 'none' | 'view' >('none');
  const modalModeCart = ref<'none' | 'view' >('none');

  const currentVariant = computed(() => {
    const isGroup = activeProduct.value?.type === TypeProduct.GROUP

    const arr = isGroup
        ? viewProduct.value?.variants ?? []
        : viewPizza.value?.variants ?? []

    return arr[selectedVariantIndex.value] ?? arr[0] ?? null
  })

  const formattedIngredients = computed(() => {
    const ings = viewPizza.value.ingredients ?? []
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
          id: i.id,
          name,
          isDeleted: i.is_deleted
        }
      })
  })

  const initialData = async (cityId: string) => {
    const res = await UseCity.getFullDataByCity(cityId)
    categories.value = res.stores[0].categories;
    const resIngredients = await UseIngredient.getIngredients()
    ingredients.value = resIngredients.ingredients;
    const cartRes = await UseCartItem.getCart()
    cart.splice(0, cart.length, ...(cartRes.cart ?? []));

    cart.splice(0)
    cart.push(...(cartRes.cart ?? []));
  }

  function openModalProduct(productData:Product){
    modalMode.value = 'view';
    document.body.style.overflow = 'hidden'
    calculateLocalPrice()
    selectedVariantIndex.value = 0
    activeProduct.value = productData;
    selectedVariantIndex.value = (selectedVariantIndex.value + 1) % productData.variants.length
    selectedIngredients.value = ingredients.value.map(i => ({
      ...i,
      quantity: 0,
    }))
    if(activeProduct.value.type === TypeProduct.GROUP){
      viewProduct.value = productData as Product
    }else if(activeProduct.value.type === TypeProduct.PIZZA){
      viewPizza.value = productData as Pizza
    }
  }

  function openModalCart(){
    modalModeCart.value = 'view';
    document.body.style.overflow = 'hidden'
  }

  function closeModal(isSimple: boolean){
    if(isSimple) {
      modalMode.value = 'none';
      if(modalModeCart.value === 'view'){
        document.body.style.overflow = 'hidden'
        return
      }
    }
    else modalModeCart.value = 'none';

    document.body.style.overflow = ''
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

  function addCustomIngredient(ing: IngredientWithQuantity) {
    if(ing.quantity < 3 ) {
      ing.quantity++
    }
    else ing.quantity = 0;
  }

  function removeCustomIngredient(ing: IngredientWithQuantity) {
    if (ing.quantity > 0) ing.quantity--;
  }

  function toggleDeletedIngredient(id: string) {
    const idx = deletedIngredients.value.findIndex(d => d.ingredient_id === id)
    if (idx !== -1) {
      deletedIngredients.value.splice(idx, 1)
    } else {
      const raw = formattedIngredients.value.find(i => i.id === id)
      if (!raw) return

      const rem: RemovedIngredient = {
        ingredient_id: raw.id,
        quantity: 1,
        name: raw.name,
      }
      deletedIngredients.value.push(rem)
    }
  }

  const cartItemValue = (data?: CartItemRequest): CartItemRequest => {
    const payload: CartItemRequest = createEmptyCartItem();
    if (!activeProduct.value) return payload;

    const type: 'simple' | 'pizza' = activeProduct.value.type === TypeProduct.GROUP
            ? 'simple'
            : 'pizza';
    payload.type = type;

    if (data) {
      payload.product_variant_id = data.variant?.id ?? currentVariant.value.id;
      payload.quantity = data.quantity;
      if (type === 'pizza') {
        payload.dough = data.dough!;
        payload.added_ingredients = (data.added_ingredients || []).map(ai => ({
          ingredient_id: ai.ingredient?.id ?? ai.ingredient_id,
          quantity: ai.quantity,
        }));
        payload.removed_ingredients = (data.removed_ingredients || []).map(ri => ({
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity,
        }));
      }
    } else {
      payload.product_variant_id = currentVariant.value.id
        payload.dough = viewPizza.value.dough!
        payload.added_ingredients = selectedIngredients.value
          .filter(i => i.quantity > 0)
          .map(i => ({
            ingredient_id: i.id,
            quantity: i.quantity,
          }))
        payload.removed_ingredients = deletedIngredients.value.map(i => ({
          ingredient_id: i.ingredient_id,
          quantity: i.quantity,
        }))
      }
    return payload
  }

  const addToUpdateCartItem = async (amount: number, item?: CartItemRequest) => {
    const payload = cartItemValue(item);
    if (!userData.value) return alert("Авторизуйтесь!")
    if (item) {
      payload.quantity = amount;
      payload.product_variant_id = item.variant!.id
    } else {
      payload.quantity = amount;
    }
    if (payload.type === 'simple') {
      delete payload.dough;
      delete payload.added_ingredients;
      delete payload.removed_ingredients;
    }
    delete payload.name;
    const res = await UseCartItem.addCartItem(payload);
    if (res.result && storeCity.city?.id) {
      closeModal(true);
      await initialData(storeCity.city.id);
    }
  };

  function calculateLocalPrice(){
    showWarning.value = false

    const basePrice = currentVariant.value?.price || 0

    const ingredients = Array.isArray(selectedIngredients.value)
        ? selectedIngredients.value
        : []

    const ingredientsTotal = ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.price || 0) * (ingredient.quantity || 0)
    }, 0)

    return basePrice + ingredientsTotal
  }

  function totalPriceCart(){
    return cart.reduce((sum, item) => sum + (item.quantity * item.price!), 0)
  }

  function isLocallyDeleted(id: string): boolean {
    return deletedIngredients.value.some(d => d.ingredient_id === id)
  }

  watch(isAuthorized, async () => {
    if(storeCity.city) await initialData(storeCity.city.id)
  })

  watchEffect(async () => {
    if (!currentVariant.value || !selectedIngredients.value) return
    if(activeProduct.value && activeProduct.value.type === TypeProduct.PIZZA){
      const localPrice = calculateLocalPrice()
      const payload = cartItemValue()
      delete payload.price
      const res = await UseCartItem.debounceSendToServer(payload)
      const serverPrice = res.price
      price.value = serverPrice

      showWarning.value = Math.abs(localPrice - serverPrice) > 1
    }else if(activeProduct.value && activeProduct.value.type === TypeProduct.GROUP){
      price.value = calculateLocalPrice()
    }
  })

  onMounted(async () => {
    if (storeCity.city?.id) {
      city.value = storeCity.city
      await initialData(storeCity.city.id)
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
  <Header v-model:is-authorized="isAuthorized"
          v-model:role="isRole"/>
  <div class="main-subheader container">
    <div class="main-categories">
      <div class="main-subheader__category" v-for="category in categories">
        <a v-if="category.is_available"  :href="'#' + category.id" class="main-subheader__category-name">{{category.name}}</a>
      </div>
    </div>
    <div class="main-cart">
      <button @click="openModalCart" class="main-cart__btn btn--gradient">
        {{cart.length===0 ? "Корзина" : `${totalPriceCart()}\u00A0₽`}}
      </button>
    </div>
  </div>

  <main class="main container">
    <div class="main-category" v-for="category in categories" :key="category.id">
      <a v-if="category.is_available" class="main-category__name scroll-pt-9" :id="category.id">{{category.name}}</a>
      <div v-if="category.is_available"  class="main-category__products ">
        <button @click="openModalProduct(product)" type="button" class="main-category__product" v-for="product in category.products">
          <div class="main-category__product-container">
            <img
                :src="`${config.public.serverUrl}${getDisplayVariant(product)!.image}`"
                :alt="getDisplayVariant(product)!.size"
                v-if="getDisplayVariant(product)"
                class="w-24 shrink-0 sm:max-w-52 sm:w-full md:max-w-full aspect-square object-contain"
            />
          </div>
          <div class="main-category__product-container flex flex-col gap-2">
            <div class="main_category__product-container_text  flex flex-col">
              <p class="main-category__product-text font-extrabold text-md md:text-xl">{{product.name}}</p>
              <p class="main-category__product-text">{{product.type === TypeProduct.PIZZA && product.ingredients ? getStructure(product.ingredients) : product.description}}</p>
            </div>
            <div class="main_category__product-container_action flex justify-between items-center">
              <div class="main-category__product-text font-bold text-xl">от {{getMinPrice(product)}} ₽</div>
              <div class="btn--gradient hidden md:block">Выбрать</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  </main>

  <div v-if="modalMode === 'view'" class="modal-product">
    <div class="modal-product modal-product--active">
      <div class="modal-product__close cursor-pointer" @click="closeModal(true)">
        <CloseIcon class="closeModal"/>
      </div>
      <div class="modal-product__container">
        <div class="modal-product__img w-fit  mx-auto" >
          <img
              v-if="currentVariant"
              :src="`${config.public.serverUrl}${currentVariant.image}`"
              :alt="currentVariant.size"
              class="p-5  max-w-72 sm:w-full md:p-0 md:max-w-96 aspect-square object-contain"
              :class="activeProduct?.type === TypeProduct.PIZZA ? 'pizza': '' "
          />
        </div>
        <div class="modal-product__data sm:pb-7">
          <div class="modal-product__data--scroll">
            <div class="modal-product__title">{{ activeProduct!.type===TypeProduct.GROUP ? viewProduct.name : viewPizza.name}}</div>

            <div class="modal-product__text">
              <span
                  v-for="(ing, idx) in formattedIngredients"
                  :key="ing.id"
                  class="inline-flex items-center"
              >
                <button
                    v-if="ing.isDeleted"
                    @click="toggleDeletedIngredient(ing.id)"
                    type="button"
                    class="flex items-center gap-1 removed focus-visible:outline-none"
                    :class="{ 'removed-ingredient' : isLocallyDeleted(ing.id) }"
                >
                  {{ ing.name }}
                  <img
                      src="@assets/icons/deleted.svg"
                      :alt="`Убрать/Восстановить ${ing.name}`"
                  />
                </button>
                <span v-else>{{ ing.name }}</span>

                <span v-if="idx < formattedIngredients.length - 1">, </span>
              </span>
            </div>
            <ToggleInputParams
                v-if="activeProduct!.type===TypeProduct.GROUP"
                :options="viewProduct.variants"
                v-model="selectedVariantIndex"
            />
            <ToggleInputParams
                v-else
                :options="viewPizza.variants"
                v-model="selectedVariantIndex"
            />
            <ToggleInputDough  v-if="activeProduct!.type === TypeProduct.PIZZA" v-model="viewPizza.dough"/>
            <div class="modal-product__ingredients" v-if="activeProduct!.type === TypeProduct.PIZZA">
              <div class="modal-product__ingredient border-transparent border-2 h-full"
                   v-for="ing in selectedIngredients"
                   :key="ing.id"
                   :class="ing.quantity === 0 ? 'clickable' : 'ing-stroke'"
                   @click="ing.quantity === 0 && addCustomIngredient(ing)"
              >
                <div class="modal-product__ingredient-wrapper">
                  <div class="modal-product__ingredient-info">
                    <div class="modal-product__ingredient-quantity" v-if="ing.quantity>0" >
                      ×{{ing.quantity}}
                    </div>
                    <img
                        :src="`${config.public.serverUrl}${ing.image}`"
                        :alt="ing.name"
                        class="modal-product__ingredient-img"
                    />
                    {{ing.name}}
                  </div>
                  <div class="modal-product__ingredient-actions">
                    <button @click.stop="removeCustomIngredient(ing)" v-if="ing.quantity > 0"><img src="@assets/icons/minus.svg" :alt="'Убрать '+ ing.name"></button>
                    <p>{{ing.price}} ₽</p>
                    <button @click.stop="addCustomIngredient(ing)" v-if="ing.quantity > 0"><img src="../assets/icons/plus-orange.svg" :alt="'Добавить '+ ing.name"></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="showWarning">Цена изменилась. Отображается актуальная стоимость с сервера.</div>
          <div class="modal-product__container-btn">
            <button @click="addToUpdateCartItem(1)" class="modal-product__btn btn--gradient">В корзину за {{ price }} ₽</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-cart" v-if="modalModeCart ==='view'">
    <div class="modal-cart modal-cart--active relative">
      <div
          class="modal-cart__close "
          @click="closeModal(false)"
      >
        <CloseIcon class="w-6 h-6 fill-black opacity-20 md:fill-white md:opacity-100" />
      </div>
      <div class="modal-cart__container gap-4 h-full">
        <div class="flex flex-col justify-between gap-4 md:w-full h-full" v-if="cart.length > 0">
          <div class="modal-cart__top">
            <div class="modal-cart__cart">В корзине {{cart.reduce((sum, item) => sum + item.quantity, 0)}} товара</div>
            <div v-if="cart.length > 0" class="modal-cart__item" v-for="item in cart" :key="item.id">
              <img v-if="item.variant" :src="`${config.public.serverUrl}${item.variant.image}`"
                   :alt="item.variant.size"
                   class="modal-cart__ingredient-img">
              <div class="modal-cart__item-container">
                <div class="modal-cart__item-title">
                  {{item.name}}
                </div>
                <div class="modal-cart__item-text font-medium text-sm opacity-70 max-w-64">
                  {{item.variant?.size}}<span v-if="item.dough !== undefined">, {{TypeDoughLabels[item.dough]}} тесто</span>
                  <div class="modal-cart__item-added">
                <span class="modal-cart__item-added_ingr text-green" v-for="(ing, idx) in item.added_ingredients" :key="ing.id">
                  {{ing.quantity > 1 ? ing.quantity+'×': ''}} {{ing.ingredient ? ing.ingredient.name : ''}}<span v-if="idx < item.added_ingredients!.length - 1">, </span>
                </span>
                  </div>
                  <div class="modal-cart__item-removed text-red">
                <span class="modal-cart__item-removed_ingr line-through"  v-for="(ing, idx) in item.removed_ingredients" :key="ing.id">
                  {{ing.quantity > 1 ? ing.quantity: ''}} {{ing.ingredient ? ing.ingredient.name : ''}}<span v-if="idx < item.removed_ingredients!.length - 1">, </span>
                </span>
                  </div>
                </div>
                <div class="modal-cart__item-quantity">
                  <div class="modal-cart__item-quantity_container flex gap-2 ">
                    <button @click="addToUpdateCartItem(-1, item)" class="modal-cart__item-quantity_btn">
                      <img src="@assets/icons/minus.svg" :alt="'Уменьшить' + item">
                    </button>
                    {{item.quantity}}
                    <button @click="addToUpdateCartItem(1, item)" class="modal-cart__item-quantity_btn">
                      <img src="@assets/icons/plus-orange.svg" :alt="'Уменьшить' + item">
                    </button>
                  </div>
                  <div class="modal-cart__item-text">{{item.price! * item.quantity}} ₽</div>
                </div>

              </div>
            </div>
          </div>
          <div class="modal-cart__bottom">
            <div class="modal-cart__bottom__container">
              <span class="text-lg">Итого:</span>
              <span class="flex-grow mx-4 border-b border-dotted border-gray-300"></span>
              <span class="text-xl font-bold">{{ totalPriceCart() }} ₽</span>
            </div>
            <NuxtLink to="/order" class="flex btn--gradient justify-center items-center gap-2">
              <span>Оформить заказ</span>
              <ArrowRIcon class="text-white"/>
            </NuxtLink>
          </div>

        </div>

        <div v-else class="h-full">
          <div class="h-full flex flex-col justify-center items-center">
            <img class="mx-auto" src="@assets/images/empty-cart.png" alt="Пустая корзина">
            <p class="text-xl">Корзина пустая</p>
            <p class="opacity-40 max-w-72 text-center px-4">Добавьте хотя бы одну пиццу, чтобы совершить заказ</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="sass">
@use 'assets/styles/mixins' as *
.main
  @apply px-5 sm:px-[34px] flex flex-col gap-4

  &-subheader
    @apply sticky top-0 bg-white bg-opacity-60 backdrop-blur-2xl py-3
    @apply flex justify-between

    &__category
      &-name
        @apply text-xl hover:text-orange duration-300 cursor-pointer
  &-category
    @apply flex flex-col gap-3

    &__products
      @apply grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4;

    &__product
      @apply flex flex-row md:flex-col gap-2 md:justify-between border-b border-black border-opacity-5;
      @apply p-[15px] md:p-[30px] md:rounded-[45px] duration-300 cursor-pointer md:hover:shadow-[0_0_25px_0_rgba(177,177,177,0.1)];

      &-text
       @apply text-start text-sm md:text-base

      &-container:first-child
        @apply flex flex-row md:flex-col gap-3

    &__name
      @apply text-3xl font-bold scroll-pt-9
      display: block

  &-categories
    @apply flex gap-3 items-center overflow-x-auto

.modal-product
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]
  &__close
    @apply absolute top-5 right-5 fill-zinc-400 z-50

  &--active
    @apply bg-white overflow-y-auto lg:overflow-x-hidden lg:rounded-3xl lg:-translate-y-2/4 w-full lg:max-w-4xl xl:max-w-5xl lg:-translate-x-1/2 absolute
    @apply flex flex-col top-0 left-0 lg:top-1/2 lg:left-1/2 shadow-lg p-6 z-50 h-full lg:h-[90%]

  &__container
    @apply flex flex-col lg:flex-row h-full gap-3

  &__title
    @apply text-3xl

  &__text
    @apply flex gap-1 flex-wrap

  &__data
    @apply flex flex-col gap-6 relative

    &--scroll
      @apply flex flex-col gap-3 mb-20 lg:m-0 lg:overflow-y-auto lg:overflow-x-hidden
      max-height: calc(100% - 24px)
  & .pizza
    @apply w-full md:mt-0 lg:w-fit lg:max-w-[400px]
    @media screen and (max-width: 768px)
      margin-top: calc(-50% - 30px)
  &__container-btn
    @apply fixed bottom-0 left-0 lg:relative lg:m-0
    width: calc(100% - 48px)
  &__btn
    @apply m-6 w-full

  &__ingredients
    @apply grid grid-cols-2 sm:grid-cols-3 gap-2

  &__ingredient
    @apply object-contain text-center rounded-2xl w-36 m-auto
    &-info
      @apply text-sm sm:text-base
    &-img
      @apply m-auto w-16 h-16

    &-wrapper
      @apply relative p-2 flex flex-col justify-between h-full
    &-actions
      @apply flex gap-2 justify-center items-center whitespace-nowrap h-7

      button
        @apply border-gray border-2 rounded-full hover:border-orange duration-300 ease-in w-7 h-7
        img
          @apply m-auto

    &-quantity
      @apply absolute top-1 left-1 bg-orange rounded-full w-7 h-7 text-white text-center leading-7
  .closeModal
    @apply fill-black opacity-20 absolute top-0 right-0 lg:-right-16 lg:fill-white lg:opacity-100

.modal-cart
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]

  &--active
    @apply bg-lightGray absolute left-auto right-0 top-0 shadow-lg z-50
    @apply w-full md:w-fit

  .closeModal
    @apply fill-black opacity-20 relative md:fill-white md:opacity-100

  &__container
    @apply w-full md:w-max flex flex-col gap-3 overflow-auto

  &__cart
    @apply px-6

  &__close
    @apply absolute top-3 right-3 md:top-1/2 md:-left-10 md:right-auto cursor-pointer z-50

  &__top
    @apply flex flex-col gap-4 pt-4

  &__bottom
    @apply bg-white p-4 flex flex-col gap-5
    &__container
      @apply flex
  &__item
    @apply flex items-center gap-3 bg-white p-4

    &-container
      @apply flex flex-col w-full

    &-quantity
      @apply flex items-center justify-between

      &_btn
        @apply w-6 h-6 border border-orange rounded-lg

        img
          @apply mx-auto

  &__ingredient

    &-img
      @apply max-w-16 max-h-16 aspect-square object-contain

.container
  @apply px-5 sm:px-[34px]

.modal-product.closeModal, .modal-cart.closeModal
  @apply absolute top-5 right-5 fill-zinc-400 z-50

.btn--gradient
  @include button-orange-gradient

.removed
  @apply decoration-dashed underline underline-offset-4;

.removed-ingredient
  @apply line-through decoration-solid decoration-red

html
  @apply scroll-smooth
  scroll-padding-top: 80px

.closeModal
  @apply fill-black opacity-20 lg:fill-white lg:opacity-100;

.ing-stroke
  @apply rounded-2xl border-orange border-2
</style>
