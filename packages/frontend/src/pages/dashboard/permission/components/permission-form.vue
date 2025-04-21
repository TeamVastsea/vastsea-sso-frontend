<script lang="ts" setup>
import type { CreatePermission } from '@/composables';
import clientSelect from '@/components/client-select.vue';
import { TinyButton, TinyCheckbox, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
import { computed, reactive, ref, useTemplateRef } from 'vue';
const { permission, readonly, title, submitBehavior, readonlyField = [], hiddenField = [] } = defineProps<{
  submitBehavior: (data: CreatePermission) => void;
  permission?: CreatePermission;
  readonly?: boolean;
  title: string;
  readonlyField?: (keyof CreatePermission)[];
  hiddenField?: (keyof CreatePermission)[];
}>();

const form = useTemplateRef<Form>('form');

const clients = ref<{ clientId: string; name: string }[]>([]);

const rules = {
  name: [{ required: true }],
  desc: [{ required: true }],
  clientId: [{ required: true }],
  active: [{ required: true }],
};

const data: CreatePermission = reactive(permission ?? {
  name: '',
  desc: '',
  clientId: computed(() => clients.value[0]?.clientId ?? null),
  active: true,
});

const beforeSubmit = () => {
  form.value?.validate()
    .then((ok) => {
      if (!ok) {
        return;
      }
      submitBehavior(data);
    })
    .catch(() => {});
};
</script>

<template>
  <div class="w-full">
    <h1 class="text-2xl mb-4">
      {{ title }}
    </h1>
    <tiny-form ref="form" :rules="rules" :model="data" label-align label-position="top" :display-only="readonly">
      <tiny-form-item v-if="!hiddenField.includes('name')" label="权限ID" prop="name">
        <tiny-input v-model="data.name" :disabled="readonlyField.includes('name')" />
      </tiny-form-item>
      <tiny-form-item v-if="!hiddenField.includes('desc')" label="权限简介" prop="desc">
        <tiny-input v-model="data.desc" :disabled="readonlyField.includes('desc')" />
      </tiny-form-item>
      <tiny-form-item v-if="!hiddenField.includes('clientId')" label="客户端" prop="clientId">
        <client-select v-model="clients" placeholder="绑定的客户端" :disabled="readonlyField.includes('clientId')" />
      </tiny-form-item>
      <tiny-form-item v-if="!hiddenField.includes('active')" label="是否启用" prop="active">
        <tiny-checkbox v-model="data.active" :disabled="readonlyField.includes('active')">
          {{ data.active ? '当前为启用' : '当前为停用' }}
        </tiny-checkbox>
      </tiny-form-item>
      <tiny-form-item>
        <tiny-button @click="beforeSubmit">
          提交
        </tiny-button>
      </tiny-form-item>
    </tiny-form>
  </div>
</template>

<style scoped>
:deep(.tiny-checkbox__label) {
  padding-top: 0;
}
</style>
