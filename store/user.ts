
import { defineStore } from 'pinia'
import type { User } from '@interfaces/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    setUser(user: User) {
      this.user = user
    },
    clearUser() {
      this.user = nul
    }
  }
})
