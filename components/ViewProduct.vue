<script setup lang="ts">
import {createEmptyPizza, createEmptyProduct, type Pizza, type Product} from "@interfaces/product";
  const config = useRuntimeConfig()

  const modalMode = ref<'none' | 'view' | 'update' | 'delete'>('none')
  const product = reactive<Product>(createEmptyProduct());
  const pizza = reactive<Pizza>(createEmptyPizza());
  const error = ref<string>('');

  const props = defineProps<{
    products: Product[]
    isEdit: boolean
  }>()

  const openModal = async (mode: typeof modalMode.value, data?: Product) => {
    modalMode.value = mode;
    if (data) {
      Object.assign(product, structuredClone(data));
    } else {
      Object.assign(product, createEmptyProduct());
      Object.assign(pizza, createEmptyPizza());
    }
  }

  const closeModal = () => {
    modalMode.value = 'none';
    error.value = '';
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
</script>

<template>
  <div class="view-products">
    <div class="view-product" v-for="product in props.products" :key="product.id">
      <img
        :src="`${config.public.serverUrl}/media/products/${getDisplayVariant(product)!.image}`"
        :alt="getDisplayVariant(product)!.size"
        v-if="product.variants"
        class="w-72 h-72 object-cover rounded-3xl shadow"
      />
      <div class="view-product__down">
        <div class="view-product__down-text">
          <p>{{product.name}}</p>
          <p>от {{getMinPrice(product)}} ₽</p>
        </div>
        <div class="view-product__down-actions" v-if="isEdit">
          <button class="view-product__down-btn view-product__btn--update" @click="openModal('update')">
            <img src="@assets/icons/update.svg" alt="update" />
          </button>
          <button class="view-product__down-btn view-product__btn--delete" @click="openModal('delete')">
            <img src="@assets/icons/delete.svg" alt="delete" />
          </button>
        </div>
      </div>
    </div>
  </div>
  .
</template>

<style scoped lang="sass">
.view-products
  @apply grid 2xl:grid-cols-5 xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-8

.view-product__down
  @apply flex justify-between items-center

  &-actions
    @apply flex gap-3

  &-btn
    @apply p-2 hover:bg-white hover:shadow-sm rounded-full
</style>