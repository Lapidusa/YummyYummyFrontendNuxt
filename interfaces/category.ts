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

export const TypeCategoryLabels: Record<TypeCategory, string> = {
  [TypeCategory.GROUP]: 'Группа',
  [TypeCategory.PIZZA]: 'Пицца',
  [TypeCategory.CONSTRUCTOR]: 'Конструктор',
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

export const createEmptyCategory = (): Category => ({
  id: '',
  name: '',
  store_id:'',
  is_available: true,
  type: TypeCategory.GROUP,
})