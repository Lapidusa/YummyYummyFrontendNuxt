export interface CategoryRequest {
  name: string
  store_id: string
  is_available: boolean
  type: TypeCategory
}

export interface Category extends CategoryRequest {
  id: string
}

export enum TypeCategory {
  GROUP = 0,
  PIZZA = 1,
  CONSTRUCTOR = 2
}

export interface SwapDataCategory {
  first_category: string
  second_category: string
}

export const CategoryFieldLabels: Record<string, string> = {
  name: 'Название',
  store_id: 'Магазин',
};

export const createEmptyCategoryRequest = (): CategoryRequest => ({
  name: '',
  store_id:'',
  is_available: true,
  type: TypeCategory.GROUP,
})