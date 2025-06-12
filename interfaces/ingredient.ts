export interface IngredientResponse {
  name: string
  image: File | string | null
  overlay_image: File | string | null
  price: number
  is_deleted: boolean
}

export interface Ingredient extends IngredientResponse{
  id: string
}
export interface IngredientWithQuantity extends Ingredient {
  quantity: number
}
export const IngredientInPizzaLabels: Record<keyof IngredientResponse, string> = {
  name: 'Название',
  image: 'Изображение',
  overlay_image: 'Изображение для конструктора',
  price: 'Цена',
  is_deleted: 'Удаление в составе'
};

export const createEmptyIngredientResponse = ():IngredientResponse=>({
  name: '',
  image: new File([], ''),
  overlay_image: new File([], ''),
  price: 0,
  is_deleted: false,
})

export const createEmptyIngredient = ():Ingredient=>({
  id: '',
  name: '',
  image: new File([], ''),
  overlay_image: new File([], ''),
  price: 0,
  is_deleted: false,
})