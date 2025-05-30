import {useApi} from "@composable/api";
import {useAuth} from "@composable/useAuth";
import type {Store} from "@interfaces/store";

export const useStore = ()  => {
  const api = useApi();
  const auth = useAuth();

  const getStoresByCityId = async (cityId: string) => {
    const res = await api.get(`/store/get-stores-by-city/${cityId}`);
    return res.data;
  }

  const getAllStores = async () => {
    const res = await api.get(`/store/all-stores/`);
    return res.data;
  }

  const addStore = async (store: Store) => {
    const token = auth.getToken();
    if (!token && store) return
    const res = await api.post('/store/create-store/',store, {headers: {token}});
    return res.data;
  }

  const updateStore = async (store: Store) =>{
    const token = auth.getToken();
    if (!token && store) return
    const res = await api.put(`/store/${store.id}`,store, {headers: {token}});
    return res.data;
  }

  const deleteStore = async (storeId: string) =>{
    const token = auth.getToken();
    if (!token && storeId) return
    const res = await api.delete(`/store/${storeId}`, {headers: {token}});
    return res.data;
  }

  return {getStoresByCityId, getAllStores, addStore, updateStore, deleteStore}
}