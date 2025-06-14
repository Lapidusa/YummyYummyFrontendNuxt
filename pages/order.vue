<script setup lang="ts">
  import {onMounted, ref, watch} from "vue";
  import {useCityStore} from "@store/city";
  import {type CartItemRequest, createEmptyCartItem} from "@interfaces/cart";
  import {useCartItem} from "@composable/useCart";
  import {TypeDoughLabels} from "@interfaces/product";
  import {createEmptyUser, type User} from "@interfaces/user";
  import {useUserStore} from "@store/user";
  import {createEmptyOrderAddress, type OrderAddress} from "@interfaces/order";
  import {useStore} from "@composable/useStore";
  import type {Store} from "@interfaces/store";
  import {useOrder} from "@composable/useOrder";
  import {useRouter} from "vue-router";
  const config = useRuntimeConfig();

  const userStore = useUserStore();
  const storeCity = useCityStore();
  const UseCartItem = useCartItem();
  const UseStore = useStore();
  const UseOrder = useOrder();
  const router = useRouter()
  const cart = reactive<CartItemRequest[]>([]);

  const userData = computed<User | null>(() => userStore.user);
  const user = reactive<User>(createEmptyUser());
  const orderAddress = reactive<OrderAddress>(createEmptyOrderAddress())
  const allStores = ref<Store[]>([])
  const selectedStore = ref<string | null>(null)

  const isAuthorized = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const submitted = ref<boolean>(false);
  const isPickup = ref<boolean>(false);

  const initialData = async () => {
    fillFormWithUser(userData.value)
    const cartRes = await UseCartItem.getCart()
    cart.splice(0, cart.length, ...(cartRes.cart ?? []));

    cart.splice(0)
    cart.push(...(cartRes.cart ?? []));
    if (storeCity.city){
      const data = await UseStore.getStoresByCityId(storeCity.city.id);
      allStores.value = data.stores;
      selectedStore.value = allStores.value[0].id
    }
  }

  const fillFormWithUser = (userData: any) => {
    if (!userData) return;
    user.phone_number = userData.phone_number
    user.name = userData.name || ''
    user.email = userData.email || ''
  }

  const cartItemValue = (data: CartItemRequest): CartItemRequest => {
    const payload: CartItemRequest = createEmptyCartItem()
    payload.type = data.type

    if (data) {
      payload.product_variant_id = data.variant!.id;
      payload.quantity = data.quantity;
      if (payload.type === 'pizza') {
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
    }
    return payload
  }

  const addToUpdateCartItem = async (amount: number, item: CartItemRequest) => {
    const payload = cartItemValue(item);

    if (item) {
      payload.quantity = amount;
      payload.product_variant_id = item.variant!.id
    }
    if (payload.type === 'simple') {
      delete payload.dough;
      delete payload.added_ingredients;
      delete payload.removed_ingredients;
    }
    delete payload.name;
    const res = await UseCartItem.addCartItem(payload);
    if (res.result) {
      await initialData()
      await router.push('/')
    }
  };

  function totalPriceCart(){
    return cart.reduce((sum, item) => sum + (item.quantity * item.price!), 0)
  }

  async function createOrder(e: Event) {
    e.preventDefault();
    submitted.value = true;

    if (!userData.value) {
      alert("Нужно залогиниться!");
      return;
    }
    const itemsPayload = cart.map(cartItemValue);

    const payload = {
      user_id: userData.value.id,
      is_pickup: isPickup.value,
      store_id: isPickup.value ? selectedStore.value : null,
      address: isPickup.value ? null : {
        street: orderAddress.street,
        house: orderAddress.house,
        apartment: orderAddress.apartment,
        comment: orderAddress.comment
      },
      items: itemsPayload,
      payment_method: 0
    };
    const res = await UseOrder.createOrder(payload);
    if(res.result){
      alert("Заказ создан")
      await router.push('/')
    }
  }

  watch(isAuthorized, async () => {
    if(storeCity.city) await initialData()
    if(!isAuthorized) isLoading.value = false
  })

  watch(
    () => userData.value,
    (newUser) => {
      if (newUser) {
        fillFormWithUser(newUser)
      }
    }
  )
  onMounted(async () => {
    await initialData()
    document.body.style.overflow = ''
  })
</script>

<template>
  <Header v-model:isAuthorized="isAuthorized"/>
  <form @submit="createOrder" :class="{ 'submitted': submitted }" class="order order__container container">
    <div class="order__wrapper">
      <div class="order__title">Оформление заказа</div>
      <div class="order__step order__step--1">
        <p class="order__subtitle">1. Корзина</p>
        <div class="order__cart" v-for="item in cart">
          <div class="order__cart-container">
            <img v-if="item.variant" :src="`${config.public.serverUrl}${item.variant.image}`"
                 :alt="item.variant.size"
                 class="order__item-img">
            <div class="order__item order__item-container">
              <div class="order__item-title">
                {{item.name}}
              </div>
              <div class="order__item-text  text-sm opacity-70 max-w-64">
                {{item.variant?.size}}<span v-if="item.dough !== undefined">, {{TypeDoughLabels[item.dough]}} тесто</span>
                <div class="order__item-added">
                <span class="order__item-added_ingr text-green font-light" v-for="(ing, idx) in item.added_ingredients" :key="ing.id">
                  {{ing.quantity > 1 ? ing.quantity+'×': ''}} {{ing.ingredient ? ing.ingredient.name : ''}}<span v-if="idx < item.added_ingredients!.length - 1">, </span>
                </span>
                </div>
                <div class="order__item-removed text-red">
                <span class="order__item-removed_ingr line-through"  v-for="(ing, idx) in item.removed_ingredients" :key="ing.id">
                  {{ing.ingredient ? ing.ingredient.name : ''}}<span v-if="idx < item.removed_ingredients!.length - 1">, </span>
                </span>
                </div>
              </div>
          </div>
          </div>
          <div class="order__item-quantity">
            <div class="order__item-text">{{item.price! * item.quantity}}&nbsp;₽</div>
            <div class="order__item-quantity_container flex gap-2 ">
              <button @click.prevent="addToUpdateCartItem(-1, item)" class="order__item-quantity_btn">
                <img src="@assets/icons/minus.svg" :alt="'Уменьшить' + item">
              </button>
              {{item.quantity}}
              <button @click.prevent="addToUpdateCartItem(1, item)" class="order__item-quantity_btn">
                <img src="@assets/icons/plus-orange.svg" :alt="'Уменьшить' + item">
              </button>
            </div>
          </div>
        </div>
      </div>
      <span class="flex-grow border-b border-solid border-zinc-300"></span>
      <div class="order__step order__step--2 ">
        <p class="order__subtitle">2. Персональная информация</p>
        <div class="order__inputs grid grid-cols-1 sm:grid-cols-2 gap-3" v-if="user">
          <label>
            Имя
            <input type="text" v-model="user.name">
          </label>
          <label>
            E-Mail
            <input type="text" v-model="user.email">
          </label>
          <label>
            Телефон
            <PhoneNumber v-model="user.phone_number"/>
          </label>
        </div>
      </div>
      <span class="flex-grow border-b border-solid border-zinc-300"></span>
      <div class="order__step order__step--3">
        <p class="order__subtitle">3. Адрес доставки</p>
        <div class="order__toggle flex items-center gap-3 mb-4">
          <label class="toggle-label">
            <input type="radio" v-model="isPickup" :value="false" />
            <span>Доставка</span>
          </label>
          <label class="toggle-label">
            <input type="radio" v-model="isPickup" :value="true" />
            <span>Самовывоз</span>
          </label>
        </div>
        <div class="order__inputs flex flex-col gap-3" v-if="orderAddress && !isPickup">
          <div class="order__inputs-container grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label>
              Улица
              <input type="text" required v-model="orderAddress.street">
              <span class="error">Введите улицу</span>
            </label>
            <label>
              Дом/корпус
              <input type="text" required v-model="orderAddress.house">
              <span class="error">Введите дом/корпус</span>
            </label>
            <label>
              Квартира
              <input type="text" required v-model="orderAddress.apartment">
              <span class="error">Введите квартиру</span>
            </label>
          </div>
          <label class="flex flex-col ">
            Комментарий
            <textarea v-model="orderAddress.comment" class="overflow-hidden resize-y border-2 border-orange min-h-16 rounded-2xl p-3 focus-within:outline-none"></textarea>
          </label>
        </div>
        <div class="order__pickup mt-4" v-else>
          <p class="font-medium mb-2">Выберите пункт самовывоза</p>
          <select v-model="selectedStore" class="w-full focus-within:outline-none p-2 border-2 border-orange rounded-full">
            <option v-for="store in allStores" :key="store.id" :value="store.id">
              {{ store.address }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="order__wrapper  md:max-w-64 w-full bg-lightGray rounded-2xl p-5 flex flex-col gap-3">
      <p class="text-lg">Итого:</p>
      <p class="text-xl font-extrabold">{{totalPriceCart()}}&nbsp;₽</p>
      <span class="flex-grow border-b border-solid border-zinc-300"></span>
      <div class="flex">
        <span class="text-base">Итого:</span>
        <span class="flex-grow border-b border-dotted border-zinc-300"></span>
        <span class="text-base font-bold">{{ totalPriceCart() }} ₽</span>
      </div>
      <div class="flex">
        <span class="text-base">Доставка:</span>
        <span class="flex-grow border-b border-dotted border-zinc-300"></span>
        <span class="text-base font-bold">бесплатная</span>
      </div>
      <button type="submit" class="flex btn--gradient justify-center items-center gap-2">
        <span>Заказать</span>
        <ArrowRIcon class="text-white"/>
      </button>
    </div>
  </form>
</template>

<style scoped lang="sass">
  @use 'assets/styles/mixins' as *
  html
    overflow: auto
  .order
    &__container
      @apply flex flex-col md:flex-row gap-6 items-baseline justify-between mb-0 sm:mb-10
    &__wrapper
      @apply w-full md:w-fit flex flex-col gap-3
    &__title
      @apply text-2xl font-extrabold

    &__subtitle
      @apply text-lg sm:text-xl font-bold

    &__cart
      @apply flex justify-between items-center gap-4

      &-container
        @apply flex gap-4
    &__inputs
      &-container
        & span
          @apply hidden text-red text-xs
    & .submitted
      .order__inputs-container input:required
        @apply border-red
      .order__inputs-container input:required + span
        @apply block
    &__item
      @apply max-w-64 w-full

      &-text
        @apply  text-sm sm:text-base

      &-quantity
        @apply flex gap-4 grow justify-end

        &_btn
          @apply shrink-0

      &-img
        @apply max-w-16 object-contain aspect-square
    &__step
      @apply flex flex-col gap-2

  .toggle-label input[type="radio"]
    opacity: 0
    position: absolute
    width: 0
    height: 0

  .toggle-label
    position: relative
    padding-left: 28px
    cursor: pointer
    user-select: none

  .toggle-label span::before
    content: ''
    position: absolute
    left: 0
    top: 50%
    transform: translateY(-50%)
    width: 16px
    height: 16px
    border: 2px solid #ccc
    border-radius: 50%

  .toggle-label input[type="radio"]:checked + span::before
    background-color: #ff6600
    border-color: #ff6600

  .error
    color: #e00
    font-size: 0.875rem
    margin-top: 4px
    display: block

</style>