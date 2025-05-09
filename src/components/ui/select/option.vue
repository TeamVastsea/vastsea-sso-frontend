<script lang="ts" setup generic="T extends AcceptableValue">
import type { AcceptableValue, ComboboxItemProps } from 'reka-ui';
import type { OptionProps } from './select.options';
import { ComboboxItem } from 'reka-ui';
import { computed, toRefs, unref } from 'vue';
import { useContext } from './select.options';

type FinalOptionProps = ComboboxItemProps & OptionProps<T>;

const props = defineProps<FinalOptionProps>();
const { label, value } = toRefs(props);

const { renderOptions, values } = useContext()!;

const opt = { label: unref(label), value: unref(value) };

const isActive = computed(() => {
  return values.value.includes(unref(value));
});

renderOptions.value.push(opt);
</script>

<template>
  <combobox-item :value="value" class="group" :data-active="isActive">
    <div class="p-2">
      <div
        class="px-2 py-1 rounded cursor-pointer transition dark:text-zinc-200 hover:text-blue-900 hover:bg-blue-500/30 dark:hover:text-blue-100 group-data-[active='true']:text-blue-900 group-data-[active='true']:bg-blue-500/30 group-data-[active='true']:bg-blue-500/30 dark:group-data-[active='true']:text-blue-100"
      >
        {{ label }}
      </div>
    </div>
  </combobox-item>
</template>
