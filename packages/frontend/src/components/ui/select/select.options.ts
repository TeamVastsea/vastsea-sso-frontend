import type { AcceptableValue } from 'reka-ui';
import type { Ref } from 'vue';
import { createInjectionState } from '@vueuse/core';
import { ref, watch } from 'vue';

export interface OptionProps<T extends AcceptableValue> {
  label: string;
  value: T;
}
export interface SelectProps<OV extends AcceptableValue> {
  options?: OptionProps<OV>[];
  placeholder?: string;
}

export interface SelectContext {
  renderOptions: Ref<OptionProps<AcceptableValue>[]>;
  values: Ref<AcceptableValue[]>;
}

export const [useProvide, useContext] = createInjectionState((
  defaultValue: SelectContext,
) => {
  const renderOptions: Ref<OptionProps<AcceptableValue>[]> = ref(defaultValue.renderOptions.value);
  const values = defaultValue.values;

  return { renderOptions, values };
}, { injectionKey: Symbol('Select') });
