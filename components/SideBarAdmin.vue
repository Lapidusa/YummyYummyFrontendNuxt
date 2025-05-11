<script setup lang="ts">
import Logo from "@components/Logo.vue";
</script>

<template>
  <div class="sidebar">
    <Logo />

    <ul class="sidebar__list">
      <NuxtLink to="/admin/home" class="sidebar__link">Главная</NuxtLink>
      <NuxtLink to="/admin/cities" class="sidebar__link">Города</NuxtLink>
      <NuxtLink to="/admin/orders" class="sidebar__link">Заказы</NuxtLink>
      <NuxtLink to="/admin/history" class="sidebar__link">История</NuxtLink>
    </ul>
    <NuxtLink to="/admin/profile" class="sidebar__link">Профиль</NuxtLink>
  </div>
</template>


<style scoped lang="sass">
.sidebar
  @apply flex flex-col justify-between py-3 px-2
  box-shadow: 0 6px 3px 0 rgba(0, 0, 0, 1)
  &__list
    @apply flex flex-col gap-1
  &__link
    @apply py-2 px-4 rounded hover:bg-orange hover:bg-opacity-10 transition-colors duration-200 text-orange font-semibold
    &.router-link-active
      @apply bg-orange text-white font-bold
      &:hover
        @apply opacity-90
</style>