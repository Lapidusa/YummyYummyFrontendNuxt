import {useAuth} from "@composable/useAuth";
import {useApi} from "@composable/api";
import type {Category, CategoryRequest} from "@interfaces/category";

export const useCategory = () => {
  const api = useApi();
  const Auth = useAuth();

  const getCategory = async (categoryId: string) => {
    const res = await api.get(`/category/get-category/${categoryId}`)
    return res.data;
  }

  const getAllCategories = async () => {
    const res = await api.get(`/category/all-categories`);
    return res.data;
  }

  const getCategoryByStoreId = async (storeId: string) => {
    const res = await api.get(`category/get-category-by-store/${storeId}`);
    return res.data;
  }

  const swapPositionCategories = async (firstCategory: string, secondCategory: string) => {
    const token = Auth.getToken();
    if (!token && firstCategory && secondCategory) return
    const res = await api.post(`/category/swap-position/`,{
      first_category: firstCategory,
      second_category: secondCategory
    },
      {headers: {token}
    });
    return res.data;
  }

  const createCategory = async (category: CategoryRequest) => {
    const token = Auth.getToken();
    if (!token && category) return
    const res = await api.post(`/category/create-category/`, category, {headers: {token}});
    return res.data;
  }

  const updateCategory = async (category: Category) => {
    const token = Auth.getToken();
    if (!token && category) return
    const res = await api.put(`/category/${category.id}/`, category, {headers: {token}});
    return res.data;
  }

  const deleteCategory = async (categoryId: string) => {
    const token = Auth.getToken();
    if (!token && categoryId) return
    const res = await api.delete(`/category/${categoryId}/`, {headers: {token}});
    return res.data;
  }
  return {getCategory, getAllCategories, getCategoryByStoreId, swapPositionCategories, createCategory, updateCategory, deleteCategory}
}