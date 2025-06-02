<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
const config = useRuntimeConfig()
const props = defineProps<{
  modelValue: File | string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const previewUrl = ref<string | null>(null)

// Обновляем превью при modelValue
watch(
  () => props.modelValue,
  (file) => {

    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file)
      previewUrl.value = objectUrl
    } else if (typeof file === 'string') {
      previewUrl.value = `${config.public.serverUrl}${file}`
      console.log(previewUrl.value)// путь к изображению на сервере
    } else {
      previewUrl.value = null
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

function triggerFileInput() {
  fileInput.value?.click()
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('update:modelValue', file)
  }
}

function onDragOver() {
  isDragging.value = true
}
function onDragLeave() {
  isDragging.value = false
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('update:modelValue', file)
  }
}
</script>
<template>
  <div
    class="relative border-2 border-dashed rounded-xl p-2 text-center cursor-pointer transition hover:bg-gray-50"
    @click="triggerFileInput"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    :class="{ 'border-blue-500 bg-blue-50': isDragging }"
  >
    <input
      ref="fileInput"
      class="hidden"
      type="file"
      accept="image/*"
      @change="handleFileUpload"
    />
    <div v-if="previewUrl">
      <img :src="previewUrl" alt="Превью" class="mx-auto max-h-24 object-contain" />
      <p class="text-sm text-gray-500 mt-2">Изменить</p>
    </div>
    <div v-else>
      <p class="text-gray-400">Перетащите изображение сюда или кликните, чтобы выбрать</p>
    </div>
  </div>
</template>
