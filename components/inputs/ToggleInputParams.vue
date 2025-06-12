<!-- components/ToggleButton.vue -->
<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'

interface Option {
  size: string
}

const props = defineProps<{
  options: Option[]
  modelValue?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const selectedIndex = computed<number>({
  get: () => props.modelValue ?? 0,
  set: idx => emit('update:modelValue', idx),
})
</script>

<template>
  <div class="toggle w-full">
    <div class="toggle__container flex w-full p-1 rounded-full bg-gray transition-all duration-300 ease-in-out">
      <div
          v-for="(opt, idx) in options"
          :key="idx"
          class="toggle__container-btn flex-1 text-center p-2 cursor-pointer transition-shadow duration-200"
          :class="{
          'bg-white rounded-full shadow-md': selectedIndex === idx
        }"
          @click="selectedIndex = idx"
      >
        <span
            class="toggle__button text-sm sm:text-base font-medium transition-colors duration-300 ease-in-out"
            :class="selectedIndex === idx ? 'text-black' : 'text-slate-700'"
        >
          {{ opt.size }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.toggle
  &__container
    @apply relative flex w-full
  &__container-btn
    @apply flex-1
  &__button
    @apply block
</style>
