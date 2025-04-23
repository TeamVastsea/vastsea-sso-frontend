<script lang="ts" setup>
import { useRole } from '@/composables';
import { useAccount } from '@/composables/useAccount';
import { TinyForm, TinyFormItem, TinyInput, TinySelect } from '@opentiny/vue';
import { computed, onMounted, useTemplateRef } from 'vue';

const { formData, formRules, createAccount } = useAccount();

const { roleList, getRoleList } = useRole();

const roleOptions = computed(() => {
  return roleList.value.map((role) => {
    return {
      label: role.name,
      value: role.id,
    };
  });
});

const form = useTemplateRef<any>('form');

onMounted(() => {
  getRoleList();
});
</script>

<template>
  <tiny-form ref="form" label-position="top" :model="formData" :rules="formRules">
    <tiny-form-item prop="email" label="邮箱">
      <tiny-input v-model="formData.email" />
    </tiny-form-item>
    <tiny-form-item prop="password" label="密码">
      <tiny-input v-model="formData.password" type="password" />
    </tiny-form-item>
    <tiny-form-item prop="profile.nick" label="昵称">
      <tiny-input v-model="formData.profile.nick" />
    </tiny-form-item>
    <tiny-form-item prop="profile.desc" label="简介">
      <tiny-input v-model="formData.profile.desc" />
    </tiny-form-item>
    <tiny-form-item prop="profile.role" label="角色">
      <tiny-select v-model="formData.role" :options="roleOptions" multiple />
    </tiny-form-item>
    <tiny-form-item>
      <tiny-button type="primary" @click="createAccount(form.validate)">
        提交
      </tiny-button>
    </tiny-form-item>
  </tiny-form>
</template>
