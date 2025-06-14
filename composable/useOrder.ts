import {useApi} from "@composable/api";
import {useAuth} from "@composable/useAuth";
import { type Order }  from '@interfaces/order'

export const useOrder = () => {
  const api = useApi();
  const auth = useAuth();

  const getMyOrders = async () => {
    const token = auth.getToken();
    if (!token) return;

    const res = await api.get("/order/me/", {
      headers: {token}
    });

    return res.data;
  }

  const getOrdersByStoreId = async (storeId: string) => {
    const token = auth.getToken();
    if (!token) return;

    const res = await api.get(`/order/store/${storeId}`, {
      headers: {token}
    });

    return res.data;
  }

  const getOrdersByStoreIdWithFilter = async (
    storeId: string,
    statuses: number[]
  ): Promise<{ orders: Order[] }> => {
    const token = auth.getToken()
    if (!token) throw new Error('Not authorized')

    const query = statuses
      .map(s => `status=${encodeURIComponent(s)}`)
      .join('&')

    const url = `/order/store/${storeId}/filter?${query}`
    const res = await api.get<{ orders: Order[] }>(url, {
      headers: { token },
    })
    return res.data
  }

  const createOrder = async (data: {}) => {
    const token = auth.getToken();
    if (!token) return;

    const res = await api.post(`/order/`, data,{
      headers: {token}
    });

    return res.data;
  }

  const updateOrderStatus = async (data:{}) => {
    const token = auth.getToken();
    if (!token) return;

    const res = await api.put(`/order/update_order_status`, data,{
      headers: {token}
    });

    return res.data;
  }

  return {getMyOrders, getOrdersByStoreId, getOrdersByStoreIdWithFilter, createOrder, updateOrderStatus}
}