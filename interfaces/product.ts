import type {Ingredient} from "@interfaces/ingredient";

export interface ProductResponse {
  name: string
  description: string
  category_id: string
  is_available: boolean
  type: TypeProduct
  variants: ProductVariant[]
  ingredients?: Ingredient[]
}

export interface Product extends ProductResponse {
  id: string
}

export enum Dough {
  THICK_DOUGH = 0,
  THIN_DOUGH = 1
}

export interface Pizza extends Product {
  dough: Dough.THICK_DOUGH
  ingredients: Ingredient[]
}

export enum TypeProduct {
  GROUP = 0,
  CONSTRUCTOR = 1,
  PIZZA = 2
}
export interface ProductVariant {
  id: string
  size: string
  price: number
  weight: number
  calories: number
  proteins: number
  fats: number
  carbohydrates: number
  is_available: boolean
  image: File | string | null
  image_url: string | null
}

export const ProductFieldLabels: Record<string, string> = {
  name: 'Название',
  description: 'Описание',
  category_id: 'Категория',
  is_available: 'Доступен',
  type: 'Тип продукта',
  variants: 'Варианты',
};

export const ProductVariantLabels: Record<string, string> = {
  size: 'Размер',
  price: 'Цена',
  weight: 'Вес',
  calories: 'Калории',
  proteins: 'Белки',
  fats: 'Жиры',
  carbohydrates: 'Углеводы',
  is_available: 'Доступен',
  image: 'Изображение',
  image_url: 'URL изображения',
};

export const TypeProductLabels: Record<TypeProduct, string> = {
  [TypeProduct.GROUP]: 'Группа',
  [TypeProduct.PIZZA]: 'Пицца',
  [TypeProduct.CONSTRUCTOR]: 'Конструктор',
}

export const TypeDoughLabels: Record<Dough, string> = {
  [Dough.THICK_DOUGH]: 'Традиционное',
  [Dough.THIN_DOUGH]: 'Тонкое',
}

export const createEmptyProduct = () :Product => ({
  id: '',
  name: '',
  description: '',
  category_id:'',
  is_available: true,
  type: TypeProduct.GROUP,
  variants: []
})

export const createEmptyPizza = (): Pizza => ({
  id: '',
  name: '',
  description: '',
  category_id: '',
  is_available: true,
  type: TypeProduct.PIZZA,
  variants: [],
  dough: Dough.THICK_DOUGH,
  ingredients: [],
})

export const createEmptyProductVariant = () :ProductVariant => ({
  id: '',
  size: '',
  price: 100,
  weight: 100,
  calories: 150,
  proteins: 8,
  fats: 10,
  carbohydrates: 5,
  is_available: true,
  image: new File([], ''),
  image_url: ''
})