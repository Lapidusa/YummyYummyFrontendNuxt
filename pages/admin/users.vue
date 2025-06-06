<script setup lang="ts">
  import {createEmptyUser, Roles, RolesLabels, type User} from "@interfaces/user";
  import {useUser} from "@composable/useUser";
  const config = useRuntimeConfig()

  const error = ref<string>('')
  const modalMode = ref<'none' | 'add' | 'update'| 'delete'>('none');
  const user = reactive<User>(createEmptyUser());
  const users = ref<User[]>();
  const UseUser = useUser()
  const openModal = async (mode: typeof modalMode.value, data?: User)=>{
    modalMode.value = mode
    if (data !== undefined && (mode === 'update' || mode === 'delete')) {
      Object.assign(user, {...data})
    }
    else
      Object.assign(user, createEmptyUser());
  }


  const createUser = async () => {
    const res = await UseUser.createUser(user);
    if (res.result) {
      await initData();
      closeModal();
    }
  }

  const updateUser = async () => {
    const res = await UseUser.updateUserForAdmin(user);
    if (res.result) {
      await initData();
      closeModal();
    }
  }

  const deleteUser = async () => {
    const res = await UseUser.deleteUser(user.id)
    if (res.result) {
      await initData();
      closeModal();
    }
  }

  const closeModal = () =>{
    modalMode.value = 'none';
  }

  const initData = async () => {
    const res = await UseUser.getAllUsers();
    if (res.result) users.value = res.users;
  }

  function formatDate(isoString: string | null): string {
    if (!isoString) return "—";
    const dt = new Date(isoString);
    return dt.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function getRoleEmoji(role: Roles): string {
    switch (role) {
      case Roles.USER:
        return "👤";
      case Roles.COURIER:
        return "🛵";
      case Roles.COOK:
        return "👨‍🍳";
      case Roles.MANAGER:
        return "🗂️";
      case Roles.ADMIN:
        return "🛡️";
      default:
        return "";
    }
  }
  onMounted(async () => {
    await initData();
    console.log(users.value)
  })
</script>

<template>
  <div class="users flex flex-col gap-4">
    <button @click="openModal('add')" class="users__btn btn--gradient w-fit">Добавить пользователя</button>
    <div class="users__container grid lg:grid-cols-3 md:grid-cols-2 gap-4">
      <div
          class="user-card flex items-center p-4 bg-white rounded-lg shadow"
          v-for="user in users"
          :key="user.id"
      >
        <img
            v-if="user.image_url"
            :src="`${config.public.serverUrl}${user.image_url}`"
            alt="avatar"
            class="w-12 h-12 rounded-full mr-4 object-cover"
        />
        <div class="flex-1">

          <h3 class="text-lg font-semibold">
            {{ user.name }}
            +{{ user.phone_number }}
            <span class="mr-1">{{ getRoleEmoji(user.role) }}</span>
          </h3>
          <p class="text-gray-600">
            {{ user.email || "—" }}
          </p>
          <p class="mt-1">
            <span class="font-medium">{{ RolesLabels[user.role] }}</span>
          </p>
          <!-- Дата создания -->
          <p class="text-xs text-gray-400 mt-1">
            Создан: {{ formatDate(user.created_at) }}
          </p>
        </div>
        <div class="user__actions flex flex-col justify-around h-full">
          <button class="user__actions-btn" @click="openModal('update', user)">
            <img src="@assets/icons/update.svg" alt="update" />
          </button>
          <button class="user__actions-btn" @click="openModal('delete', user)">
            <img src="@assets/icons/delete.svg" alt="delete" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="modalMode !=='none'" class="modal-user">
    <div class="modal-user modal-user--active">
      <div class="modal-user__close cursor-pointer" @click="closeModal">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
      </div>

      <div v-if="modalMode === 'add' || modalMode === 'update'" class="flex flex-col gap-4">
        <div class="modal-user__title">
          {{modalMode === "add" ? 'Добавить пользователя' : 'Изменить пользователя'}}
        </div>
        <label for="input-name">
          Имя
          <input placeholder="Введите имя" type="text" v-model="user.name">
        </label>
        <label for="input-phone-number">
          Номер телефона
          <PhoneNumber id="input-phone-number" v-model="user.phone_number"/>
        </label>
        <label>Роль
          <select v-model="user.role" class="select p-2 outline-orange rounded-full">
            <option :value="Roles.USER">👤 {{ RolesLabels[Roles.USER] }}</option>
            <option :value="Roles.COURIER">🛵 {{ RolesLabels[Roles.COURIER] }}</option>
            <option :value="Roles.COOK">👨‍🍳 {{ RolesLabels[Roles.COOK] }}</option>
            <option :value="Roles.MANAGER">🗂️ {{ RolesLabels[Roles.MANAGER] }}</option>
            <option :value="Roles.ADMIN">🛡️ {{ RolesLabels[Roles.ADMIN] }}</option>
          </select>
        </label>
        <button
            class="modal-product__btn btn--gradient"
            @click="modalMode==='add' ? createUser() : updateUser()"
        >
          {{ modalMode === 'add' ? 'Добавить' : 'Изменить' }}
        </button>
      </div>

      <template v-else-if="modalMode === 'delete'">
        <div class="modal-user__title">
          Удалить пользователя {{ user.name }}?
        </div>
        <p class="text-red" v-if="error">{{ error }}</p>
        <div class="flex gap-5 justify-center">
          <button @click="deleteUser" class="modal-user__button btn--gradient flex-1">Удалить</button>
          <button @click="closeModal" class="modal-user__button btn--outline flex-1">Отмена</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="sass">
@use 'assets/styles/mixins' as *

.btn
  &--gradient
    @include button-orange-gradient
  &--outline
    @include button-orange-outline
.user
  &__actions
    &-btn
      @apply p-2 hover:bg-white hover:shadow-[0_0_10px_5px_rgba(0,0,0,.02)] rounded-full
.modal-user
  @apply fixed bg-black inset-0 bg-opacity-70 z-[1000] gap-2

  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 w-max -translate-x-1/2 absolute max-w-[80%]
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 h-max

  &__title
    @apply text-3xl

.closeModal
  @apply absolute top-1 -right-10;
.select
  option:checked
    @apply bg-orange text-white bg-opacity-80

</style>