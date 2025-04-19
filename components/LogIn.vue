<script setup lang="ts">
import { ref } from "vue"
import { useAuth } from "@composable/useAuth"

const phone = ref<string>("")
const code = ref<string>("")
const status = ref<string>("")
const isCodeSent = ref<boolean>(false)

const { sendSms, verifyCode } = useAuth()

const sendCode = async () => {
  try {
    const res = await sendSms({ phone_number: phone.value })
    status.value = res.message
    isCodeSent.value = true
  } catch (e: any) {
    status.value = "Ошибка при отправке СМС"
  }
}

const confirmCode = async () => {
  try {
    const res = await verifyCode({ phone_number: phone.value, code: code.value })
    status.value = res.message
  } catch (e: any) {
    status.value = "Ошибка при верификации"
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto p-4 space-y-4">
    <h1 class="text-xl font-bold">Авторизация</h1>

    <input
      type="text"
      v-model="phone"
      placeholder="Номер телефона"
      class="w-full border p-2 rounded"
    />
    <button
      @click="sendCode"
      class="bg-blue-500 text-white px-4 py-2 rounded w-full"
    >
      Отправить СМС
    </button>

    <div v-if="isCodeSent" class="space-y-2">
      <input
        type="text"
        v-model="code"
        placeholder="Код подтверждения"
        class="w-full border p-2 rounded"
      />
      <button
        @click="confirmCode"
        class="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Подтвердить
      </button>
    </div>

    <p class="text-sm text-gray-700 mt-2">{{ status }}</p>
  </div>
</template>

<style scoped>
input:focus {
  outline: none;
  border-color: #60a5fa;
}
</style>
