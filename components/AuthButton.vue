<script setup lang="ts">
import { ref, defineEmits, nextTick, onMounted} from 'vue'
import {useAuth} from "@composable/useAuth";
import {useUser} from "@composable/useUser";
import {useRouter} from "vue-router";
import CloseIcon from "@components/icons/closeIcon.vue";

const emit = defineEmits<{
  (e: 'update:is-authorized', value: boolean): void
  (e: 'update:role', value: 0|1|2|3|4): void
}>()
const UseUser = useUser()
const Auth = useAuth()
const router = useRouter()

const isDropdownOpen = ref<boolean>(false);
const isRole = ref<0 | 1 | 2 | 3 | 4>(0)
const step = ref(1)
const userPhoneNumber = ref('')
const code = ref(['', '', '', '','',''])
const error = ref(false)
const isMobileMenuOpen = ref(false)
const isAuthorized = ref(false)
const isModalOpen = ref(false)

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

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

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
    emit('update:is-authorized', true)
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
    emit('update:is-authorized', false)
    emit('update:role', 0)
    await router.push('/')
  }
}

watch(userPhoneNumber, () => {
  error.value = false
})
onMounted(async () => {
  const token = localStorage.getItem('token');
  if (token) {
    const res = await UseUser.fetchUser()
    if (res.result){
      isAuthorized.value = true;
      emit('update:is-authorized', true)
      isRole.value = res.user.role;
    }
  }
})
</script>

<template>
  <button
      class="sm:hidden p-2"
      @click="toggleMobileMenu"
      aria-label="Open mobile menu"
  >
    <img src="@assets/icons/menu-hamburger.svg" alt="menu" />
  </button>
  <div class="sm:flex gap-3 hidden absolute sm:relative sm:w-auto">
    <button v-if="!isAuthorized" @click="isModalOpen = true" class="button button--outline">
      Войти
    </button>
    <template v-else>
      <slot :isRole="isRole" :logOut="LogOut" />
    </template>
    <div class="relative" v-if="isAuthorized">
      <NuxtLink to="/profile" class="button button--outline"
        @mouseenter="openDropdown" @mouseleave="startCloseDropdown">
        <div class="button--icon"></div>
        <p class="button-text">Профиль</p>
      </NuxtLink>
      <div v-show="isDropdownOpen" class="absolute z-10 mt-2 bg-white w-fill divide-gray-100 rounded-lg shadow"
           @mouseenter="openDropdown" @mouseleave="startCloseDropdown">
        <ul class=" py-2 text-sm">
          <li>
            <NuxtLink to="/profile" class="block px-4 py-2 hover:bg-orange hover:text-white dark:hover:bg-background-dark-light dark:hover:text-main-contrast">Мой профиль</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/orders" class="block px-4 py-2 hover:bg-orange hover:text-white dark:hover:bg-background-dark-light dark:hover:text-main-contrast">Заказы</NuxtLink>
          </li>
          <li>
            <a href="#" @click="LogOut" class="block px-4 py-2 hover:bg-orange hover:text-white dark:hover:bg-background-dark-light dark:hover:text-main-contrast">Выйти</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
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
        <div  type="button" class="modal__close cursor-pointer" @click="closeModal()">
          <CloseIcon class="closeModal"/>
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
        <div  type="button" class="modal__close cursor-pointer" @click="closeModal()">
          <CloseIcon class="closeModal"/>
        </div>
      </div>
    </form>
  </div>
  <transition name="fade">
    <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 z-50 bg-white flex flex-col p-6 overflow-auto"
    >
      <!-- шапка с крестиком -->
      <div class="flex justify-end">
        <button @click="toggleMobileMenu" aria-label="Close menu">
          <CloseIcon class="w-6 h-6 fill-black opacity-20" />
        </button>
      </div>

      <!-- содержимое: то же, что в десктоп-версии -->
      <div class="mt-8 flex flex-col gap-4">
        <button
            v-if="!isAuthorized"
            @click="isModalOpen = true; toggleMobileMenu()"
            class="button button--outline w-full"
        >
          Войти
        </button>

        <template v-else>
          <NuxtLink
              v-if="isRole === 3"
              to="/manager/home"
              class="button button--outline w-full text-center"
              @click="toggleMobileMenu"
          >
            Управление
          </NuxtLink>
          <NuxtLink
              v-else-if="isRole === 4"
              to="/admin/home"
              class="button button--outline w-full text-center"
              @click="toggleMobileMenu"
          >
            Админ
          </NuxtLink>

          <!-- дальше копируем обычные ссылки -->
          <NuxtLink
              to="/profile"
              class="button button--outline w-full text-center"
              @click="toggleMobileMenu"
          >
            Мой профиль
          </NuxtLink>
          <NuxtLink
              to="/orders"
              class="button button--outline w-full text-center"
              @click="toggleMobileMenu"
          >
            Заказы
          </NuxtLink>
          <button
              class="button button--outline w-full text-center"
              @click="LogOut(); toggleMobileMenu()"
          >
            Выйти
          </button>
        </template>
      </div>
    </div>
  </transition>
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
  @apply fixed inset-0 bg-black bg-opacity-50 flex flex-col gap-3 z-50

  &__search
    @apply relative

    &-icon
      @apply absolute top-1/4 left-2 z-10

    &-clean
      @apply absolute top-1/4 right-2 z-10 fill-orange

  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 -translate-x-1/2 absolute top-1/2 left-1/2 shadow-lg p-6 w-fit h-fit z-50

  &__title
    @apply font-semibold w-fit text-2xl sm:text-3xl

  &__description
    @apply text-sm sm:text-base max-w-64

  &__img
    @apply shrink-0 h-10 w-10 sm:h-14 sm:w-14 bg-contain m-0
    background-image: url('@/assets/images/phone.png')

  &__img-code
    background-image: url('@/assets/images/code.png')
    width: 60px
    height: 60px
  &__error
    @apply text-red

  &__text
    @apply flex flex-col gap-3

  &__top
    @apply flex items-center justify-between

  &__btn
    @apply w-full text-sm sm:text-base
    @include button-orange-gradient

  &__city
    @apply w-fit

  &__text--hover
    @apply hover:text-orange duration-300 ease-in cursor-pointer w-fit
.closeModal
  @apply absolute top-1 -right-10 fill-white opacity-100;

.code-input
  @apply flex gap-2 justify-center

.code-digit
  @apply  w-12 h-12 text-center border-2 rounded-xl border-orange
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button
  -webkit-appearance: none
  margin: 0
.fade-enter-active, .fade-leave-active
  transition: opacity .3s
.fade-enter-from, .fade-leave-to
  opacity: 0

button.p-2 img
  width: 24px
  height: 24px
</style>