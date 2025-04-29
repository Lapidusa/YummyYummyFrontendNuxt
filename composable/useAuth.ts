import type {AuthResponse, SendSmsRequest, VerifyRequest} from "@interfaces/auth";
import {useApi} from "@composable/api";

export const useAuth = () => {
  const api = useApi()

  const sendSms = async (payload: SendSmsRequest) => {
    const response = await api.post("/user/send-sms", payload)
    return response.data
  }

  const verifyCode = async (payload: VerifyRequest) => {
    const response = await api.post("/user/verify-code", payload)
    return response.data
  }

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };
  return {sendSms, verifyCode, getToken}
}