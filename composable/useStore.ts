import {useApi} from "@composable/api";
import {useAuth} from "@composable/useAuth";
import type {Store} from "@interfaces/store";

export const useStore = ()  => {
  const api = useApi();
  const Auth = useAuth();

  const getStoresByCityId = async (cityId: string) => {
    const res = await api.get(`/store/get-stores-by-city/${cityId}`);
    return res.data;
  }

  const addStore = async (store: Store) => {
    const token = Auth.getToken();
    if (!token && store) return
    const res = await api.post('/store/create-store/',store, {headers: {token}});
    return res.data;
  }

  const updateStore = async (store: Store) =>{
    const token = Auth.getToken();
    if (!token && store) return
    const res = await api.put(`/store/${store.id}`,store, {headers: {token}});
    return res.data;
  }

  const deleteStore = async (storeId: string) =>{
    const token = Auth.getToken();
    if (!token && storeId) return
    const res = await api.delete(`/store/${storeId}`, {headers: {token}});
    return res.data;
  }

  return {getStoresByCityId, addStore, updateStore, deleteStore}
}