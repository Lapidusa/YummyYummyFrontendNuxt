<script setup lang="ts">
import SideBarAdmin from "@components/SideBarAdmin.vue";
import { useUser } from "@composable/useUser";
import { useRouter } from "vue-router";

const isLoading = ref(false);
const UseUser = useUser();
const router = useRouter();

const validateToken = async () => {
  const res = await UseUser.fetchUser();
  if (!res.result || res.user.role !== 4) {
    await router.push("/");
  }
};

onMounted(async () => {
  await validateToken();
  isLoading.value = true;
});
</script>

<template>
  <div
      v-if="isLoading"
      class="bg-background-secondary ml-[157px] h-screen"
  >
    <SideBarAdmin />
    <div class="containerA flex-1">
      <NuxtPage />
    </div>
  </div>
  <div v-else>Сервер не отвечает</div>
</template>

<style scoped lang="sass">
.containerA
  @apply bg-lightGray min-h-screen
  width: calc(100vw - 180px)
</style>
