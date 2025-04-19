<script lang="ts" setup>
import type { Client, ClientInfo, CreateClientData, UpdateClient } from '@/composables';
import UserSelect from '@/components/user-select.vue';
import { useClient } from '@/composables';
import { TinyButton, TinyCheckbox, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
import { onMounted, reactive, ref, watch } from 'vue';

const { id, onSuccess } = defineProps<{
  id: string[];
  onSuccess?: (client: Client) => void;
}>();
const { fetchInfo, rules, update } = useClient();

const cache = new Map<string, ClientInfo>();
const activeId = ref<string | null>(null);
const data: UpdateClient = reactive({
  name: '',
  desc: '',
  avatar: '',
  redirect: '',
  administrator: [],
  active: false,
});
const setData = (info: ClientInfo) => {
  data.name = info.name;
  data.desc = info.desc;
  data.avatar = info.avatar;
  data.redirect = info.redirect;
  data.administrator = info.administrator.map(admin => admin.id);
  data.active = info.active;
};
const updateClient = (id: string | null, data: UpdateClient) => {
  if (!id) {
    return;
  }
  return update(id, data).then(client => onSuccess?.(client));
};
watch(activeId, () => {
  if (!activeId.value) {
    return;
  }
  if (cache.has(activeId.value)) {
    setData(cache.get(activeId.value)!);
  }
  fetchInfo(activeId.value)
    .then((info) => {
      if (!activeId.value) {
        return;
      }
      cache.set(activeId.value, info);
      setData(info);
    });
});

onMounted(() => {
  activeId.value = id[0];
});
</script>

<template>
  <tiny-form :rules="rules" :model="data" label-position="top">
    <tiny-form-item label="客户端昵称" prop="name">
      <tiny-input v-model="data.name" />
    </tiny-form-item>
    <tiny-form-item label="客户端简介" prop="desc">
      <tiny-input v-model="data.desc" />
    </tiny-form-item>
    <tiny-form-item label="重定向地址" prop="redirect">
      <tiny-input v-model="data.redirect" />
    </tiny-form-item>
    <tiny-form-item label="管理员" prop="administrator">
      <user-select v-model="data.administrator" />
    </tiny-form-item>
    <tiny-form-item label="是否启用" prop="administrator" label-position="left">
      <tiny-checkbox v-model="data.active" />
    </tiny-form-item>
    <tiny-form-item>
      <tiny-button type="primary" @click="updateClient(activeId, data)">
        提交
      </tiny-button>
    </tiny-form-item>
  </tiny-form>
</template>
