<script lang="ts" setup>
import GeneralLayout from '@/components/ui/layout/general-layout.vue';
import { Select as UiSelect } from '@/components/ui/select';
import { useClientList, usePermission } from '@/composables';
import { TinyGrid, TinyGridColumn, TinyPager } from '@opentiny/vue';
import { noop, watchDebounced } from '@vueuse/core';
import { computed, onMounted, ref, unref } from 'vue';

const values = ref<{clientId: string, name: string}[]>([]);

const { canLoad, loadMore, data: clients, getList, loading: getClientsLoading } = useClientList({ type: 'scroll', size: 5 });

const { getPermissionList,resetPreId, clickNext,clickPrev,setSize, permissionList, loading, permissionListPageSize,permissionTotal, preId } = usePermission();

const selectOptions = computed(() => {
  return clients.value.map((data) => {
    return {
      label: data.name,
      value: { clientId: data.clientId, name: data.name },
    };
  });
});
const loadNextPage = (page: number) => {
  clickNext(page);
  getPermissionList(values.value[0]?.clientId, unref(preId))
}
const loadPrevPage = (page: number) => {
  clickPrev(page);
  getPermissionList(values.value[0]?.clientId, unref(preId))
}
const resetSize = (size: number) => {
  setSize(size);
  getPermissionList(values.value[0]?.clientId, unref(preId))
}

watchDebounced(values, ()=>{
  const clientId = values.value[0]?.clientId;
  resetPreId();
  getPermissionList(clientId, unref(preId));
}, {debounce:200, deep: true});

onMounted(() => {
  getList();
  getPermissionList();
});
</script>

<template>
  <general-layout class="gap-2">
    <div class="basis-auto shrink-0 grow-0 flex gap-2 items-center">
      <div class="flex w-full">
        <div class="pr-2 text-base">
          <span>过滤</span>
        </div>
        <ui-select
          v-model="values"
          :options="selectOptions"
          :display-behavior="(val) => val.name"
          class="grow"
          @scroll-bottom="canLoad && !getClientsLoading ? loadMore() : noop()"
        />
      </div>
    </div>
    <div class="flex-shrink grow basis-auto">
      <tiny-grid :data="permissionList" :loading="loading" height="100%">
        <tiny-grid-column field="id" title="ID" />
        <tiny-grid-column field="name" title="name" />
        <tiny-grid-column field="desc" title="desc" />
        <tiny-grid-column field="active" title="actvie">
          <template #default="{ row }">
            {{ row.active ? '正常' : '被禁用' }}
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>
    <div class="h-fit">
      <tiny-pager
        :page-size="permissionListPageSize"
        :show-total-loading="loading"
        :total="Number.parseInt(permissionTotal)"
        mode="simple"
        @next-click="loadNextPage"
        @prev-click="loadPrevPage"
        @size-change="resetSize"
      />
    </div>
  </general-layout>
</template>
