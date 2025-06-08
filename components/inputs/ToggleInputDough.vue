<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { Dough, TypeDoughLabels } from '@interfaces/product'

const modelValue = defineModel<Dough>()

if (!modelValue.value) modelValue.value = Dough.THICK_DOUGH

const options = [Dough.THICK_DOUGH, Dough.THIN_DOUGH] as const

const buttonRefs = ref<Record<Dough, HTMLElement | null>>({
  [Dough.THICK_DOUGH]: null,
  [Dough.THIN_DOUGH]: null
})

const widths = ref<Record<Dough, string>>({
  [Dough.THICK_DOUGH]: '0px',
  [Dough.THIN_DOUGH]: '0px'
})

const positions = ref<Record<Dough, string>>({
  [Dough.THICK_DOUGH]: '0px',
  [Dough.THIN_DOUGH]: '0px'
})

function updatePositions() {
  nextTick(() => {
    for (const key of options) {
      const el = buttonRefs.value[key]
      if (el) {
        widths.value[key] = `${el.offsetWidth}px`
        positions.value[key] = `${el.offsetLeft}px`
      }
    }
  })
}

onMounted(updatePositions)
watch(modelValue, updatePositions)
</script>

<template>
  <div class="toggle">
    <div class="toggle__container">
      <div
        class="toggle__highlight"
        :style="{
          width: widths[modelValue!],
          left: positions[modelValue!]
        }"
      />
      <button
        v-for="option in options"
        :key="option"
        class="toggle__button"
        :class="{ active: modelValue === option }"
        :ref="el => buttonRefs[option] = el as HTMLElement"
        @click="modelValue = option"
      >
        {{ TypeDoughLabels[option] }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="sass">
.toggle
  @apply inline-block

.toggle__container
  @apply relative inline-flex rounded-full bg-gray p-1 transition-all duration-300 ease-in-out

.toggle__highlight
  @apply absolute top-1 bottom-1 rounded-full z-0 transition-all duration-300 ease-in-out
  background: linear-gradient(to right, #FFC746, #FE9200)
.toggle__button
  @apply relative z-10 px-4 py-1 text-base font-medium text-slate-700 rounded-full transition-colors duration-300 ease-in-out
  white-space: nowrap

  &.active
    @apply text-white
</style>
