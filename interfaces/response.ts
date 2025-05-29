export interface BaseResponse {
  result: boolean
  message: string
}
export interface SuccessResponse<T> extends BaseResponse {
  result: true
  data?: T
}
function isFile(image: unknown): image is File {
  return image instanceof File;
}