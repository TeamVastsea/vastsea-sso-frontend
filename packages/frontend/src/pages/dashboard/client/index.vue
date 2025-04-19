<script lang="ts" setup>
import { useModal } from '@/components/ui/modal';
import { useClientList } from '@/composables';
import { TinyButton, TinyGrid, TinyGridColumn } from '@opentiny/vue';
import { h, onMounted } from 'vue';
import createClientForm from './components/create-client-form.vue';

const { data, getList, loading } = useClientList();

const { createModal, removeCurrent } = useModal();

const showRegisterModal = () => {
  createModal({
    content: h(createClientForm),
    onHidden() {
      removeCurrent();
    },
  });
};

onMounted(() => {
  getList();
});
</script>

<template>
  <div class="size-full flex flex-col gap-2">
    <div class="size-fit basis-auto shrink-0 grow-0">
      <tiny-button @click="showRegisterModal()">
        注册客户端
      </tiny-button>
    </div>
    <div class="flex-shrink grow basis-auto">
      <tiny-grid :data="data" :loading="loading">
        <tiny-grid-column field="id" title="ID" />
        <tiny-grid-column field="name" title="客户端名称" />
        <tiny-grid-column field="active" title="客户端状态">
          <template #default="{ row }">
            {{ row.active ? '正常' : '被禁用' }}
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>
  </div>
</template>
