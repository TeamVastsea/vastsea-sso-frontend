<script lang="ts" setup>
import type { Client } from "@/composables/useClient";
import UserSelect from "@/components/user-select.vue";
import { useClient } from "@/composables/useClient";
import { TinyButton, TinyForm, TinyFormItem, TinyInput } from "@opentiny/vue";
import { useTemplateRef } from "vue";

const emits = defineEmits<{
  ok: [Client];
}>();
const { formData, rules, create } = useClient();
const form = useTemplateRef<any>("form");

const onSubmit = () => {
  form.value.validate().then((ok: boolean) => {
    if (!ok) {
      return;
    }
    create().then((client) => {
      emits("ok", client);
    });
  });
};
</script>

<template>
  <tiny-form ref="form" :rules="rules" :model="formData" label-position="top">
    <tiny-form-item label="客户端昵称" prop="name">
      <tiny-input v-model="formData.name" />
    </tiny-form-item>
    <tiny-form-item label="客户端简介" prop="desc">
      <tiny-input v-model="formData.desc" />
    </tiny-form-item>
    <tiny-form-item label="重定向地址" prop="redirect">
      <tiny-input v-model="formData.redirect" />
    </tiny-form-item>
    <tiny-form-item label="管理员" prop="administrator">
      <user-select v-model="formData.administrator" />
    </tiny-form-item>
    <tiny-form-item>
      <tiny-button type="primary" @click="onSubmit"> 提交 </tiny-button>
    </tiny-form-item>
  </tiny-form>
</template>
