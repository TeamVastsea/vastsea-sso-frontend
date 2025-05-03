<script lang="ts" setup>
import type { CreatePermission } from "@/composables";
import ClientSelect from "@/components/client-select.vue";
import { useModal } from "@/components/ui";
import GeneralLayout from "@/components/ui/layout/general-layout.vue";
import { usePermission } from "@/composables";
import { TinyButton, TinyGrid, TinyGridColumn, TinyPager } from "@opentiny/vue";
import { watchDebounced } from "@vueuse/core";
import { h, onMounted, ref, unref } from "vue";
import { useRouter } from "vue-router";
import AddPermissionForm from "./components/permission-form.vue";

const values = ref<{ clientId: string; name: string }[]>([]);

const {
  getPermissionList,
  resetPreId,
  clickNext,
  clickPrev,
  setSize,
  fetchPermissionInfo,
  createPermission: create,
  updatePermission: update,
  permissionList,
  loading,
  permissionListPageSize,
  permissionTotal,
  preId,
} = usePermission();

const curPage = ref(1);

const { createModal, removeCurrent } = useModal();

const renderModal = <C extends new (...args: any) => any>(
  comp: C,
  props?: InstanceType<C>["$props"],
) => {
  createModal({
    content: h(comp, props),
    onDestory() {
      removeCurrent();
    },
  });
};
const router = useRouter();
const createPermission = (permission: CreatePermission) => {
  create(permission).then(removeCurrent);
};
const updatePermission = (
  id: string,
  permission: Partial<CreatePermission>,
) => {
  update(id, permission).then(() => {
    router.go(0);
  });
};
const openUpdateModal = (id: string) => {
  fetchPermissionInfo(id).then((permission) => {
    renderModal(AddPermissionForm, {
      title: "修改权限",
      submitBehavior: (data) => updatePermission(id, data),
      permission,
    });
  });
};

const loadNextPage = (page: number) => {
  clickNext(page);
  getPermissionList(values.value[0]?.clientId, unref(preId));
  curPage.value = page;
};
const loadPrevPage = (page: number) => {
  clickPrev(page);
  getPermissionList(values.value[0]?.clientId, unref(preId));
  curPage.value = page;
};
const resetSize = (size: number) => {
  curPage.value = 1;
  setSize(size);
  permissionList.value = [];
  getPermissionList(values.value[0]?.clientId, unref(preId));
};

watchDebounced(
  values,
  () => {
    const clientId = values.value[0]?.clientId;
    resetPreId();
    getPermissionList(clientId, unref(preId));
    curPage.value = 1;
  },
  { debounce: 200, deep: true },
);

onMounted(() => {
  getPermissionList();
});
</script>

<template>
  <general-layout class="gap-2">
    <div class="flex shrink-0 grow-0 basis-auto gap-2 h-fit items-center">
      <div class="flex gap-2 w-full">
        <div
          class="px-3 rounded flex cursor-pointer transition items-center hover:bg-zinc-200 dark:hover:bg-zinc-800"
          @click="
            () =>
              renderModal(AddPermissionForm, {
                title: '添加权限',
                readonly: false,
                submitBehavior: createPermission,
              })
          "
        >
          <div class="i-material-symbols:add" />
        </div>
        <div class="h-full max-w-[400px] min-w-[200px]">
          <client-select v-model="values" />
        </div>
      </div>
    </div>
    <div class="flex-shrink grow basis-auto">
      <tiny-grid :data="permissionList" :loading="loading" height="100%">
        <tiny-grid-column field="id" title="ID" />
        <tiny-grid-column field="name" title="name" />
        <tiny-grid-column field="desc" title="desc" />
        <tiny-grid-column field="active" title="actvie">
          <template #default="{ row }">
            {{ row.active ? "正常" : "被禁用" }}
          </template>
        </tiny-grid-column>
        <tiny-grid-column title="action">
          <template #default="{ row }">
            <tiny-button @click="openUpdateModal(row.id)"> 修改 </tiny-button>
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>
    <div class="h-fit">
      <tiny-pager
        :page-size="permissionListPageSize"
        :show-total-loading="loading"
        :current-page="curPage"
        :total="Number.parseInt(permissionTotal)"
        mode="simple"
        @next-click="loadNextPage"
        @prev-click="loadPrevPage"
        @size-change="resetSize"
      />
    </div>
  </general-layout>
</template>
