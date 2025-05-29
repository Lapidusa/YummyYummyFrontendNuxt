import {useApi} from "@composable/api";
import {useAuth} from "@composable/useAuth";
import type {IngredientInPizza} from "@interfaces/product";
import {isFile} from "is-what";

export const useProduct = () => {
  const api = useApi();
  const auth = useAuth();

  const getIngredients = async () => {
    const res = await api.get(`/ingredient/`);
    return res.data;
  }

  const getIngredientById = async (id: string) => {
    const res = await api.get(`/ingredient/${id}/`);
    return res.data;
  }

  const createIngredient = async (ingredientData: IngredientInPizza) => {
    const token = auth.getToken();
    if (!token) return
    const formData = new FormData();
    const mappedData = {
      ...ingredientData,
      image: typeof ingredientData.image === 'string' ? ingredientData.image : null,
    };
    formData.append('ingredient_data_json', JSON.stringify(mappedData));

    if (ingredientData.image && typeof ingredientData.image !== 'string') {
      formData.append('image', ingredientData.image);
    }

    const res = await api.post(`/ingredient/`, formData, {
      headers: {
        token,
      },
    });

    return res.data;
  }
  const updateIngredient = async (ingredientData: IngredientInPizza) => {
    const token = auth.getToken();
    if (!token) return;

    const formData = new FormData();

    const image = ingredientData.image;

    const isChanged = isFile(image);

    const mappedData = {
      ...ingredientData,
      changed_image: isChanged,
      image: isChanged ? image.name : image ?? null,
    };

    formData.append('ingredient_data_json', JSON.stringify(mappedData));

    if (isChanged) {
      formData.append('image', image);
    }

    const res = await api.put(`/ingredient/${ingredientData.id}`, formData, {
      headers: { token },
    });

    return res.data;
  };
  const deleteIngredient = async (ingredientId: string) => {
    const token = auth.getToken();
    if (!token) return
    const res = await api.delete(`/product/${ingredientId}`,  {
      headers: {
        token: token,
      }
    });
    return res.data;
  }
  return {getIngredients, getIngredientById, createIngredient, updateIngredient}
}