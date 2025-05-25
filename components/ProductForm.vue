<script setup lang="ts">
import type {Category} from "@interfaces/category";

const props =defineProps<{
  modalValue?: boolean
  type:'add' | 'edit' | 'delete'
  data?: Category | null
}>()
</script>

<template>

</template>

<style scoped lang="sass">

</style>