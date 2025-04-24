import {useApi} from "@composable/api";
import type {City} from "@interfaces/city";

export const useCity = ()  =>{
  const api = useApi();

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const getAllCity = async () =>{
    const res = await api.get('/city/all-cities/');
    return res.data;
  }
  const addCity = async (cityName: Partial<City>) =>{
    const token = getToken();
    if (!token && cityName) return
    const res = await api.post('/city/',cityName, {headers: {token}});
    return res.data;
  }

  const updateCity = async (city: City) =>{
    const token = getToken();
    if (!token && city) return
    const res = await api.put('/city/',city, {headers: {token}});
    return res.data;
  }

  const deleteCity = async (cityId: string) =>{
    const token = getToken();
    if (!token && cityId) return
    const res = await api.delete(`/city/${cityId}`, {headers: {token}});
    return res.data;
  }
  return {getAllCity, addCity, updateCity, deleteCity};
}