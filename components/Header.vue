<script setup lang="ts">
  import {useAuth} from "@composable/useAuth";
  import {useUser} from "@composable/useUser";
  import {useUserStore} from "@store/user";
  const isDropdownOpen = ref<boolean>(false);
  const isAuthorized = ref<boolean>(false);
  const isRole = ref<0|1|2|3|4>(0);
  const userPhoneNumber = ref<string>('');
  const code = ref(['', '', '', '', '', '']);
  const error = ref<boolean>(false);
  const isModalOpen = ref<boolean>(false);
  const changeModal = ref<boolean>(false);
  const Auth = useAuth()
  const UseUser = useUser()
  let timeoutId: any = null;

  const sendCode = async () => {
    if (userPhoneNumber.value.length === 10) {
      error.value = true;
    } else {
      const res = await Auth.sendSms({phone_number: userPhoneNumber.value});
      if (res.result) {
        changeModal.value = true;
        error.value = false;
      }
    }
  }

    const LogIn = async () => {
      const smsCode = code.value.join('');
      const res = await Auth.verifyCode({phone_number: userPhoneNumber.value, code: smsCode});

      if(res.result) {
        isAuthorized.value = true;
        isModalOpen.value = false;
        error.value = false;
        localStorage.setItem("token", res.token);
        const user = await UseUser.fetchUser()
        isRole.value = user.role;
      } else{
        error.value = true;
      }
    }

    const LogOut = async () => {
      const res = await UseUser.logOut()
      if (res.result) {
        isAuthorized.value = false;
        isRole.value = 0;
      }
    }

    const moveFocus = ({event, direction}: { event: any, direction: any }) => {
      const current = event.target;
      if (current.value.length >= current.maxLength) {
        const next = current.nextElementSibling;
        if (next) {
          next.focus();
        }
      } else if (current.value.length === 0 && direction === -1) {
        const prev = current.previousElementSibling;
        if (prev) {
          prev.focus();
        }
      }
    };
    const openDropdown = () => {
      clearTimeout(timeoutId);
      isDropdownOpen.value = true;
    };

    const startCloseDropdown = () => {
      timeoutId = setTimeout(() => {
        isDropdownOpen.value = false;
      }, 200);
    };
    const openModal = () => {
      isModalOpen.value = true;
    };

    const closeModal = () => {
      isModalOpen.value = false;
    };
    onMounted(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const user = await UseUser.fetchUser()
        isAuthorized.value = true;
        isRole.value = user.role;
      }
    })
</script>

<template>
  <div class="header container">
    <div class="header__left">
      <img class="header__logo" src="@assets/icons/logo.svg" alt="logo"/>
      <div class="header__location">
        <div class="header__title">Доставка пиццы</div>
        <div class="header__city">Москва</div>
      </div>
    </div>
    <div class="header__right">
      <button v-if="!isAuthorized" @click="openModal" class="header__button header__button--outline">Войти</button>

