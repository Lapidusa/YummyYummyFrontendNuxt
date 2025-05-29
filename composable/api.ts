// ~/composables/useApi.ts
import axios from 'axios'
import {listUrl} from "@/utils/urlConfig";

export const useApi = () => {
  return axios.create({
    baseURL: listUrl.apiUrl as string
  })
}
