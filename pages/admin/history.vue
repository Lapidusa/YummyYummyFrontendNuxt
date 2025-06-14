<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useCityStore } from '@store/city'
import { useStore }     from '@composable/useStore'
import { useOrder }     from '@composable/useOrder'
import {OrderStatus, type Order, OrderStatusLabels} from '@interfaces/order'
import type {Store} from '@interfaces/store'

const storeCity = useCityStore()
const UseStore = useStore()
const { getOrdersByStoreIdWithFilter, updateOrderStatus } = useOrder()

const allStores = ref<Store[]>([])
const selectedStore = ref<string | null>(null)
const orders = ref<Order[]>([])
const EXCLUDE_STATUS_CODES = [2, 3]

async function loadStores() {
  storeCity.initCityFromStorage()
  if (!storeCity.city) return
  const { stores } = await UseStore.getStoresByCityId(storeCity.city.id)
  allStores.value = stores
  selectedStore.value = stores[0]?.id || null
}

async function loadOrders() {
  if (!selectedStore.value) return
  const { orders: list } = await getOrdersByStoreIdWithFilter(
      selectedStore.value,
      EXCLUDE_STATUS_CODES
  )
  orders.value = list || []
}

async function onStatusChange(order: Order) {
  await updateOrderStatus({ id_order: order.id, status: order.status })
  await loadOrders()
}

watch(selectedStore, () => loadOrders())
onMounted(async () => {
  await loadStores()
  await loadOrders()
})
</script>

<template>
  <div class="order-page">
    <!-- выбор магазина -->
    <div class="mb-4 flex items-center">
      <p class="font-medium mr-2">Пункт самовывоза:</p>
      <select v-model="selectedStore" class="grow p-3 rounded-full border-2 border-orange focus-within:outline-none">
        <option v-for="s in allStores" :key="s.id" :value="s.id">
          {{ s.address }}
        </option>
      </select>
    </div>

    <div v-if="orders.length" class="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
          v-for="order in orders"
          :key="order.id"
          class="p-4 border-2 border-orange rounded-2xl bg-white"
      >
        <div class="flex justify-between">
          <h3 class="text-lg font-semibold">Заказ №{{ order.id }}</h3>
          <span :class="order.status===2?'text-green':'text-red'">
            {{ OrderStatusLabels[order.status] }}
          </span>
        </div>

        <p>Дата: {{ new Date(order.created_at).toLocaleString() }}</p>
        <p>Сумма: {{ order.total_price }} ₽</p>
        <ul class="mt-4 list-disc pl-5">
          <li v-for="item in order.items" :key="item.product_variant_id">
            {{ item.product_variant_id }} — {{ item.quantity }} шт. — {{ item.price_per_item }}₽
          </li>
        </ul>
      </div>
    </div>

    <p v-else>Нет активных заказов.</p>
  </div>
</template>
