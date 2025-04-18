<script lang="ts" setup>
import createClientForm from './components/create-client-form.vue';
import { Modal, ModalContent, ModalHeader } from '@/components/ui/modal';
import { useClientList } from '@/composables';
import { TinyButton, TinyGrid, TinyGridColumn } from '@opentiny/vue';
import { useToggle } from '@vueuse/core';
import { onMounted, ref } from 'vue';

const { data, getList, loading } = useClientList();
const showRegisterModal = ref(false);
const toggleClientRegisteModal = useToggle(showRegisterModal);

onMounted(()=>{
  getList()
})

</script>

<template>
  <div class="size-full flex flex-col gap-2">
    <div class="size-fit basis-auto shrink-0 grow-0">
      <tiny-button @click="toggleClientRegisteModal()">
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
    <modal v-model="showRegisterModal">
      <modal-content>
        <modal-header class="text-2xl mb-4">
          创建客户端
        </modal-header>
        <create-client-form @ok="(client)=>data.push({...client,administrator: []})" />
      </modal-content>
    </modal>
  </div>
</template>
