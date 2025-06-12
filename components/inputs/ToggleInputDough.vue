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
</script>
<template>
  <div class="toggle">
    <div class="toggle__container">
      <button class="toggle__container-btn"
          :ref="el => buttonRefs[option] = el as HTMLElement"
          @click="modelValue = option"
          type="button" v-for="option in options" :key="option"
          :class="{ active: modelValue === option }">
          {{ TypeDoughLabels[option] }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="sass">
.toggle
  @apply w-full
  &__button
    @apply relative z-10 m-auto text-base font-medium text-slate-700  transition-colors duration-300 ease-in-out whitespace-nowrap

.toggle__container
  @apply relative inline-flex p-1 rounded-full w-full bg-gray transition-all duration-300 ease-in-out
  &-btn
    @apply flex-1 text-center p-2 text-sm sm:text-base
    &.active
      @apply  bg-white rounded-full shadow-md
      .toggle__button
        @apply text-black
  &__button
    @apply w-full h-full
  &__highlight
    @apply absolute top-1 bottom-1 rounded-full z-0 transition-all duration-300 ease-in-out


</style>
