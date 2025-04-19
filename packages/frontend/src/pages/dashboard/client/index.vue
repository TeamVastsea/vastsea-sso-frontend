<script lang="ts" setup>
import type { Client, ClientInfo } from '@/composables';
import { useModal } from '@/components/ui/modal';
import { useClientList } from '@/composables';
import { TinyButton, TinyGrid, TinyGridColumn, TinyPager } from '@opentiny/vue';
import { h, onMounted, ref } from 'vue';
import ClientInfoModal from './components/client-info.vue';
import createClientForm from './components/create-client-form.vue';

const { data, total, getList, loading, loadNext, loadPrev, size, setSize } = useClientList();

const { createModal, removeCurrent } = useModal();

const selectColumn = ref<string[]>([]);

const showModal = <T extends new (...args: any) => any>(comp: T, props?: InstanceType<T>['$props']) => {
  createModal({
    content: h(comp, props),
    onHidden() {
      removeCurrent();
    },
  });
};
const onUpdateSuccess = (client: Client) => {
  data.value = data.value.map((clientInfo) => {
    if (clientInfo.id === client.id) {
      return {
        ...clientInfo,
        ...client,
      };
    }
    return clientInfo;
  });
  removeCurrent();
};

const onSelect = ({ selection }: { selection: ClientInfo[] }) => {
  selectColumn.value = selection.map(info => info.id.toString());
};

onMounted(() => {
  getList();
});
</script>

<template>
  <div class="size-full flex flex-col gap-2">
    <div class="h-fit basis-auto shrink-0 grow-0">
      <tiny-button @click="showModal(createClientForm)">
        注册客户端
      </tiny-button>
      <tiny-button :disabled="selectColumn.length !== 1" @click="showModal(ClientInfoModal, { id: selectColumn[0], onSuccess: onUpdateSuccess })">
        客户端信息
      </tiny-button>
    </div>
    <div class="flex-shrink grow basis-auto">
      <tiny-grid height="100%" :data="data" :loading="loading" :select-config="{ showHeader: false }" @select-change="onSelect">
        <tiny-grid-column type="selection" />
        <tiny-grid-column type="index" title="Index" />
        <tiny-grid-column field="id" title="ID" />
        <tiny-grid-column field="name" title="客户端名称" />
        <tiny-grid-column field="active" title="客户端状态">
          <template #default="{ row }">
            {{ row.active ? '正常' : '被禁用' }}
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>
    <tiny-pager :page-size="size" :total="total" mode="simple" @next-click="loadNext" @prev-click="loadPrev" @size-change="setSize" />
  </div>
</template>
