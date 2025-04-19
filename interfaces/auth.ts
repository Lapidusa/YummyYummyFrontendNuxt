import type {User} from "@interfaces/user";
import type {BaseResponse} from "@interfaces/response";

export interface SendSmsRequest {
  phone_number: string
}

export interface VerifyRequest {
  phone_number: string
  code: string
}

export interface AuthResponse extends BaseResponse {
  result: true
  token: string
  user: User
}