import { useUserStore } from '@store/user'
import { useApi } from '@composable/api'

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
        return res.data
      }
    } catch (error) {
      console.error('Ошибка при получении пользователя:', error)
    }
  }

  const updateUser = async (formData: FormData) => {
    const res = await api.put('/user/update-user/', formData, {
      headers: {
        token: localStorage.getItem('token') || '',
        'Content-Type': 'multipart/form-data'
      },
    })
    return res.data
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

  return { fetchUser, logOut, updateUser}
}
