  <script setup lang="ts">
  import {
    createEmptyPizza,
    createEmptyProduct, createEmptyProductVariant, Dough,
    type Pizza,
    type Product, ProductFieldLabels, ProductVariantLabels, TypeProduct, TypeProductLabels,
  } from "@interfaces/product";
  import {
    createEmptyIngredient, type IngredientResponse, IngredientInPizzaLabels, type Ingredient
  } from "@interfaces/ingredient";
  import { useRoute } from "#imports";
  import { type Category } from "@interfaces/category";
  import { useCategory } from "@composable/useCategory";
  import { useProduct } from "@composable/useProduct";
  import { useIngredient } from "@composable/useIngredient";

  const config = useRuntimeConfig()
  const route = useRoute();
  const UseProduct = useProduct()
  const UseCategory = useCategory()
  const UseIngredient = useIngredient()
  const categoryId = computed(() => route.params.categoryId);
  const selectedIngredients = ref<Ingredient[]>([]);
  const modalMode = ref<'none' | 'add' | 'update'| 'delete'>('none')
  const modalModeIngredients = ref<'none' | 'add' | 'update'| 'delete'>('none')
  const error = ref<string>('')
  const dropdownOpen = ref<boolean>(false)

  const product = reactive<Product>(createEmptyProduct());
  const pizza = reactive<Pizza>(createEmptyPizza());
  const category = ref<Category|null>(null);
  const ingredient =reactive<Ingredient>(createEmptyIngredient());

  const ingredients =ref<Ingredient[]>([]);
  const products = ref<Product[]>([]);

  const initialData = async () =>{
    const resProducts = await UseProduct.getProductsByCategory(categoryId.value)
    products.value = resProducts.products;

    const resCategory = await UseCategory.getCategory(categoryId.value);
    category.value = resCategory.category;

    const resIngredients = await UseIngredient.getIngredients()
    ingredients.value = resIngredients.ingredients;
  }

  function validateAndSetError(type: 'product' | 'ingredient'): boolean {
    if(type === 'product') {
      const errorMessageProduct = validateEmptyFieldsByLabels(product, ProductFieldLabels)
      if (product.type === 0){
        const errorMessageVariant = validateEmptyFieldsByLabels(product.variants, ProductVariantLabels)
        if (errorMessageProduct || errorMessageVariant) {
          error.value = "Заполните обязательные поля: -" + errorMessageProduct! + " у варианта: -" + errorMessageVariant!;
          return false
        }

      }else if (product.type === 2){
        const errorMessageVariant = validateEmptyFieldsByLabels(pizza.variants, ProductVariantLabels)
        if (errorMessageProduct || errorMessageVariant) {
          error.value = "Заполните обязательные поля: -" + errorMessageProduct! + " у варианта: -" + errorMessageVariant!;
          return false
        }
      }
    }else if (type === 'ingredient') {
      const errorMessageIngredient = validateEmptyFieldsByLabels(ingredient, IngredientInPizzaLabels)
      if (errorMessageIngredient) {
        error.value = "Заполните обязательные поля: -" + errorMessageIngredient;
        return false
      }
    }

    error.value = ''
    return true
  }

  const openModal = async (mode: typeof modalMode.value, isProduct: boolean, data?: Product|Ingredient) => {
    if(isProduct){
      modalMode.value = mode;
      if (data) {
        const prod = data as Product;

        if(prod.type === 0)
          Object.assign(product, {
            ...prod,
            variants: prod.variants.map(v => ({ ...v })),
          });
        else if(prod.type === 2){
          Object.assign(product, {...prod});
          Object.assign(pizza, {...prod, variants: prod.variants.map(v => ({ ...v }))});
        }
      }
      else {
        Object.assign(product, createEmptyProduct());
        Object.assign(pizza, createEmptyPizza());
      }
    }
    else{
      modalModeIngredients.value = mode;
      if(data){
        const ingr = data as Ingredient;
        Object.assign(ingredient, {...ingr})
      }
      else Object.assign(ingredient, createEmptyIngredient());
    }
  }

  const closeModal = () => {
    modalMode.value = 'none';
    modalModeIngredients.value = 'none';
    error.value = '';
  }

  const createProduct = async () => {
    try {

      validateAndSetError('product');

      const payload: Product = {
        ...product,
        category_id: categoryId.value,
        variants: product.type === TypeProduct.PIZZA ? pizza.variants : product.variants
      };

      const res = await UseProduct.createProduct(payload);

      if (res.result) {
        error.value = ''
        await initialData();
        closeModal();
      } else {
        error.value = res.message || 'Ошибка при создании продукта';
      }

    } catch (e: any) {
      console.error(e);
      error.value = 'Произошла ошибка при создании продукта';
    }
  };

  const updateProduct = async () => {
    try {
      error.value = '';
      validateAndSetError('product')

      const payload: Product = {
        ...product,
        category_id: categoryId.value,
        variants: product.type === TypeProduct.PIZZA ? pizza.variants : product.variants
      };
      console.log(payload)
      const res = await UseProduct.updateProduct(payload);

      if (res.result) {
        error.value = ''
        await initialData();
        closeModal();
      } else {
        error.value = res.message || 'Ошибка при создании продукта';
      }

    } catch (e: any) {
      console.error(e);
      error.value = 'Произошла ошибка при изменении продукта';
    }
  }

  const deleteProduct = async () => {
    try {
      error.value = '';
      const res = await UseProduct.deleteProduct(product.id);

      if (res.result) {
        await initialData();
        closeModal();
      } else {
        error.value = res.message || 'Ошибка при удалении продукта';
      }
    } catch (e: any) {
      console.error(e);
      error.value = 'Произошла ошибка при удалении продукта';
    }
  };

  const createIngredient = async () => {
    validateAndSetError('ingredient')
    const { id, ...ingredientData } = ingredient;
    const payload = ingredientData as Omit<IngredientResponse, "id">;
    const res = await UseIngredient.createIngredient(payload)
    if (res.result) {
      error.value = ''
      await initialData();
      closeModal();
    } else {
      error.value = res.message || 'Ошибка при создании продукта';
    }
  }

  const updateIngredient = async () => {
    validateAndSetError('ingredient')
    const res = await UseIngredient.updateIngredient(ingredient)
    if (res.result) {
      error.value = ''
      await initialData();
      closeModal();
    } else {
      error.value = res.message || 'Ошибка при изменении продукта';
    }
  }

  const deleteIngredient = async () => {
    const res = await UseIngredient.deleteIngredient(ingredient.id)
    if (res.result) {
      error.value = ''
      await initialData();
      closeModal();
    }
    else {
      error.value = res.message || 'Ошибка при удалении продукта';
    }
  }

  const upsertItem = async (
    type: 'product' | 'pizza' | 'ingredient',
    action: 'add' | 'remove',
    index?: number,
    data?: any
  ) => {
    const itemTemplate = {
      product: createEmptyProductVariant(),
      // ingredients: createEmptyIngredient(),
    };
    error.value = '';
    const max_variants = 3;

    switch (type) {
      case 'product':
        if (action === 'add' && product.variants.length < max_variants) {
          pizza.variants.length = 0
          product.variants.push(data || itemTemplate.product);
        } else if (action === 'remove' && index !== undefined) {
          product.variants.splice(index, 1);
        }else if (action === 'add') {
          error.value = 'Максимум могут быть 3 варианта';
        }
        break;

      case 'pizza':
        if (action === 'add' && pizza.variants.length < max_variants) {
          product.variants.length = 0
          pizza.variants.push(data || itemTemplate.product);
        } else if (action === 'remove' && index !== undefined) {
          pizza.variants.splice(index, 1);
        }else if (action === 'add') {
          error.value = 'Максимум могут быть 3 варианта';
        }
        break;

      // case 'ingredient':
      //   if (action === 'add') {
      //     ingredient.value.push(data || itemTemplate.ingredient);
      //   } else if (action === 'remove' && index !== undefined) {
      //     ingredient.value.splice(index, 1);
      //   }
      //   break;

      default:
        throw new Error('Unknown type');
    }
  };

  const getImage = (type: 'product' | 'ingredient', indexOrField?: number | "overlay"): File | string | null => {
    if (type === 'product' && typeof indexOrField === 'number') {
      const variant = product.type === 0 ? product.variants[indexOrField] : pizza.variants[indexOrField];
      return variant.image || variant.image_url || null;
    }
    else if (type === 'ingredient') {
      if (indexOrField === "overlay") {
        return ingredient.overlay_image
      }
      return ingredient.image
    }
    return null;
  }

  const setImage = (type: 'product' | 'ingredient', file: File | string | null, indexOrField: number | "overlay", ) => {
    if (type === 'product' && typeof indexOrField === 'number') {
      const variants = product.type === 0 ? product.variants : pizza.variants;
      variants[indexOrField].image = file;
      if (file instanceof File) {
        variants[indexOrField].image_url = null;
      }
    }
    else if (type === 'ingredient') {
      if (indexOrField === "overlay") {
        ingredient.overlay_image = file
      } else {
        ingredient.image = file
      }
    }
  }

  function getDisplayVariant (product: Product) {
    const len = product.variants.length
    if (len === 0) return null
    return product.variants[len % 2 === 0 ? len - 1 : Math.floor(len / 2)]
  }

  function getMinPrice (product: Product):number | null {
    if (!product.variants.length) return null
    return Math.min(...product.variants.map(v=>v.price))
  }

  function isSelected(ingredient: Ingredient) {
    return selectedIngredients.value.some((i) => i.id === ingredient.id);
  }

  function toggleIngredient(ingredient: Ingredient) {
    const idx = selectedIngredients.value.findIndex((i) => i.id === ingredient.id);
    if (idx >= 0) {
      removeIngredient(idx);
    } else {
      selectedIngredients.value.push({ ...ingredient, is_deleted: false });
    }
  }

  function removeIngredient(index: number) {
    selectedIngredients.value.splice(index, 1);
  }

  function copyProductToPizza(src: Product, dest: Pizza) {
    dest.id = src.id;
    dest.name = src.name;
    dest.description = src.description;
    dest.category_id = src.category_id;
    dest.is_available = src.is_available;
    dest.variants = src.variants.map(v => ({ ...v }));
    dest.dough = Dough.THICK_DOUGH;
    dest.ingredients = [];
  }

  function copyPizzaToProduct(src: Pizza, dest: Product) {
    dest.id = src.id;
    dest.name = src.name;
    dest.description = src.description;
    dest.category_id = src.category_id;
    dest.is_available = src.is_available;
    dest.variants = src.variants.map(v => ({ ...v }));
  }

  watch(()=>product.type,(newType, oldType)=>{
    if (oldType === TypeProduct.GROUP && newType === TypeProduct.PIZZA) {
      copyProductToPizza(product, pizza);
    }
    else if (oldType === TypeProduct.PIZZA && newType === TypeProduct.GROUP) {
      copyPizzaToProduct(pizza, product);
    }
  });

  watch(
      () => selectedIngredients.value,
      (newList) => {
        pizza.ingredients = newList.map((i) => ({
          id: i.id,
          is_deleted: i.is_deleted,
          name: i.name,
          image: i.image,
          overlay_image: i.overlay_image,
          price: i.price,
        }));
      },
      { deep: true }
  );

  onMounted(async () => {
    await initialData();
  })
