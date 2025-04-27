<script setup lang="ts">

import SideBarAdmin from "@components/SideBarAdmin.vue";
import {useUser} from "@composable/useUser";
import { useRouter } from 'vue-router';
const isLoading = ref<boolean>(false);
const UseUser = useUser()
const router = useRouter()

const validateToken = async () => {
  const res = await UseUser.fetchUser();
  if (res.result && res.role !== 4){
    await router.push('/')
  }
}

onMounted(async ()=>{
  await validateToken();
  isLoading.value = true
})
</script>

<template>
<div v-if="isLoading" class="bg-background-secondary h-dvh flex">
    <SideBarAdmin></SideBarAdmin>
    <div class="containerA">
        <NuxtPage></NuxtPage>
    </div>
  </div>
<div v-else >Сервер не отвечает</div>
</template>

<style scoped lang="sass">
  .containerA
    @apply bg-lightGray min-h-screen w-full
</style>