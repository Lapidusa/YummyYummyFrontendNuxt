import {useApi} from "@composable/api";
import {useAuth} from "@composable/useAuth";
import type {Ingredient, IngredientResponse} from "@interfaces/ingredient";
import {isFile} from "is-what";

export const useIngredient = () => {
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

  const createIngredient = async (ingredientData: IngredientResponse) => {
    const token = auth.getToken();
    if (!token) return

    const formData = new FormData();
    const mainImg = ingredientData.image;
    const overlayImg = ingredientData.overlay_image;
    const mappedData = {
      ...ingredientData,
      image: mainImg instanceof File ? mainImg.name : mainImg,
      overlay_image: overlayImg instanceof File ? overlayImg.name : overlayImg,
    };
    formData.append("ingredient_data_json", JSON.stringify(mappedData));

    if (mainImg instanceof File) {
      formData.append("images", mainImg);
    }
    if (overlayImg instanceof File) {
      formData.append("images", overlayImg);
    }
    const res = await api.post(`/ingredient/`, formData, {
      headers: {
        token,
      },
    });

    return res.data;
  }
  const updateIngredient = async (ingredientData: Ingredient) => {
    const token = auth.getToken();
    if (!token) return;

    const formData = new FormData();

    const mainImg = ingredientData.image;
    const overlayImg = ingredientData.overlay_image;

    const isMainChanged = isFile(mainImg);
    const isOverlayChanged = isFile(overlayImg);

    const mappedData = {
      ...ingredientData,
      changed_image: isMainChanged,
      image: isMainChanged ? (mainImg as File).name : (typeof mainImg === "string" ? mainImg : null),
      changed_overlay: isOverlayChanged,
      overlay_image: isOverlayChanged
        ? (overlayImg as File).name
        : typeof overlayImg === "string"
          ? overlayImg
          : null,
    };
    formData.append("ingredient_data_json", JSON.stringify(mappedData));

    if (isMainChanged) {
      formData.append("images", mainImg as File);
    }
    if (isOverlayChanged) {
      formData.append("images", overlayImg as File);
    }
    const res = await api.put(`/ingredient/${ingredientData.id}`, formData, {
      headers: { token },
    });

    return res.data;
  };
  const deleteIngredient = async (ingredientId: string) => {
    const token = auth.getToken();
    if (!token) return
    const res = await api.delete(`/ingredient/${ingredientId}`,  {
      headers: {
        token: token,
      }
    });
    return res.data;
  }
  return {getIngredients, getIngredientById, createIngredient, updateIngredient, deleteIngredient}
}