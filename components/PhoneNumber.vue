<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const modelValue = defineModel<string>({ default: '' })
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const formatPhone = (digits: string): string => {
  digits = digits.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11)
  if (!digits) return ''

  const parts = ['+7']
  if (digits.length > 1) parts.push(' (' + digits.slice(1, 4))
  if (digits.length >= 4) parts.push(') ' + digits.slice(4, 7))
  if (digits.length >= 7) parts.push('-' + digits.slice(7, 9))
  if (digits.length >= 9) parts.push('-' + digits.slice(9, 11))

  return parts.join('')
}

const normalizeDigits = (value: string): string => {
  let digits = value.replace(/\D/g, '')
  if (!digits.startsWith('7')) {
    digits = '7' + digits.replace(/^8|^7/, '')
  }
  return digits.slice(0, 11)
}

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const digits = normalizeDigits(target.value)
  modelValue.value = digits
  error.value = digits.length < 11 ? 'Введите полный номер из 11 цифр' : ''
}

const updateInputField = () => {
  const el = inputRef.value
  if (el) el.value = formatPhone(modelValue.value)
}

watch(modelValue, () => {
  updateInputField()
})

onMounted(() => {
  if (modelValue.value) {
    modelValue.value = normalizeDigits(modelValue.value)
    updateInputField()
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <input
      ref="inputRef"
      type="tel"
      @input="onInput"
      placeholder="+7 (___) ___-__-__"
      maxlength="18"
      class="border rounded-full px-4 py-2 w-full"
    />
    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
  </div>
</template>

<style scoped lang="sass">
input
  @apply border border-solid border-orange w-full
  //&:focus-visible


</style>
