import {useApi} from "@composable/api";
import type {City} from "@interfaces/city";
import {useAuth} from "@composable/useAuth"

export const useCity = ()  =>{
  const api = useApi();
  const auth = useAuth();

  const getAllCity = async () =>{
    const res = await api.get('/city/all-cities/');
    return res.data;
  }

  const getCityById = async (storeId: string) =>{
    const res = await api.get(`/city/${storeId}`);
    return res.data;
  }

  const addCity = async (cityName: Partial<City>) =>{
    const token = auth.getToken();
    if (!token && cityName) return
    const res = await api.post('/city/',cityName, {headers: {token}});
    return res.data;
  }

  const updateCity = async (city: City) =>{
    const token = auth.getToken();
    if (!token && city) return
    const res = await api.put('/city/',city, {headers: {token}});
    return res.data;
  }

  const deleteCity = async (cityId: string) =>{
    const token = auth.getToken();
    if (!token && cityId) return
    const res = await api.delete(`/city/${cityId}`, {headers: {token}});
    return res.data;
  }

  return {getAllCity, getCityById, addCity, updateCity, deleteCity};
}