// composables/user.ts
import { useUserStore } from '@store/user'
import { useApi } from '@composable/api'
import type {VerifyRequest} from "@interfaces/auth";

export const useUser = () => {
  const api = useApi()
  const userStore = useUserStore()

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await api.get('/user/get-user', {
        headers: { token }
      })
      if (res.data.result) {
        userStore.setUser(res.data.user)
        return res.data.user
      }
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error)
    }
  }

  const logOut = async () => {
    const token = localStorage.getItem('token')
    const response = await api.post("/user/logout", {}, {
      headers: { token }
    })
    if (response.data.result) {
      userStore.clearUser();
      localStorage.clear();
    }
    return response.data
  }

  return { fetchUser, logOut}
}
