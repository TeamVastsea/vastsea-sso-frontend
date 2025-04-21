<script setup lang="ts">
import ClientSelect from '@/components/client-select.vue';
import { GeneralLayout, useModal } from '@/components/ui';
import { useRole, type MininalRole } from '@/composables';
import { TinyGrid, TinyGridColumn, TinyPager } from '@opentiny/vue';
import { h, onMounted, ref, watch } from 'vue';
import AddRoleForm from './components/add-role-form.vue';

const { createModal, removeCurrent } = useModal();
const values = ref<{ clientId: string; name: string }[]>([]);
const { setClientId, setPage, setSize, getRoleList, roleList, roleListPageSize, curPage, roleTotal } = useRole();
const onCreateSuccess = (roles: MininalRole[]) => {
  roleList.value.push(...roles);
  removeCurrent();
  // TODO: notify.
}
const showCreateRoleModal = () => {
  createModal({
    content: h(AddRoleForm, {onOk:onCreateSuccess}),
    onHidden() {
      removeCurrent();
    },
  });
};

watch(values, () => {
  setClientId(values.value[0]?.clientId);
}, { deep: true });

onMounted(() => {
  getRoleList();
});
</script>

<template>
  <general-layout class="gap-2">
    <div class="flex shrink-0 grow-0 basis-auto gap-2 items-center">
      <div class="flex gap-2 w-full">
        <div
          class="px-3 rounded flex cursor-pointer transition items-center hover:bg-zinc-200 dark:hover:bg-zinc-800"
          @click="showCreateRoleModal"
        >
          <div class="i-material-symbols:add" />
        </div>
        <div class="h-full max-w-[400px] min-w-[200px]">
          <client-select v-model="values" />
        </div>
      </div>
    </div>
    <div class="flex-shrink grow basis-auto">
      <tiny-grid :data="roleList" height="100%">
        <tiny-grid-column field="id" title="ID" />
        <tiny-grid-column field="name" title="name" />
        <tiny-grid-column field="desc" title="desc" />
        <tiny-grid-column field="active" title="actvie">
          <template #default="{ row }">
            {{ row.active ? '正常' : '被禁用' }}
          </template>
        </tiny-grid-column>
        <tiny-grid-column title="action">
          <template #default="{ row }">
            <tiny-button>
              修改
            </tiny-button>
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>
    <div class="h-fit">
      <tiny-pager
        :page-size="roleListPageSize"
        :current-page="curPage"
        :total="Number.parseInt(roleTotal ?? '0')"
        mode="simple"
        @next-click="(cur)=>setPage(cur,'next')"
        @prev-click="(cur)=>setPage(cur,'prev')"
        @size-change="setSize"
      />
    </div>
  </general-layout>
</template>
