<script setup lang="ts">
import { ref } from 'vue'
import {useUser} from "@composable/useUser";
import {useUserStore} from "@store/user";
import { useRouter } from 'vue-router'

const router = useRouter()
const { updateUser } = useUser()
const config = useRuntimeConfig()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const form = ref({
  phone: undefined as string | undefined,
  name: undefined as string | undefined,
  email: undefined as string | undefined,
  date_of_birth: undefined as string | undefined,
  image: null as File | null,
})

const fillFormWithUser = (userData: any) => {
  console.log(userData.phone_number)
  form.value.phone = formatPhone(userData.phone_number) || ''
  form.value.name = userData.name || ''
  form.value.email = userData.email || ''
  form.value.date_of_birth = userData.date_of_birth?.split('T')[0] || ''
  form.value.image = userData.image_url || ''
}

const handleFileUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files && files.length > 0) {
    form.value.image = files[0]
  }
}
const stripPhone = (masked: string = '') => masked.replace(/\D/g, '')

const submitForm = async () => {
  const formData = new FormData()
  if (form.value.phone) formData.append('phone_number', stripPhone(form.value.phone))
  if (form.value.name) formData.append('name', form.value.name)
  if (form.value.email) formData.append('email', form.value.email)
  if (form.value.date_of_birth) formData.append('date_of_birth', form.value.date_of_birth)
  if (form.value.image) formData.append('image', form.value.image)
  const res = await updateUser(formData);
  console.log([...formData.entries()])

}

onMounted(() =>{
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/')
  }
  watchEffect(() => {
    if (user.value && user.value.name) {
      console.log(user.value)

      fillFormWithUser(user.value)
    }
  })
})
</script>

<template>
  <div class="profile">
    <Header />
    <form class="profile__form" @submit.prevent="submitForm" enctype="multipart/form-data">
      <h2 class="profile__title">Личные данные</h2>
      <img  v-if="user && user.imageUrl" :src="config.public.serverUrl + user.imageUrl" alt="Аватар пользователя" />
      <div class="profile__field">
        <label class="profile__label" for="avatar">Аватар</label>
        <input class="profile__input" id="avatar" type="file" accept="image/*" @change="handleFileUpload" />
      </div>
      <div class="profile__row">
        <PhoneNumber v-model="form.phone" />

        <div class="profile__field">
          <label class="profile__label" for="name">Имя</label>
          <input class="profile__input" id="name" type="text" v-model="form.name" />
        </div>

        <div class="profile__field">
          <label class="profile__label" for="email">Почта</label>
          <input class="profile__input" id="email" type="email" v-model="form.email" />
        </div>
      </div>

      <div class="profile__row">
        <div class="profile__field">
          <label class="profile__label" for="birthday">Дата рождения</label>
          <input class="profile__input" id="birthday" type="date" v-model="form.date_of_birth" />
        </div>
      </div>
      <button class="profile__submit" type="submit">Сохранить</button>
    </form>
  </div>
</template>


<style scoped lang="sass">
.profile
  @apply flex flex-col
</style>