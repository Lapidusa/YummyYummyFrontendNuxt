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
  const exclude = EXCLUDE_STATUS_CODES.map(code => -code)
  const { orders: list } = await getOrdersByStoreIdWithFilter(
      selectedStore.value,
      exclude
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
          class="p-4 border-2 border-gray rounded-2xl bg-white"
      >
        <h3 class="text-lg font-semibold">Заказ №{{ order.id }}</h3>
        <p>Дата: {{ new Date(order.created_at).toLocaleString() }}</p>
        <p>Сумма: {{ order.total_price }} ₽</p>

        <div class="mt-2">
          <label class="mr-2">Статус:</label>
          <select
              v-model.number="order.status"
              @change="onStatusChange(order)"
              class="px-2 py-1 p-3 rounded-full border-2  focus-within:outline-none"
              :class="order.status===0?'border-blue-600':'border-orange'"
          >
            <option
                v-for="(label, code) in OrderStatusLabels"
                :key="code"
                :value="Number(code)"
            >
              {{ label }}
            </option>
          </select>
        </div>

        <div class="border-2 border-orange rounded-xl p-3 mt-3">
          <div v-for="item in order.items" :key="item.product_variant_id">
            {{ item.product_name }} — {{item.variant_size}} — {{ item.quantity }} шт. — {{ item.price_per_item }}₽
          </div>
        </div>
      </div>
    </div>

    <p v-else>Нет активных заказов.</p>
  </div>
</template>