// ~/composables/useApi.ts
import axios from 'axios'

export const useApi = () => {
  const config = useRuntimeConfig()
  return axios.create({
    baseURL: config.public.serverUrl as string
  })
}
