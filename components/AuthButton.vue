<script setup lang="ts">
import { ref, defineEmits, nextTick, onMounted} from 'vue'
import {useAuth} from "@composable/useAuth";
import {useUser} from "@composable/useUser";
import {useRouter} from "vue-router";

const emit = defineEmits<{
  (e: 'update:isAuthorized', value: boolean): void
  (e: 'update:role', value: 0|1|2|3|4): void
}>()
const isDropdownOpen = ref<boolean>(false);
const isAuthorized = ref(false)
const isRole = ref<0 | 1 | 2 | 3 | 4>(0)
const isModalOpen = ref(false)
const step = ref(1)

const userPhoneNumber = ref('')
const code = ref(['', '', '', '','',''])
const error = ref(false)

const router = useRouter()
const Auth = useAuth()
const UseUser = useUser()

const timeoutId = ref<ReturnType<typeof setTimeout>>();

const closeModal = () => {
  isModalOpen.value = false
  step.value = 1
  userPhoneNumber.value = ''
  code.value = ['', '', '', '','','']
  error.value = false
}

const sendCode = async () => {
  if (userPhoneNumber.value.length !== 11) {
    error.value = true;
  }else{
    const res = await Auth.sendSms({ phone_number: userPhoneNumber.value })
    if (res.result) {
      step.value = 2
      await nextTick(() => {
        const firstInput = document.querySelector('.code-digit') as HTMLInputElement
        firstInput?.focus()
      })
    }
  }
}

const focusNext = (index: number) => {
  if (code.value[index].length === 1 && index < code.value.length) {
    const next = document.querySelectorAll('.code-digit')[index + 1] as HTMLInputElement
    next?.focus()
  }
}

const openDropdown = () => {
  clearTimeout(timeoutId.value);
  isDropdownOpen.value = true;
};

const startCloseDropdown = () => {
  timeoutId.value = setTimeout(() => {
    isDropdownOpen.value = false;
  }, 200);
};

const handleKey = (event: KeyboardEvent, index: number) => {
  const target = event.target as HTMLInputElement

  if (event.key === 'Backspace' && code.value[index] === '' && index > 0) {
    const prev = document.querySelectorAll('.code-digit')[index - 1] as HTMLInputElement
    prev?.focus()
  }

  if (event.key === 'ArrowLeft' && index > 0) {
    const prev = document.querySelectorAll('.code-digit')[index - 1] as HTMLInputElement
    prev?.focus()
  }

  if (event.key === 'ArrowRight' && index < code.value.length - 1) {
    const next = document.querySelectorAll('.code-digit')[index + 1] as HTMLInputElement
    next?.focus()
  }
}

const LogIn = async () => {
  const smsCode = code.value.join('')
  const res = await Auth.verifyCode({ phone_number: userPhoneNumber.value, code: smsCode })

  if (res.result) {
    isAuthorized.value = true
    localStorage.setItem('token', res.token)
    const resUser = await UseUser.fetchUser()
    isRole.value = resUser.user.role
    emit('update:isAuthorized', true)
    emit('update:role', resUser.user.role as 0 | 1 | 2 | 3 | 4)
    closeModal()
  } else {
    error.value = true
  }
}

const LogOut = async () => {
  const res = await UseUser.logOut()
  if (res.result) {
    isAuthorized.value = false
    isRole.value = 0
    emit('update:isAuthorized', false)
    emit('update:role', 0)
    await router.push('/')
  }
}

onMounted(async () => {
  const token = localStorage.getItem('token');
  if (token) {
    const res = await UseUser.fetchUser()
    if (res.result){
      isAuthorized.value = true;
      isRole.value = res.user.role;
    }
  }
})
</script>

