<script setup lang="ts">
import { ref } from 'vue'
import {useUser} from "@composable/useUser";
import {useUserStore} from "@store/user";
import { useRouter } from 'vue-router'

const router = useRouter()
const { updateUser } = useUser()
const config = useRuntimeConfig()
const userStore = useUserStore()
const errorUpdate = ref<string>("");
const successUpdate  = ref<string>("");
const user = computed(() => userStore.user)

const form = ref({
  phone: undefined as string | undefined,
  name: undefined as string | undefined,
  email: undefined as string | undefined,
  date_of_birth: undefined as string | undefined,
  image: null as File | null,
})

const fillFormWithUser = (userData: any) => {
  form.value.phone = userData.phone_number
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
  if (res.result){
    successUpdate.value = 'Данные успешно сохранены!';
    setTimeout(() => {
      successUpdate.value = "";
    }, 3000);
  }
  else {
    errorUpdate.value = res.message;
  }
}

onMounted(() =>{
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/')
  }

  if (user.value) {
    fillFormWithUser(user.value)
  }
})
</script>

<template>
  <div class="profile">
    <div class="profile__header">
      <Header />
    </div>
    <div class="profile__wrapper">
      <form class="profile__form" @submit.prevent="submitForm" enctype="multipart/form-data">
        <transition name="fade-slide">
          <p class="text-green p-2 bg-green bg-opacity-30 rounded-full" v-if="successUpdate.length !== 0">{{successUpdate}}</p>
        </transition>
        <h1 class="profile__title">Личные данные</h1>
        <FileDropUpload
            :modelValue="form.image"
            @update:modelValue="form.image = $event"
        />
        <div class="profile__field">
          <label class="profile__label" for="avatar">Аватар</label>
          <input class="profile__input" id="avatar" type="file" accept="image/*" @change="handleFileUpload" />
        </div>

        <PhoneNumber v-model="form.phone" />

        <div class="profile__field">
          <label class="profile__label" for="name">Имя</label>
          <input class="profile__input" id="name" type="text" v-model="form.name" />
        </div>

        <div class="profile__field">
          <label class="profile__label" for="email">Почта</label>
          <input class="profile__input" id="email" type="email" v-model="form.email" />
        </div>

        <div class="profile__row">
          <div class="profile__field">
            <label class="profile__label" for="birthday">Дата рождения</label>
            <input class="profile__input" id="birthday" type="date" v-model="form.date_of_birth" />
          </div>
        </div>
        <button class="profile__submit btn--gradient" type="submit">Сохранить</button>
      </form>
    </div>
  </div>
</template>


<style scoped lang="sass">
@use 'assets/styles/mixins' as *
.profile
  @apply flex flex-col min-h-screen
  &__header
    @apply h-fit
  &__wrapper
    @apply bg-gray flex-grow
  &__form
    @apply m-10 p-10 bg-white rounded-[50px] flex flex-col gap-3
  &__title
    @apply text-2xl

.btn--gradient
  @include button-orange-gradient

.fade-slide-enter-active,
.fade-slide-leave-active
  transition: opacity 0.4s ease, max-height 0.4s ease, padding 0.4s ease, margin 0.4s ease;
  overflow: hidden

.fade-slide-enter-from,
.fade-slide-leave-to
  opacity: 0
  max-height: 0
  padding-top: 0
  padding-bottom: 0
  margin-bottom: 0

.fade-slide-enter-to,
.fade-slide-leave-from
  opacity: 1
  max-height: 1000px
</style>