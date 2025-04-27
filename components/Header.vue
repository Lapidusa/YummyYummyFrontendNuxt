<script setup lang="ts">
  import {useAuth} from "@composable/useAuth";
  import {useUser} from "@composable/useUser";
  import {useCity} from "@composable/useCity";
  import type {City} from "@interfaces/city";
  import {useCityStore} from "@store/city";
  const isDropdownOpen = ref<boolean>(false);
  const isModalCityOpen = ref<boolean>(false);
  const isAuthorized = ref<boolean>(false);
  const isRole = ref<0|1|2|3|4>(0);
  const userPhoneNumber = ref<string>('');
  const code = ref(['', '', '', '', '', '']);
  const error = ref<boolean>(false);
  const isModalOpen = ref<boolean>(false);
  const changeModal = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const searchTerm = ref<string>('');
  const Auth = useAuth()
  const UseUser = useUser()
  const UseCity = useCity()
  const cityStore = useCityStore()
  const city = computed(() => cityStore.city)
  let timeoutId: any = null;

  const activeCity = ref<City | null>(null)
  const allCities = ref<{ cities: City[] }>({ cities: [] })

  const visibleCities = computed(()=>{
    if (!searchTerm.value.length) return allCities.value.cities
    const term = searchTerm.value.toLowerCase()

    return allCities.value.cities.filter((city) => (
      city.name.toLowerCase().includes(term)
    ));
  });

  const sendCode = async () => {
    if (userPhoneNumber.value.length !== 11) {
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
      changeModal.value = false;
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
    changeModal.value = false;
  };

  const changeCity = (id: string) => {
    const city = allCities.value.cities.find((city: { id: string; name: string})  => city.id === id);
    if (city) {
      activeCity.value = city
      isModalCityOpen.value = false
      cityStore.setCity(city);
      isLoading.value = true;
    }
  }

  const changeModalCities = () => {
    isModalCityOpen.value = !isModalCityOpen.value;
  }

  onMounted(async () => {
    allCities.value = await UseCity.getAllCity()
    cityStore.initCityFromStorage()

    activeCity.value = city.value;
    if (activeCity.value) isLoading.value = true;

    if (!activeCity.value) changeModalCities()
    const token = localStorage.getItem('token');
    if (token) {
      const user = await UseUser.fetchUser()
      if (user.result){
        isAuthorized.value = true;
        isRole.value = user.role;
      }
    }
  })
</script>

<template>
  <div class="header container" v-if="isLoading">
    <div class="header__left">
      <Logo/>
      <div class="header__location">
        <div class="header__title">Доставка пиццы</div>
        <button @click="changeModalCities()" v-if="activeCity" class="header__city">{{activeCity.name}}</button>
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
        <NuxtLink to="/profile" v-if="isAuthorized" class="header__button header__button--outline"
        @mouseenter="openDropdown" @mouseleave="startCloseDropdown">

          <div class="header__button-icon"></div>
          <p class="header__button-text">Профиль</p>
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

        <p v-show="error" class="modal-header__error">Введите полный номер</p>

        <button @click="sendCode()" class="modal-header__btn">
          <p class="modal-header__btn-text">Получить код в SMS</p>
        </button>

        <div @click="closeModal" type="button" class="modal-header__close cursor-pointer">
          <img class="closeModal" src="../assets/icons/closeWhite.svg" alt="" />
        </div>
      </div>
    </template>

    <div v-else>
      <div class="modal-header modal-header--active">
        <div class="modal-header__top">
          <div class="modal-header__text">
            <h2 class="modal-header__title text-xl">Вход в аккаунт</h2>
            <p class="modal-header__description">Введите СМС-код</p>
          </div>
          <div class="modal-header__img"></div>

        </div>
        <div class="modal-header__otp otp-container flex items-center justify-center gap-4">
          <input type="text" maxlength="1" class="otp-input" v-model="code[0]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[1]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[2]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[3]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[4]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[5]" @input="moveFocus({event : $event, direction : 1})" />
        </div>
        <div v-if="error" class="modal-header__error text-red">
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

  <div
  id="static-modal" data-modal-backdrop="static"
  aria-hidden="true"
  :class="{'hidden': !isModalCityOpen, 'modal-header': isModalCityOpen}"
  >
    <div class="modal-header modal-header--active">
      <div class="modal-header__title">
        Выберите свой город
      </div>
      <div class="modal-header__search">
        <img class="modal-header__search-icon" src="@assets/icons/search.svg" alt="Search"/>
        <input type="search" class="modal-header__search" v-model.trim="searchTerm">
        <button
                v-if="searchTerm"
                class="clear-button"
                @click.prevent="searchTerm = ''"
        >
          <img class="modal-header__search-clean" src="@assets/icons/x-letter.svg" alt="Clear Input"/>
        </button>
      </div>
      <div class="modal-header__cities">
        <div class="modal-header__city" v-for="city in visibleCities" :key="city.id">
          <button @click="changeCity(city.id)" class="modal-header__text--hover">{{city.name}}</button>
        </div>
      </div>
      <div @click="changeModalCities" v-if="activeCity" type="button" class="modal-header__close cursor-pointer">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="" />
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
    @apply text-orange text-left -mt-1

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
    @apply text-3xl font-semibold

  &__img
    background-image: url('@/assets/images/phone.png')
    width: 60px
    height: 60px
  &__error
    @apply text-red
  &__text
    @apply flex flex-col w-2/3 gap-3
  &__top
    @apply flex items-center justify-between
  &__btn
    @apply w-full
    @include button-orange-gradient
  &__city
    @apply w-fit
  &__text--hover
    @apply hover:text-orange duration-300 ease-in cursor-pointer w-fit



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
  padding: 0
</style>