</script>

<template>
  <div class="flex gap-3 max-sm:flex-col-reverse md:flex-row justify-between">
    <div class="products">
      <button class="products__btn--gradient" @click="openModal('add', true)">Создать продукт</button>
      <div class="products__container" v-if="products.length > 0">
        <p v-if="category" class="products__category-name">{{ category.name }}</p>
        <div class="products__wrapper">
          <div class="product" v-for="product in products" :key="product.id">
            <div class="product__image_wrapper" :class="!product.is_available ? 'not_available' : ''">
              <img
                :src="`${config.public.serverUrl}${getDisplayVariant(product)!.image}`"
                :alt="getDisplayVariant(product)!.size"
                v-if="product.variants"
                class="w-full aspect-square object-cover"
              />
            </div>
            <div class="product__down">
              <div class="product__down-text">
                <p>{{product.name}}</p>
                <p>от {{getMinPrice(product)}} ₽</p>
              </div>
              <div class="product__down-actions">
                <button class="product__down-btn view-product__btn--update" @click="openModal('update', true, product)">
                  <img src="@assets/icons/update.svg" alt="update" />
                </button>
                <button class="product__down-btn view-product__btn--delete" @click="openModal('delete', true, product)">
                  <img src="@assets/icons/delete.svg" alt="delete" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-products">Нет продуктов</div>
    </div>
    <div class="ingredients">
      <button class="ingredients__btn ingredients__btn--gradient" @click="openModal('add',false)">Добавить ингредиент</button>
      <div class="ingredients__wrapper">
        <div class="ingredient" v-if="ingredients.length !== 0" v-for="ingredient in ingredients">
          <img class="ingredient__img" :src="`${config.public.serverUrl}${ingredient.image}`" alt="Изображение">/
          <img class="ingredient__img" :src="`${config.public.serverUrl}${ingredient.overlay_image}`" alt="Изображение для конструтора">
          <div class="ingredient__down-actions">
            <button class="ingredient__down-btn view-product__btn--update" @click="openModal('update', false, ingredient)">
              <img src="@assets/icons/update.svg" alt="update" />
            </button>
            <button class="ingredient__down-btn view-product__btn--delete" @click="openModal('delete', false, ingredient)">
              <img src="@assets/icons/delete.svg" alt="delete" />
            </button>
          </div>
          <p class="ingredient__text">{{ingredient.name}}</p>
          <p class="ingredient__text">{{ingredient.price}} ₽</p>

        </div>
        <p v-else>Нет доступных ингредиентов</p>
      </div>
    </div>
  </div>
  <div v-if="modalMode !== 'none'" class="modal-product" data-modal-backdrop="static">
  <div class="modal-product modal-product--active">
    <div class="modal-product__close cursor-pointer" @click="closeModal">
      <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
    </div>
    <div class="modal-product__container">
      <template v-if="modalMode === 'add' || modalMode === 'update'">
        <div class="modal-product__columns">
          <div class="modal-product__column">
            <div class="modal-product__title">
              {{ modalMode === "add" ? 'Добавить продукт' : 'Редактировать продукт' }}
            </div>
            <label class="label-column" for="input-product-name">
              Название
              <input
                  id="input-product-name"
                  v-model="product.name"
                  type="text"
                  placeholder="Название"
                  class="input"
              />
            </label>
            <label class="label-column" for="input-product-description">
              Описание
              <input
                  id="input-product-description"
                  v-model="product.description"
                  type="text"
                  placeholder="Описание"
                  class="input"
              />
            </label>
            <div class="modal-product__controls">
              <div class="modal-product__type-product">
                <label>Тип продукта
                  <select v-model="product.type" class="select">
                    <option :value="TypeProduct.GROUP">📂 {{ TypeProductLabels[TypeProduct.GROUP] }}</option>
                    <option :value="TypeProduct.PIZZA">🍕 {{ TypeProductLabels[TypeProduct.PIZZA] }}</option>
                    <option :value="TypeProduct.CONSTRUCTOR">🔧 {{ TypeProductLabels[TypeProduct.CONSTRUCTOR] }}</option>
                  </select>
                </label>
              </div>
              <div class="modal-product__available">
                <label>Доступно</label>
                <ToggleInputYesOrNo v-model="product.is_available" />
              </div>
            </div>
            <div class="modal-product__add-variant">
              <button v-if="product.type === 0" class="modal-product__add-variant_btn" @click="upsertItem('product','add')">
                Добавить вариант обычного продукта
              </button>
              <button v-if="product.type === 2" class="modal-product__add-variant_btn" @click="upsertItem('pizza','add')">
                Добавить вариант пиццы
              </button>
            </div>
            <div v-if="product.type === 2" class="modal-product__add-ingredient">
              <div
                  v-if="selectedIngredients.length"
                  class="flex flex-wrap gap-2 mb-4"
              >
      <span
          v-for="(ing, idx) in selectedIngredients"
          :key="ing.id"
          class="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm"
      >
        <img
            :src="`${config.public.serverUrl}${ing.image}`"
            :alt="ing.name"
            class="w-6 h-6 rounded-full mr-1"
        />
        {{ ing.name }}

        <button
            @click="removeIngredient(idx)"
            class="ml-1 text-gray-600 hover:text-gray-900"
            aria-label="Удалить ингредиент"
        >
          &times;
        </button>

        <label class="ml-2 flex items-center text-xs">
          Удаляемый?
          <ToggleInputYesOrNo
              v-model="ing.is_deleted"
              class="ml-1"
          />
        </label>
          </span>
              </div>
              <div class="relative inline-block">
                <button
                    @click="dropdownOpen = !dropdownOpen"
                    type="button"
                    class="modal-ingredient__button--gradient"
                >
                  Добавить ингредиент
                </button>

                <div
                    v-show="dropdownOpen"
                    class="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto"
                >
                  <ul>
                    <li
                        v-for="ing in ingredients"
                        :key="ing.id"
                        class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        @click="toggleIngredient(ing)"
                    >
                      <input
                          type="checkbox"
                          class="form-checkbox h-4 w-4 text-blue-600"
                          :checked="isSelected(ing)"
                          readonly
                      />
                      <img
                          :src="`${config.public.serverUrl}${ing.image}`"
                          :alt="ing.name"
                          class="w-6 h-6 rounded-full ml-2 mr-2"
                      />
                      <span class="text-gray-800">{{ ing.name }}</span>
                    </li>
                    <li
                        v-if="!ingredients.length"
                        class="px-3 py-2 text-gray-500"
                    >
                      Нет доступных ингредиентов
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-product__column" v-if="(product.type === 0 && product.variants.length !== 0) || (product.type === 2 && pizza.variants.length !== 0)">
            <div class="modal-product__add-variant">
              <div v-if="product.type === 0" v-for="(variant, index) in product.variants" :key="index" class="modal-product__add-variant_wrapper">
                <div class="modal-product__variant-index">
                  {{ index + 1 }}
                  <button @click="upsertItem('product','remove', index)"><img class="modal-product__img" src="@assets/icons/delete.svg" alt="Удалить"></button>
                </div>
                <FileDropUpload
                    :modelValue="getImage('product', index)"
                    @update:modelValue="setImage('product', $event, index)"
                />
                <label :for="'product-size' + index ">
                  Название варианта:
                  <input class="modal-product__input" :id="'product-size' + index" type="text" v-model="product.variants[index].size" placeholder="Название варианта"/>
                </label>
                <label :for="'product-calories' + index">
                  Каллории:
                  <input class="modal-product__input" :id="'product-calories' + index" type="number" v-model="product.variants[index].calories" placeholder="Каллории"/>
                </label>
                <label :for="'product-proteins' + index">
                  Белки:
                  <input class="modal-product__input" :id="'product-proteins' + index" type="number" v-model="product.variants[index].proteins" placeholder="Белки"/>
                </label>
                <label :for="'product-fats' + index">
                  Жиры:
                  <input class="modal-product__input" :id="'product-fats' + index" type="number" v-model="product.variants[index].fats" placeholder="Жиры"/>
                </label>
                <label :for="'product-carbohydrates' + index">
                  Углеводы:
                  <input class="modal-product__input" :id="'product-carbohydrates' + index" type="number" v-model="product.variants[index].carbohydrates" placeholder="Углеводы"/>
                </label>
                <label :for="'product-price' + index">
                  Цена:
                  <input class="modal-product__input" :id="'product-price' + index" type="number" v-model="product.variants[index].price" placeholder="Цена"/>
                </label>

                <div class="modal-product__available">
                  <label>Доступно</label>
                  <ToggleInputYesOrNo v-model="product.variants[index].is_available"/>
                </div>
              </div>

              <div v-if="product.type === 2" v-for="(variant, index) in pizza.variants" :key="index" class="modal-product__add-variant_wrapper">
                <div class="modal-product__variant-index">
                  {{ index + 1 }} <button @click="upsertItem('pizza','remove', index)"><img class="modal-product__img" src="@assets/icons/delete.svg" alt="Удалить"></button>
                </div>
                <FileDropUpload
                    :modelValue="getImage('product', index)"
                    @update:modelValue="setImage('product', $event, index)"
                />
                <label :for="'pizza-size' + index" class="flex flex-col">
                  Название варианта:
                  <input class="modal-product__input" :id="'pizza-size' + index" type="text" v-model="pizza.variants[index].size" placeholder="Название варианта" />
                </label>

                <label :for="'pizza-calories' + index">
                  Калории:
                  <input class="modal-product__input" :id="'pizza-calories' + index" type="number" v-model="pizza.variants[index].calories" placeholder="Калории" />
                </label>

                <label :for="'pizza-proteins' + index">
                  Белки:
                  <input class="modal-product__input" :id="'pizza-proteins' + index" type="number" v-model="pizza.variants[index].proteins" placeholder="Белки" />
                </label>

                <label :for="'pizza-fats' + index">
                  Жиры:
                  <input class="modal-product__input" :id="'pizza-fats' + index" type="number" v-model="pizza.variants[index].fats" placeholder="Жиры" />
                </label>

                <label :for="'pizza-carbohydrates' + index">
                  Углеводы:
                  <input class="modal-product__input" :id="'pizza-carbohydrates' + index" type="number" v-model="pizza.variants[index].carbohydrates" placeholder="Углеводы" />
                </label>

                <label :for="'pizza-price' + index">
                  Цена:
                  <input class="modal-product__input" :id="'pizza-price' + index" type="number" v-model="pizza.variants[index].price" placeholder="Цена" />
                </label>

                <div class="modal-product__available">
                  <label>Доступно</label>
                  <ToggleInputYesOrNo v-model="pizza.variants[index].is_available" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <p class="text-red" v-if="error">{{ error }}</p>
        <button
            class="modal-product__button--gradient"
            @click="modalMode==='add' ? createProduct() : updateProduct()"
        >
          {{ modalMode === 'add' ? 'Добавить' : 'Изменить' }}
        </button>
      </template>
      <template v-else-if="modalMode === 'delete'">
        <div class="modal-product__column">
          <div class="modal-product__title">
            Удалить продукт {{product.name}} ({{product.variants.length}} вариантов)?
          </div>
          <p class="text-red" v-if="error">{{ error }}</p>
          <div class="flex gap-5 justify-center">
            <button @click="deleteProduct" class="modal-product__button--gradient">Удалить</button>
            <button @click="closeModal" class="modal-product__button--outline">Отмена</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</div>
  <div v-if="modalModeIngredients !== 'none'" class="modal-ingredient">
    <div class="modal-ingredient modal-ingredient--active">
      <div class="modal-ingredient__close cursor-pointer" @click="closeModal">
        <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
      </div>

      <div class="modal-ingredient__container">
        <template v-if="modalModeIngredients === 'add' || modalModeIngredients === 'update'">
          <div class="modal-ingredient__title">
            {{ modalModeIngredients === "add" ? 'Добавить ингредиент' : 'Редактировать ингредиент' }}
          </div>

          <label for="ingredient-image" class="ingredient-image">
            Изображение
            <FileDropUpload id="ingredient-image"
              :modelValue="getImage('ingredient')"
              @update:modelValue="val => setImage('ingredient', val, 0)"
            />
          </label>

          <label for="ingredient-overlay-image" class="ingredient-overlay-image">
            Изображение для конструктора
            <FileDropUpload id="ingredient-overlay-image"
              :modelValue="getImage('ingredient', 'overlay')"
              @update:modelValue="val => setImage('ingredient', val, 'overlay')"
            />
          </label>

          <label for="ingredient-image" class="ingredient-image">
            Название
            <input
              v-model="ingredient.name"
              type="text"
              placeholder="Введите название"
              class="input"
            />
          </label>

          <label for="ingredient-image" class="ingredient-image">
            Цена
            <input
                v-model="ingredient.price"
                type="number"
                placeholder="Введите цену"
                class="input"
            />
          </label>

          <button
              class="modal-ingredient__button--gradient"
              @click="modalModeIngredients==='add' ? createIngredient() : updateIngredient()"
          >
            {{ modalModeIngredients === 'add' ? 'Добавить' : 'Изменить' }}
          </button>
        </template>

        <template v-else-if="modalModeIngredients === 'delete'">
          <div class="modal-ingredient__title">
            Удалить ингредиент {{ ingredient.name }}?
          </div>
          <p class="text-red" v-if="error">{{ error }}</p>
          <div class="flex gap-5 justify-center">
            <button @click="deleteIngredient" class="modal-ingredient__button--gradient">Удалить</button>
            <button @click="closeModal" class="modal-ingredient__button--outline">Отмена</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
