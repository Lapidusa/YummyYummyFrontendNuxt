export interface CategoryRequest {
  name: string
  store_id: string
  is_available: boolean
  type: TypeCategory
}

export interface Category extends CategoryRequest {
  id: string
  position: number
}

export enum TypeCategory {
  GROUP = "group",
  PIZZA = "pizza",
  CONSTRUCTOR = "constructor"
}