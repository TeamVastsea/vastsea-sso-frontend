<script lang="ts" setup generic="T extends AcceptableValue">
import type { AcceptableValue } from 'reka-ui';
import type { Ref } from 'vue';
import type { OptionProps, SelectProps } from './select.options';
import { vInfiniteScroll } from '@vueuse/components';
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from 'reka-ui';
import { ref, toRefs, watch } from 'vue';
import SelectOption from './option.vue';
import { useProvide } from './select.options';

type FinalSelectOption = { multiple?: boolean; defaultOpen?: boolean; displayBehavior?: (val: T) => string } & SelectProps<T>;

const props = defineProps<FinalSelectOption>();
const emits = defineEmits<{
  scrollBottom: [];
}>();

const defaultDisplayBehavior = (val: T extends SelectProps<infer R> ? R : unknown) => {
  return val;
};

const modelValue = defineModel<AcceptableValue[]>();
const { options, multiple, displayBehavior = defaultDisplayBehavior } = toRefs(props);

const renderOptions: Ref<OptionProps<AcceptableValue>[]> = ref<OptionProps<AcceptableValue>[]>(
  [
    ...(options.value ?? []),
  ],
);

const values: Ref<AcceptableValue[]> = ref([]);

const onSelect = (value: AcceptableValue) => {
  if (!multiple.value) {
    values.value = Array.isArray(value) ? value : [value];
    return;
  }
  if (!values.value.includes(value)) {
    values.value.push(value);
  }
};
const onRemove = (value: AcceptableValue) => {
  const idx = values.value.indexOf(value);
  if (idx > -1) {
    values.value.splice(idx, 1);
  }
};
const onScrollBottom = () => {
  emits('scrollBottom');
};

useProvide({
  renderOptions,
  values,
});
watch(options, () => {
  renderOptions.value = options.value ?? [];
}, { immediate: true });
watch(values, () => {
  modelValue.value = values.value;
}, { deep: true });
</script>

<template>
  <combobox-root v-model="values" class="relative" :multiple="multiple" :default-open="defaultOpen" @update:model-value="(value) => onSelect(value)">
    <combobox-anchor class="w-full">
      <combobox-trigger class="group h-40px w-full">
        <slot name="trigger">
          <div
            class="px-2 py-0.5 outline-size-0 border border-zinc-300 rounded-md border-solid bg-zinc-50 flex flex-wrap gap-2 h-full w-full cursor-pointer items-center dark:text-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 group-data-[disabled]:cursor-not-allowed"
          >
            <div v-for="tag, idx in modelValue" :key="idx" class="text-white px-2 py-1 rounded bg-blue-500 flex gap-0.5 h-full w-fit items-center">
              <span class="text-sm">{{ displayBehavior?.(tag as any) }}</span>
              <div class="i-material-symbols:close" @click.stop="onRemove(tag)" />
            </div>
            <span v-if="!modelValue?.length" class="text-sm text-zinc-700 dark:text-zinc-300">{{ props.placeholder }}</span>
          </div>
        </slot>
      </combobox-trigger>
    </combobox-anchor>
    <combobox-content class="h-[200px] w-[var(--reka-combobox-trigger-width)] z-10" position="popper" :side-offset="16">
      <div v-infinite-scroll="[onScrollBottom, { distance: 10 }]" class="bg-white h-full w-full shadow overflow-auto dark:bg-zinc-800">
        <combobox-viewport class="py-2 rounded flex flex-col gap-1 overflow-auto">
          <slot>
            <select-option v-for="option of renderOptions" :key="option.label" :label="option.label" :value="option.value" />
          </slot>
        </combobox-viewport>
      </div>
    </combobox-content>
  </combobox-root>
</template>