@use 'assets/styles/mixins' as *
.products
  @apply flex flex-col gap-3 items-baseline

  &__btn--gradient
    @include button-orange-gradient
    @apply max-sm:w-full

  &__wrapper
    @apply grid md:grid-cols-3 sm:grid-cols-2 gap-5

  &__container
    @apply flex flex-col gap-2

.product
  @apply p-2 rounded-xl shadow flex flex-col gap-3 bg-white

  &__image_wrapper
    @apply bg-none rounded-lg p-2

  &__down
    @apply flex justify-between items-center

    &-actions
      @apply flex

    &-btn
      @apply p-2 hover:bg-white hover:shadow-sm rounded-full

.modal-product, .modal-ingredient
  @apply fixed inset-0 bg-black bg-opacity-70 z-[1000]

  &--active
    @apply bg-white rounded-3xl -translate-y-2/4 w-max -translate-x-1/2 absolute max-w-[80%]
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 h-max

  &--small
    @apply w-fit h-fit

  &__title
    @apply text-3xl

  &__container
    @apply flex flex-col gap-4

  &__columns
    @apply flex gap-4 overflow-auto

  &__column
    @apply flex flex-col gap-4 flex-shrink-0
    &:first-child
      @apply  max-w-96

  &__add-variant
    @apply flex gap-4

    &_wrapper
      @apply flex flex-col gap-4 max-w-52

    &_btn
      @include button-orange-outline
      @apply w-full

  &__button--gradient
    @include button-orange-gradient
    @apply flex-1 w-full

  &__button--outline
    @include button-orange-outline
    @apply flex-1

  &__available
    @apply flex gap-3 items-center

  &__add-ingredient
    @apply w-full

    &_wrapper
      @apply flex items-center gap-2

.label-column
  @apply flex flex-col items-start gap-0

.label-row, .modal-product__controls
  @apply flex items-center gap-2

.ingredients
  @apply w-2/4 bg-white p-4 rounded-3xl max-sm:w-full flex max-sm:flex-grow flex-col gap-3

  &__btn--gradient
    @include button-orange-gradient

  &__wrapper
    @apply flex flex-col gap-3

.modal-ingredient
  label
    @apply flex flex-col items-start gap-0

.ingredient
  @apply flex gap-2 items-center flex-wrap

  &__img
    @apply w-9 h-9

  &__wrapper
    @apply flex flex-col gap-2

  .input
    @apply w-full

  &__down-actions
    @apply flex gap-2

.closeModal
  @apply absolute top-1 -right-10;

label
  @apply flex gap-2 items-center

input[type=number]
  @apply flex-1
select
  @apply p-2

  &:focus-visible
    @apply outline-orange rounded-full

select option
  &:checked
    @apply bg-orange
    color: white

  &:first-child
    border: 0

.not_available
  @apply bg-red bg-opacity-40

option:hover
  @apply bg-orange
</style>