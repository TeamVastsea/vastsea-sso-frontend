<script lang="ts" setup>
import type { MininalAccount } from '@/composables';
import type { Ref } from 'vue';
import { Modal, ModalContent, ModalHeader } from '@/components/ui/modal';
import { useAccountList } from '@/composables';
import { Grid, GridColumn, TinyButton, TinyPager } from '@opentiny/vue';
import { useToggle } from '@vueuse/core';
import { onMounted, ref } from 'vue';
import addAccountForm from './components/add-account-form.vue';
import updateAccountForm from './components/update-account-form.vue';

const {
  data,
  getAccountList,
  onClickNext,
  onClickPrev,
  setSize,
  remove,
  update,
} = useAccountList();
const showModal = ref(false);
const showUpdateModal = ref(false);

const toggleUpdateModal = useToggle(showUpdateModal);
const toggleModalShowState = useToggle(showModal);
const datas: Ref<MininalAccount[]> = ref([]);

const onSelect = ({ selection }: { selection: MininalAccount[] }) => {
  datas.value = selection;
};
const removeAccount = () => {
  const stacks = datas.value.map(account => remove(BigInt(account.id)));
  return Promise.allSettled(stacks);
};

const reopen = () => {
  datas.value = datas.value.filter(data => !data.active);
  const handles = datas.value.map(account =>
    update(BigInt(account.id), { ...account, active: true }),
  );
  return Promise.allSettled(handles);
};

onMounted(() => {
  getAccountList();
});
</script>

<template>
  <div
    class="flex flex-col h-full w-full break-words space-y-2 dark:text-white"
  >
    <div class="shrink-0 grow-0 basis-auto h-fit">
      <tiny-button @click="() => toggleModalShowState()">
        添加账号
      </tiny-button>
      <tiny-button :disabled="!datas || !datas.length" @click="removeAccount">
        停用账号
      </tiny-button>
      <tiny-button :disabled="!datas || !datas.length" @click="reopen">
        启用账号
      </tiny-button>
      <tiny-button
        :disabled="!datas || datas.length !== 1"
        @click="toggleUpdateModal"
      >
        更新账号信息
      </tiny-button>
    </div>
    <div class="flex-shrink grow basis-auto">
      <grid
        :data="data?.data"
        height="100%"
        :select-config="{ showHeader: false }"
        @select-change="onSelect"
      >
        <grid-column type="selection" />
        <grid-column field="id" title="ID" />
        <grid-column field="profile.nick" title="昵称" />
        <grid-column field="profile.desc" title="简介" />
        <grid-column field="createAt" title="创建时间" />
        <grid-column field="active" title="帐号状态">
          <template #default="{ row }">
            {{ row.active ? "正常" : "被禁用" }}
          </template>
        </grid-column>
      </grid>
    </div>
    <div>
      <tiny-pager
        :page-size="10"
        :total="Number.parseInt(data?.total.toString() ?? '0')"
        mode="simple"
        @size-change="setSize"
        @next-click="onClickNext"
        @prev-click="onClickPrev"
      />
    </div>
    <modal v-model="showUpdateModal">
      <modal-content>
        <modal-header class="mb-4">
          <p class="text-2xl">
            修改账号
          </p>
        </modal-header>
        <update-account-form :id="datas[0].id" />
      </modal-content>
    </modal>
    <modal v-model="showModal">
      <modal-content>
        <modal-header class="mb-4">
          <p class="text-2xl">
            添加账号
          </p>
        </modal-header>
        <add-account-form />
      </modal-content>
    </modal>
  </div>
</template>
