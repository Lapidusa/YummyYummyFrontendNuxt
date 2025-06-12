import {useApi} from "@composable/api";
import {useAuth} from "@composable/useAuth";
import type {CartItemRequest} from "@interfaces/cart";

export const useCartItem = () => {
  const api = useApi();
  const auth = useAuth();

  const debounceSendToServer = async (cartItem:CartItemRequest) => {
    const res = await api.post('/cart-item/preview-price', cartItem)
    return res.data;
  }
  const getCart = async () => {
    const token = auth.getToken()
    if (!token) return
    const res = await api.get('/cart-item/cart', {
      headers: {
        token
      }
    })
    return res.data
  }
  const addCartItem = async (data:CartItemRequest) => {
    const token = auth.getToken();
    if (!token || !data) return
    const res = await api.post(`/cart-item/add-to-cart-item/`, data,{
      headers: {token}
    });
    return res.data;
  }
  return {debounceSendToServer, getCart, addCartItem}
}