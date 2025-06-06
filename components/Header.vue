<script setup lang="ts">
  import {ref, onMounted} from "vue";
  import {useAuth} from "@composable/useAuth";
  import {useUser} from "@composable/useUser";
  import {useCity} from "@composable/useCity";
  import type {City} from "@interfaces/city";
  import {useCityStore} from "@store/city";
  const isDropdownOpen = ref<boolean>(false);
  const isModalCityOpen = ref<boolean>(false);
  const isModalStoreOpen = ref<boolean>(false);
  const isAuthorized = ref<boolean>(false);
  const error = ref<boolean>(false);
  const isModalOpen = ref<boolean>(false);
  const changeModal = ref<boolean>(false);
  const isLoading = ref<boolean>(false);

  const isRole = ref<0|1|2|3|4>(0);
  const userPhoneNumber = ref<string>('');
  const code = ref(['', '', '', '', '', '']);

  const searchTerm = ref<string>('');

  const Auth = useAuth()
  const UseUser = useUser()
  const UseCity = useCity()
  const cityStore = useCityStore()
  const city = computed(() => cityStore.city)
  const timeoutId = ref<ReturnType<typeof setTimeout>>();

  const allCities = ref<{ cities: City[] }>({ cities: [] })
  const activeCity = ref<City | null>(null)

  const visibleCities = computed(() => {
    const cities = allCities.value.cities.slice();
    cities.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    if (!searchTerm.value.length) return cities;

    const term = searchTerm.value.toLowerCase();
    return cities.filter(city => city.name.toLowerCase().includes(term));
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
      const resUser = await UseUser.fetchUser()
      isRole.value = resUser.user.role;
    } else{
      error.value = true;
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

      isModalStoreOpen.value = true
    }
  }

  const changeModalCities = () => {
    isModalCityOpen.value = !isModalCityOpen.value;
  }

  const handleDeliveryOption = (option: string) => {
    isModalStoreOpen.value = false

    switch(option) {
      case 'address':
        console.log('Пользователь выбрал указать адрес доставки')
        // Ваша логика для адреса доставки
        break
      case 'pickup':
        console.log('Пользователь выбрал самовывоз из пиццерии')
        // Логика для самовывоза
        break
      case 'login':
        console.log('Пользователь выбрал войти')
        // Логика авторизации / перехода к логину
        break
    }
  }

  const closeStoreModal = () => {
    isModalStoreOpen.value = false
  }

  onMounted(async () => {
    allCities.value = await UseCity.getAllCities()
    cityStore.initCityFromStorage()

    activeCity.value = city.value;
    if (activeCity.value || Object.keys(allCities.value).length === 0) isLoading.value = true;

    if (!activeCity.value && Object.keys(allCities.value).length !== 0) changeModalCities()
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
      <AuthButton
          @update:isAuthorized="isAuthorized = $event"
          @update:role="isRole = $event"
      >
        <template #default="{ isRole, logOut }">
          <NuxtLink v-if="isRole === 3" to="/manager/home" class="header__button header__button--outline">
            Управление
          </NuxtLink>
          <NuxtLink v-else-if="isRole === 4" to="/admin/home" class="header__button header__button--outline">
            Админ
          </NuxtLink>
        </template>
      </AuthButton>
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

  <!-- Модалка выбора магазина / способа получения -->
  <div
      id="store-modal" data-modal-backdrop="static"
      aria-hidden="true"
      :class="{'hidden': !isModalStoreOpen, 'modal-header': isModalStoreOpen}"
  >
    <div class="modal-header modal-header--active">
      <div class="modal-header__title">
        Выберите способ получения
      </div>
      <div class="modal-header__buttons">
        <button @click="handleDeliveryOption('address')" class="modal-button">
          Указать адрес доставки
        </button>
        <button @click="handleDeliveryOption('pickup')" class="modal-button">
          Забрать из пиццерии
        </button>
        <button @click="handleDeliveryOption('login')" class="modal-button">
          Войти
        </button>
      </div>
      <div @click="closeStoreModal" type="button" class="modal-header__close cursor-pointer">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="" />
      </div>
    </div>
  </div>

</template>

<style scoped lang="sass">
@use 'assets/styles/mixins' as *

.header
  @apply flex justify-between p-[34px]

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
