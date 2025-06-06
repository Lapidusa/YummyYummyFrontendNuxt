<script setup lang="ts">
const modelValue = defineModel<boolean>()

</script>

<template>
  <div class="toggle" :class="{ checked: modelValue }">
    <input type="checkbox" class="toggle__checkbox" v-model="modelValue" />
    <div class="toggle__knobs"></div>
    <div class="toggle__layer"></div>
  </div>
</template>

<style scoped lang="sass">
.toggle
  @apply rounded-full overflow-hidden bg-white relative transition-all
  width: 74px
  height: 36px
  box-shadow: 0 10px 20px -8px #c5d6d6

  &__checkbox
    @apply absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10

  &__knobs
    @apply absolute top-[6px] left-[10px] w-6 h-6 bg-center bg-no-repeat bg-contain transition-all duration-300 ease-in
    background-image: url('@icons/dim-pizza.svg')
    z-index: 1

  &__layer
    @apply absolute inset-0 w-full h-full transition-all duration-300 ease-in
    background-color: #e2e8f0 // светло-серый

  &.checked
    .toggle__knobs
      left: 40px
      background-image: url('@icons/color-pizza.svg')

    .toggle__layer
      background-color: #fde7c5
</style>