<!--      <NuxtLink v-if="isAuthorized && isRole == 1" class="header__button header__button&#45;&#45;outline">-->
<!--        <p class="header__button-text">Доставка</p>-->
<!--      </NuxtLink>-->
<!--      <NuxtLink v-else-if="isAuthorized && isRole == 2" class="header__button header__button&#45;&#45;outline">-->
<!--        <p class="header__button-text">Кухня</p>-->
<!--      </NuxtLink>-->
      <NuxtLink to="/manager/home" v-else-if="isAuthorized && isRole == 3" class="header__button header__button--outline">
        <p class="header__button-text">Управление</p>
      </NuxtLink>
      <NuxtLink to="/admin/home" v-else-if="isAuthorized && isRole == 4" class="header__button header__button--outline">
        <p class="header__button-text">Админ</p>
      </NuxtLink>
      <div class="relative">
        <button v-if="isAuthorized" class="header__button header__button--outline"
        @mouseenter="openDropdown" @mouseleave="startCloseDropdown">

          <div class="header__button-icon"></div>
          <p class="header__button-text">Профиль</p>
        </button>
        <div v-show="isDropdownOpen" class="absolute z-10 mt-2 bg-white w-fill divide-gray-100 rounded-lg shadow"
        @mouseenter="openDropdown" @mouseleave="startCloseDropdown">
          <ul class=" py-2 text-sm">
            <li>
              <a href="#" class="block px-4 py-2 hover:bg-orange hover:text-white dark:hover:bg-background-dark-light dark:hover:text-main-contrast">Мой профиль</a>
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
    </div>
  </div>
  <div
  id="static-modal" data-modal-backdrop="static"
  aria-hidden="true"
  :class="{'hidden': !isModalOpen, 'modal-header': isModalOpen}"
  >
    <template v-if="!changeModal">
      <div class="modal-header modal-header--active">
        <div class="modal-header__top">
          <div class="modal-header__text">
            <h2 class="modal-header__title">Вход в аккаунт</h2>
            <p class="modal-header__description">
              Введите номер телефона, чтобы войти или зарегистрироваться
            </p>
          </div>
          <div class="modal-header__img"></div>
        </div>

        <PhoneNumber v-model="userPhoneNumber" />

        <p v-if="error" class="modal-header__error">Введите полный номер</p>

        <button @click="sendCode()" class="modal-header__btn btnLogIn w-full justify-center">
          <p class="btnLogIn__text">Получить код в SMS</p>
        </button>

        <div @click="closeModal" type="button" class="modal-header__close cursor-pointer">
          <img class="closeModal" src="../assets/icons/closeWhite.svg" alt="" />
        </div>
      </div>
    </template>

    <div v-else>
      <div class="modal-header modal-header--active">
        <h2 class="modal-header__title text-xl">Вход в аккаунт</h2>
        <p class="modal-header__description">Введите СМС-код</p>
        <div class="modal-header__otp otp-container flex items-center justify-center gap-4">
          <input type="text" maxlength="1" class="otp-input" v-model="code[0]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[1]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[2]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[3]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[4]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[5]" @input="moveFocus({event : $event, direction : 1})" />
        </div>
        <div v-if="error" class="modal-header__error text-red-500">
          <p class="text-center py-2">Неверный код или срок действия кода истёк</p>
        </div>
        <button @click="LogIn" class="modal-header__btn btnLogIn w-full justify-center">
          <p class="btnLogIn__text">Войти</p>
        </button>
        <div @click="closeModal" type="button" class="modal-header__close cursor-pointer">
          <img class="closeModal" src="../assets/icons/closeWhite.svg" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
@use 'assets/styles/mixins' as *

.header
  padding: 34px
  @apply flex justify-between

  &__left
    @apply flex gap-5

  &__city
    @apply text-orange

  &__location
    @apply flex flex-col justify-center

  &__right
    @apply flex justify-center items-center gap-5

  &__button
    @apply flex items-center gap-2

    &--outline
      @include button-orange-outline

      &:hover .header__button-icon
        background-image: url('@/assets/icons/profile-hover.svg')
  .modal-header
    @apply fixed inset-0 flex items-center justify-center bg-black bg-opacity-50

    &--active
      @apply bg-white rounded-lg shadow-lg p-6 w-96 z-50 relative

    &__title
      @apply text-3xl font-semibold mb-4

    &__description
      @apply mb-4
    &__img
      background-image: url('@/assets/images/phone.png')
    &__error
      @apply text-red-500
    &__text
      @apply flex flex-col
    &__top
      @apply flex items-center

  &__button-icon
    width: 14px
    height: 16px
    background-image: url('@/assets/icons/profile.svg')
    background-size: cover
    background-repeat: no-repeat
    transition: background-image 0.3s ease

.closeModal
  @apply absolute top-1 -right-10;
.otp-input
  width: 40px
  height: 40px
  font-size: 24px
  text-align: center
  border: 2px solid #ccc
  border-radius: 5px
  outline: none

</style>
