<script lang="ts" setup>
import type { RendererElement } from 'vue';
import { useMouse, useToggle } from '@vueuse/core';
import { onUnmounted, reactive, ref, unref, watch } from 'vue';
import { useProvideModalContext } from './constant';

defineProps<{ to?: string | RendererElement }>();
const emits = defineEmits<{
  hidden: [];
}>();
const modelValue = defineModel<boolean>({ default: false });
const isOpen = ref(unref(modelValue));
const { x, y } = useMouse();
const transformer = reactive({ x: x.value, y: y.value });
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
  if (!isOpen.value) {
    emits('hidden');
  }
}, { deep: true });

useProvideModalContext({ isOpen, open, close, toggle, transformer });
</script>

<template>
  <teleport :to="$props.to ?? 'body'">
    <slot />
  </teleport>
</template>
