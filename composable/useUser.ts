import { useUserStore } from '@store/user'
import { useApi } from '@composable/api'
import {useAuth} from "@composable/useAuth";
import type {User} from "@interfaces/user";

export const useUser = () => {
  const api = useApi()
  const auth = useAuth();
  const userStore = useUserStore()

  const fetchUser = async () => {
    const token = auth.getToken();
    if (!token) return

    const res = await api.get('/user/get-user', {
      headers: { token }
    })
    if (res.data.result) {
      userStore.setUser(res.data.user)
    }

    return res.data
  }

  const getAllUsers = async () => {
    const token = auth.getToken();
    if (!token) return
    const res = await api.get('/user/get-all-users',{
      headers: {
        token: token
      }
    })
    return res.data
  }

  const createUser = async (user: User) => {
    const token = auth.getToken();
    if (!token) return
    const res = await api.post('/user/create-user', user,{
      headers: {
        token: token
      }
    })
    return res.data
  }

  const updateUser = async (formData: FormData) => {
    const token = auth.getToken();
    if (!token) return
    const res = await api.put('/user/update-user/', formData, {
      headers: {
        token: token,
        'Content-Type': 'multipart/form-data'
      },
    })

    return res.data
  }

  const updateUserForAdmin = async (user: User) => {
    const token = auth.getToken();
    if (!token) return
    const res = await api.put(`/user/update-admin/`, user, {
      headers: {
        token: token
      }
    });

    return res.data
  }

  const deleteUser = async (userId?: string) => {
    let res;
    const token = auth.getToken();
    if (!token) return

    if (!userId ) {
      res = await api.delete(`/user/delete-user/`, {
        headers: {
          token: token
        }
      })
      return res.data
    }
    else{
      res = await api.delete(`/user/delete-user/${userId}`,{
        headers: {
          token: token
        }
      })
      return res.data
    }
  }

  const logOut = async () => {
    const token = auth.getToken();
    if (!token) return
    const response = await api.post("/user/logout", {}, {
      headers: { token }
    })
    if (response.data.result) {
      userStore.clearUser();
      localStorage.clear();
    }
    return response.data
  }

  return { fetchUser, getAllUsers, logOut, createUser, updateUser, updateUserForAdmin, deleteUser}
}
