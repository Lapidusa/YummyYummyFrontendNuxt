<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});
const phoneNumber = ref('');
const emit = defineEmits(['update:modelValue']);

const formattedPhoneNumber = ref(props.modelValue);

watch(formattedPhoneNumber, (newValue) => {
  emit('update:modelValue', newValue);
});

const mask = (event) => {
  const input = event.target;
  const keyCode = event.keyCode;
  const pos = input.selectionStart;

  if (pos < 3) event.preventDefault();

  const matrix = "+7 (___) ___-__-__";
  let i = 0;
  const def = matrix.replace(/\D/g, "");
  const val = input.value.replace(/\D/g, "");
  let new_value = matrix.replace(/[_\d]/g, (a) => {
    return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
  });

  i = new_value.indexOf("_");
  if (i !== -1) {
    i < 5 && (i = 3);
    new_value = new_value.slice(0, i);
  }

  const reg = matrix.substr(0, input.value.length).replace(/_+/g, (a) => {
    return "\\d{1," + a.length + "}";
  }).replace(/[+()]/g, "\\$&");

  const regex = new RegExp("^" + reg + "$");
  if (!regex.test(input.value) || input.value.length < 5 || (keyCode > 47 && keyCode < 58)) {
    input.value = new_value;
  }

  if (event.type === "blur" && input.value.length < 5) {
    input.value = "";
  }

  phoneNumber.value = input.value;
  formattedPhoneNumber.value = formatPhoneNumber(phoneNumber.value);
};


const formatPhoneNumber = (number) => {
  const cleaned = number.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return cleaned;
  } else if (cleaned.length === 10) {
    return '7' + cleaned;
  }

  return cleaned;
};
const blurHandler = (event) => {
  if (event.target.value.length < 5) {
    event.target.value = "";
    formattedPhoneNumber.value = "";
  }
};
</script>

<template>
  <input
      type="tel"
      placeholder="+7 (___) ___-__-__"
      class="border border-gray-300 rounded-md p-2 w-full"
      v-model="phoneNumber"
      @input="mask"
      @focus="mask"
      @blur="blurHandler"
  />
</template>

<style scoped lang="scss">
input {
  @apply border border-solid border-orange rounded-2xl w-full;
}
</style>