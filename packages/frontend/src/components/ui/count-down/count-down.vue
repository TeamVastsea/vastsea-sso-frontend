<script lang="ts" setup>
import { TinyButton } from '@opentiny/vue';
import { computed, ref, unref, watch } from 'vue';

const { interval, endValue, onTrigger, showBehavior } = defineProps<{
  endValue: number;
  interval: number;
  onTrigger?: (val: number) => number;
  showBehavior?: (val: number) => number;
}>();

const emits = defineEmits<{
  onStop: [number];
}>();

const modelValue = defineModel<number>({ required: true });

let timer: number | undefined;

const _onTrigger = onTrigger || ((val: number) => val - 1);
const _showBehavior = showBehavior || ((val: number) => Number.parseInt(val.toString()));

const showValue = computed(() => _showBehavior(unref(modelValue)));

const stop = () => {
  emits('onStop', modelValue.value);
  clearInterval(timer);
  timer = undefined;
};

const start = () => {
  if (timer) {
    stop();
  }
  timer = setInterval(() => {
    modelValue.value = _onTrigger(modelValue.value);
    if (modelValue.value <= endValue) {
      stop();
    }
  }, interval);
};

defineExpose({ stop, start });

watch(() => modelValue, () => {
  if (timer) {
    stop();
  }
  start();
}, { immediate: true, deep: true });
</script>

<template>
  <div class="w-fit">
    <slot v-if="modelValue > endValue" :current-time="modelValue" :show-value="showValue">
      <tiny-button>
        {{ showValue }} 秒
      </tiny-button>
    </slot>
    <slot v-else name="done" />
  </div>
</template>
