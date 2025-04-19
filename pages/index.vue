<script setup lang="ts">

</script>

<template>
  <Header/>
  <div
      id="static-modal"
      data-modal-backdrop="static"

      aria-hidden="true"
      :class="{'hidden': !isModalOpen, 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50': isModalOpen}"
  >
    <template v-if="!changeModal">
      <div class="bg-white rounded-lg shadow-lg p-6 w-96 z-50 relative">
        <h2 class="text-3xl font-semibold mb-4">Вход в аккаунт</h2>
        <p class="mb-4">Введите номер телефона, чтобы войти или зарегистрироваться</p>

        <PhoneNumber v-model="userPhoneNumber"/>

        <p v-if="error" class="text-center text-red-500 font-bold py-2">Введите полный номер</p>

        <button @click="sendCode()" class="btnLogIn w-full justify-center">
          <p class="btnLogIn__text">Получить код в SMS</p>
        </button>

        <div @click="closeModal" type="button" class="cursor-pointer">
          <img class="closeModal" src="../assets/icons/closeWhite.svg" alt="">
        </div>
      </div>

    </template>
    <div v-else>
      <div class="bg-white rounded-lg shadow-lg p-6 w-96 z-50 relative">
        <h2 class="text-xl font-semibold mb-4">Вход в аккаунт</h2>
        <p class="mb-4">Введите СМС-код</p>
        <div class="otp-container flex items-center justify-center gap-4">
          <input type="text" maxlength="1" class="otp-input" v-model="code[0]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[1]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[2]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[3]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[4]" @input="moveFocus({event : $event, direction : 1})" />
          <input type="text" maxlength="1" class="otp-input" v-model="code[5]" @input="moveFocus({event : $event, direction : 1})" />
        </div>
        <div class="text-red-500" v-if="error">
          <p class="text-center py-2">Неверный код или срок действия кода истёк</p>
        </div>
        <button @click="LogIn" class="btnLogIn w-full justify-center">
          <p class="btnLogIn__text">Войти</p>
        </button>
        <div @click="closeModal" type="button" class="cursor-pointer">
          <img class="closeModal" src="../assets/icons/closeWhite.svg" alt="">
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="sass">

</style>
