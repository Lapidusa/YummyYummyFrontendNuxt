import {Dough, type ProductVariant} from "@interfaces/product";
import type {Ingredient} from "@interfaces/ingredient";

export interface CartItemRequest {
  id?: string;
  type: 'simple' | 'pizza';
  product_variant_id: string;
  quantity: number;
  name?: string;
  dough?: Dough;
  price: number;
  added_ingredients?: AddedIngredient[];
  removed_ingredients?: RemovedIngredient[];
  variant?: ProductVariant
}

export interface AddedIngredient {
  id?: string;
  ingredient_id: string;
  quantity: number;
  image_url?: string;
  overlay_url?: string;
  name?: string;
  ingredient?: Ingredient;
}

export interface RemovedIngredient extends AddedIngredient{}

export const createEmptyCartItem = (): CartItemRequest => ({
  type: 'simple',
  product_variant_id: '',
  quantity: 0,
  price: 0
})