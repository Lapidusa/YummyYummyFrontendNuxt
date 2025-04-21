import {useApi} from "@composable/api";

export const useCity = ()  =>{
  const api = useApi();
  const getAllCity = async () =>{
    const res = await api.get('/city/all-cities/');
    return res.data;
  }
  return {getAllCity};
}