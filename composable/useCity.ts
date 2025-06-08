import {useApi} from "@composable/api";
import type {City} from "@interfaces/city";
import {useAuth} from "@composable/useAuth"

export const useCity = ()  =>{
  const api = useApi();
  const auth = useAuth();

  const getAllCities = async () =>{
    const res = await api.get('/city/all-cities/');
    return res.data;
  }

  const getFullDataByCity = async (cityId: string) =>{
    const res = await api.get(`/city/${cityId}/full`);
    return res.data;
  }

  const getCityById = async (cityId: string) =>{
    const res = await api.get(`/city/${cityId}`);
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

  return {getAllCities, getFullDataByCity, getCityById, addCity, updateCity, deleteCity};
}