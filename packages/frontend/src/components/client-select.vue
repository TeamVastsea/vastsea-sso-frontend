<script lang="ts" setup>
import { Select as UiSelect } from '@/components/ui/select';
import { useClientList } from '@/composables';
import { noop } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';

const { placeholder = '筛选的客户端', multiple = false } = defineProps<{
  placeholder?: string;
  multiple?: boolean;
}>();

const modelValue = defineModel<{ clientId: string; name: string }[]>();

const values = ref<{ clientId: string; name: string }[]>([]);

const {
  canLoad,
  loadMore,
  data: clients,
  getList,
  loading: getClientsLoading,
} = useClientList({ type: 'scroll', size: 5 });

const selectOptions = computed(() => {
  return clients.value.map((data) => {
    return {
      label: data.name,
      value: { clientId: data.clientId, name: data.name },
    };
  });
});

watch(
  values,
  () => {
    modelValue.value = values.value.filter(value => value !== undefined);
  },
  { deep: true },
);

onMounted(() => {
  getList();
});
</script>

<template>
  <ui-select
    v-model="values"
    :multiple="multiple"
    :placeholder="placeholder"
    :options="selectOptions"
    :display-behavior="(val) => val.name"
    class="grow"
    @scroll-bottom="canLoad && !getClientsLoading ? loadMore() : noop()"
  />
</template>
