export interface BaseResponse {
  result: boolean
  message: string
}
export interface SuccessResponse<T> extends BaseResponse {
  result: true
  data?: T
}