<template>
  <div class="flex gap-3">
    <button v-if="!isAuthorized" @click="isModalOpen = true" class="button button--outline">
      Войти
    </button>
    <template v-else>
      <slot :isRole="isRole" :logOut="LogOut" />
    </template>
    <div class="relative">
      <NuxtLink to="/profile" v-if="isAuthorized" class="button button--outline"
        @mouseenter="openDropdown" @mouseleave="startCloseDropdown">
        <div class="button--icon"></div>
        <p class="button-text">Профиль</p>
      </NuxtLink>
      <div v-show="isDropdownOpen" class="absolute z-10 mt-2 bg-white w-fill divide-gray-100 rounded-lg shadow"
           @mouseenter="openDropdown" @mouseleave="startCloseDropdown">
        <ul class=" py-2 text-sm">
          <li>
            <NuxtLink href="/profile" class="block px-4 py-2 hover:bg-orange hover:text-white dark:hover:bg-background-dark-light dark:hover:text-main-contrast">Мой профиль</NuxtLink>
          </li>
          <li>
            <a href="#" class="block px-4 py-2 hover:bg-orange hover:text-white dark:hover:bg-background-dark-light dark:hover:text-main-contrast">Заказы</a>
          </li>
          <li>
            <a href="#" @click="LogOut" class="block px-4 py-2 hover:bg-orange hover:text-white dark:hover:bg-background-dark-light dark:hover:text-main-contrast">Выйти</a>
          </li>
        </ul>
      </div>
    </div>


    <!-- Модалка -->
    <div
        id="static-modal" data-modal-backdrop="static"
        aria-hidden="true"
        :class="{'hidden': !isModalOpen, 'modal': isModalOpen}"
    >
      <template v-if="step === 1">
        <form @submit.prevent="sendCode" class="modal modal--active">
          <div class="modal__top">
            <div class="modal__text">
              <h2 class="modal__title">Вход в аккаунт</h2>
              <p class="modal__description">Введите номер телефона, чтобы войти или зарегистрироваться</p>
            </div>
            <div class="modal__img"></div>
          </div>

          <PhoneNumber v-model="userPhoneNumber" />

          <p v-show="error" class="modal__error">Введите полный номер</p>

          <button type="submit" class="modal__btn" @keyup.enter="sendCode()">
            <p class="modal__btn-text">Получить код в SMS</p>
          </button>

          <div @click="closeModal" type="button" class="modal__close cursor-pointer">
            <img class="closeModal" src="../assets/icons/closeWhite.svg" alt="" />
          </div>
        </form>
      </template>

      <form v-else-if="step === 2" @submit.prevent="LogIn">
        <div class="modal modal--active">
          <div class="modal__top">
            <div class="modal__text">
              <h2 class="modal__title text-xl">Вход в аккаунт</h2>
              <p class="modal__description">Введите СМС-код</p>
            </div>
            <div class="modal__img-code"></div>

          </div>
          <div class="code-input">
            <input
                v-for="(digit, i) in code"
                :key="i"
                v-model="code[i]"
                type="text"
                inputmode="numeric"
                maxlength="1"
                pattern="\d"
                class="code-digit"
                @input="focusNext(i)"
                @keydown="handleKey($event, i)"
            />
          </div>
          <div v-if="error" class="modal__error text-red">
            <p class="text-center py-2">Неверный код или срок действия кода истёк</p>
          </div>
          <button type="submit" class="modal__btn btnLogIn w-full justify-center">
            <p class="btnLogIn__text">Войти</p>
          </button>
          <button @click="closeModal" class="modal__close cursor-pointer">
            <img class="closeModal" src="../assets/icons/closeWhite.svg" alt="" />
          </button>
        </div>
      </form>
    </div>
  </div>

</template>

<style scoped lang="sass">
@use 'assets/styles/mixins' as *
.error
  @apply text-red

.button
  @apply flex items-center gap-2
  &--icon
    background: url('assets/icons/profile.svg') no-repeat
    width: 15px
    height: 15px
  &:hover .button--icon
    background: url('@/assets/icons/profile-hover.svg') no-repeat
    width: 15px
    height: 15px

  &--outline
    @include button-orange-outline

.modal
  @apply fixed inset-0 bg-black bg-opacity-50 flex flex-col gap-3

  &__search
    @apply relative

    &-icon
      @apply absolute top-1/4 left-2 z-10

    &-clean
      @apply absolute top-1/4 right-2 z-10 fill-orange

  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute top-1/2 left-1/2 shadow-lg p-6 w-fit h-fit z-50

  &__title
    @apply text-3xl font-semibold w-fit

  &__description
    @apply max-w-64

  &__img
    background-image: url('@/assets/images/phone.png')
    width: 60px
    height: 60px
  &__img-code
    background-image: url('@/assets/images/code.png')
    width: 60px
    height: 60px
  &__error
    @apply text-red

  &__text
    @apply flex flex-col gap-3

  &__top
    @apply flex items-center justify-between space-x-4

  &__btn
    @apply w-full
    @include button-orange-gradient

  &__city
    @apply w-fit

  &__text--hover
    @apply hover:text-orange duration-300 ease-in cursor-pointer w-fit
.closeModal
  @apply absolute top-1 -right-10;

.code-input
  @apply flex gap-2 justify-center

.code-digit
  @apply  w-12 h-12 text-center border-2 rounded-xl border-orange
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button
  -webkit-appearance: none
  margin: 0

</style>