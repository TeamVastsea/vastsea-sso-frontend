<script lang="ts" setup>
import { useMouse, useToggle } from '@vueuse/core';
import { reactive, ref, unref, watch, type RendererElement } from 'vue';
import { useProvideModalContext } from './constant';

defineProps<{ to?: string|RendererElement }>();
const modelValue = defineModel<boolean>({ default: false });
const isOpen = ref(unref(modelValue));
const { x, y } = useMouse();
const transformer = reactive({ x: 0, y: 0 });
const open = () => {
  modelValue.value = true;
};
const close = () => {
  modelValue.value = false;
};
const toggle = useToggle(isOpen);

watch(() => modelValue, () => {
  isOpen.value = unref(modelValue);
  if (modelValue.value) {
    transformer.x = x.value;
    transformer.y = y.value;
  }
}, { deep: true });

useProvideModalContext({ isOpen, open, close, toggle, transformer });
</script>

<template>
  <teleport :to="$props.to ?? 'body'">
    <slot />
  </teleport>
</template>
