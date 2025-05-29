  <script setup lang="ts">
  import {
    createEmptyIngredient,
    createEmptyPizza,
    createEmptyProduct, createEmptyProductVariant, type IngredientInPizza,
    type Pizza,
    type Product, TypeProduct, TypeProductLabels,
  } from "@interfaces/product";
  import { useProduct } from "@composable/useProduct";
  import { useRoute } from "#imports";
  import { type Category } from "@interfaces/category";
  import ToggleInputYesOrNo from "@components/ToggleInputYesOrNo.vue";
  import { useCategory } from "@composable/useCategory";

  const config = useRuntimeConfig()
  const route = useRoute();
  const UseProduct = useProduct()
  const UseCategory = useCategory()
  const categoryId = computed(() => route.params.categoryId);

  const modalMode = ref<'none' | 'add' | 'update'| 'delete'>('none')
  const modalModeIngredients = ref<'none' | 'add' | 'update'| 'delete'>('none')

  const error = ref<string>('')

  const product = reactive<Product>(createEmptyProduct());
  const pizza = reactive<Pizza>(createEmptyPizza());
  const category = ref<Category|null>(null);
  const ingredient =reactive<IngredientInPizza>(createEmptyIngredient());
  const ingredients =ref<IngredientInPizza[]>([]);
  const products = ref<Product[]>([]);


  const initialData = async () =>{
    const res = await UseProduct.getProductsByCategory(categoryId.value)
    products.value = res.products;
    const resCategory = await UseCategory.getCategory(categoryId.value);
    category.value = resCategory.category;
    // const res = await
  }

  const openModal = async (mode: typeof modalMode.value, isProduct: boolean, data?: Product) => {
    if(isProduct){
      modalMode.value = mode;
      if (data) {
        if(data.type === 0)
          Object.assign(product, {
            ...data,
            variants: [...data.variants]
          });
        else if(data.type === 2){
          Object.assign(product, {...data});
          Object.assign(pizza, {...data, variants: [...data.variants]});
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
        Object.assign(ingredient, {...data})
      }
      else Object.assign(ingredient, createEmptyIngredient());
    }
  }

  const closeModal = () => {
    modalMode.value = 'none';
    modalModeIngredients.value = 'none';
    error.value = '';
  }
  function validator() {
    const images = []
    product.variants.forEach((variant) => {
      images.push(variant.image)
    });
    if (images.length !== product.variants.length) {
      error.value = 'Не выбрана фотография';
      return;
    }

    if (!product.name || !product.description) {
      error.value = 'Заполните название и описание продукта';
      return;
    }

    if (product.type === TypeProduct.GROUP && product.variants.length === 0) {
      error.value = 'Добавьте хотя бы один вариант обычного продукта';
      return;
    }

    if (product.type === TypeProduct.PIZZA && pizza.variants.length === 0) {
      error.value = 'Добавьте хотя бы один вариант пиццы';
      return;
    }
  }
  const createProduct = async () => {
    try {
      error.value = '';

      validator();

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
      validator();

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
  const getImage = (index: number): File | string | null => {
    const variant = product.type === 0 ? product.variants[index] : pizza.variants[index];
    return variant.image || variant.image_url || null;
  }
  const setImage = (index: number, file: File | string | null) => {
    const variants = product.type === 0 ? product.variants : pizza.variants;
    variants[index].image = file;
    // Если пришёл локальный файл — обновляем image_url в null, чтобы не было путаницы
    if (file instanceof File) {
      variants[index].image_url = null;
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

  onMounted(async () => {
    await initialData();
  })
</script>

<template>
  <div class="flex gap-3 max-sm:flex-col-reverse md:flex-row ">
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
        <div class="ingredient" v-if="ingredients.length!==0" v-for="ingredient in ingredients">
          {{ingredient}}
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
            <input
                v-model="product.name"
                type="text"
                placeholder="Название"
                class="input"
            />
            <input
                v-model="product.description"
                type="text"
                placeholder="Описание"
                class="input"
            />
            <div class="modal-product__type-product">
              <label>Тип продукта</label>
              <select v-model="product.type" class="select">
                <option :value="TypeProduct.GROUP"> {{ TypeProductLabels[TypeProduct.GROUP] }} </option>
                <option :value="TypeProduct.PIZZA"> {{ TypeProductLabels[TypeProduct.PIZZA] }} </option>
                <option :value="TypeProduct.CONSTRUCTOR"> {{ TypeProductLabels[TypeProduct.CONSTRUCTOR] }} </option>
              </select>
            </div>
            <div class="modal-product__available">
              <label>Доступно</label>
              <ToggleInputYesOrNo v-model="product.is_available"/>
            </div>
            <div class="modal-product__add-variant">
              <button v-if="product.type === 0" class="modal-product__add-variant_btn" @click="upsertItem('product','add')">
                Добавить вариант обычного продукта
              </button>
              <button v-else-if="product.type === 2" class="modal-product__add-variant_btn" @click="upsertItem('pizza','add')">
                Добавить вариант пиццы
              </button>
            </div>
            <div v-if="product.type === 2" class="modal-product__add-ingredient">
              <button @click="upsertItem('ingredient','add')">Добавить ингредиент</button>
              <div v-for="(ingredient, index) in pizza.ingredients" class="modal-product__add-ingredient_wrapper">

              </div>
            </div>
          </div>
          <div class="modal-product__column">
            <div class="modal-product__add-variant">
              <div v-if="product.type === 0" v-for="(variant, index) in product.variants" :key="index" class="modal-product__add-variant_wrapper">
                <div class="modal-product__variant-index">
                  {{ index + 1 }}
                  <button @click="upsertItem('product','remove', index)"><img class="modal-product__img" src="@assets/icons/delete.svg" alt="Удалить"></button>
                </div>
                <FileDropUpload
                    :modelValue="getImage(index)"
                    @update:modelValue="setImage(index, $event)"
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
                    :modelValue="getImage(index)"
                    @update:modelValue="setImage(index, $event)"
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
    <div class="modal-ingredient__close cursor-pointer" @click="closeModal">
      <img class="closeModal" src="@assets/icons/closeWhite.svg" alt="Закрыть" />
    </div>
    <div class="modal-ingredient modal-ingredient--active">sdaad</div>
  </div>
</template>

<style scoped lang="sass">
@use 'assets/styles/mixins' as *
.products
  @apply flex flex-col gap-3 items-baseline

  &__btn--gradient
    @include button-orange-gradient

  &__wrapper
    @apply grid md:grid-cols-2 sm:grid-cols-1 gap-5

.product
  @apply p-2 rounded-xl shadow flex flex-col gap-3

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
    @apply bg-white rounded-3xl -translate-y-2/4 w-max -translate-x-1/2 absolute
    @apply flex flex-col top-1/2 left-1/2 shadow-lg p-6 z-50 h-max

  &--small
    @apply w-fit h-fit

  &__title
    @apply text-3xl

  &__container
    @apply flex flex-col gap-4

  &__columns
    @apply flex gap-4

  &__column
    @apply flex flex-col gap-4 flex-shrink-0

  &__add-variant
    @apply flex gap-4

    &_wrapper
      @apply flex flex-col gap-4 max-w-52

    &_btn
      @include button-orange-outline

  &__button--gradient
    @include button-orange-gradient
    @apply flex-1

  &__button--outline
    @include button-orange-outline
    @apply flex-1

  &__available
    @apply flex gap-3 items-center

.ingredients
  @apply w-2/5 bg-white p-4 rounded-3xl max-sm:w-full flex max-sm:flex-grow flex-col gap-3

  &__btn--gradient
    @include button-orange-gradient

.closeModal
  @apply absolute top-1 -right-10;

input[type=number]
  max-width: 60px

.not_available
  @apply bg-red bg-opacity-40
</style>