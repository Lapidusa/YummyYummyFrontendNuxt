import {useApi} from "@composable/api";
import {useAuth} from "@composable/useAuth";
import type {Product, ProductResponse} from "@interfaces/product";

export const useProduct = () => {
  const api = useApi();
  const auth = useAuth();

  const getProduct = async (productId: string) => {
    const res = await api.get(`/product/${productId}/`);
    return res.data;
  }

  const getProductsByCategory = async (categoryId: string) => {
    const res = await api.get(`/product/by-category/${categoryId}/`);
    return res.data;
  }

  const getProductByStore = async (storeId: string) => {
    const res = await api.get(`/product/by-store/${storeId}/`);
    return res.data;
  }

  const createProduct = async (productData: Product) => {
    const token = auth.getToken()
    if (!token) return

    // 1) Убираем id из продукта
    const { id: _prodId, variants, ...dataWithoutId } = productData

    // 2) Убираем id из каждого варианта
    const cleanedVariants = variants.map(v => {
      const { id: _variantId, image, ...rest } = v
      return {
        ...rest,
        // в formData берем либо файл, либо оставляем null
        image: typeof image === 'string' ? null : image,
      }
    })

    // 3) Собираем уже чистый объект для JSON
    const payload = {
      ...dataWithoutId,
      variants: cleanedVariants,
    }

    // 4) Запаковываем в FormData
    const formData = new FormData()
    formData.append('product_data_json', JSON.stringify(payload))

    // И отдельно загружаем картинки
    cleanedVariants.forEach(v => {
      if (v.image instanceof File) {
        formData.append('images', v.image)
      }
    })

    const res = await api.post(`/product/create/`, formData, {
      headers: { token }
    })
    return res.data
  }

  const updateProduct = async (productData: Product) => {
    const token = auth.getToken();
    if (!token) return
    const formData = new FormData();
    const mappedVariants = productData.variants.map(v => {
      const isChanged = v.image instanceof File;
      return {
        ...v,
        changed_image: isChanged,
        image: v.image instanceof File ? v.image.name : v.image,
      };
    });

    const mappedData = {
      ...productData,
      variants: mappedVariants,
    };
    formData.append("product_data_json", JSON.stringify(mappedData));

    productData.variants.forEach((v, index) => {
      if (v.image instanceof File) {
        formData.append("images", v.image, `variant-${index}-${v.image.name}`);
      }
    });

    const res = await api.put(`/product/update/${productData.id}`, formData, {
      headers: {
        token: token,
      }
    });
    return res.data;
  }

  const deleteProduct = async (productId: string) => {
    const token = auth.getToken();
    if (!token) return
    const res = await api.delete(`/product/delete/${productId}`,  {
      headers: {
        token: token,
      }
    });
    return res.data;
  }
  return {getProduct, getProductsByCategory, getProductByStore, createProduct, updateProduct, deleteProduct}
}