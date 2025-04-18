<script lang="ts" setup>
import { useAccount } from '@/composables';
import { TinyCheckbox, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
import { onMounted, useTemplateRef } from 'vue';

const { id } = defineProps<{ id: string }>();

const { updateAccount, account, fetchAccount } = useAccount();

const form = useTemplateRef<any>('form');
onMounted(() => {
  fetchAccount(BigInt(id));
});
</script>

<template>
  <tiny-form ref="form" label-position="top" :model="account">
    <tiny-form-item label="Email" required prop="email">
      <tiny-input v-model="account.email" />
    </tiny-form-item>
    <tiny-form-item label="密码" prop="password">
      <tiny-input v-model="account.password" />
    </tiny-form-item>
    <tiny-form-item label="昵称" required prop="profile.nick">
      <tiny-input v-model="account.profile.nick" />
    </tiny-form-item>
    <tiny-form-item label="个人简介" required prop="profile.desc">
      <tiny-input v-model="account.profile.desc" />
    </tiny-form-item>
    <tiny-form-item label="是否启用" prop="profile.active">
      <tiny-checkbox v-model="account.active" />
    </tiny-form-item>
    <tiny-button type="primary" @click="updateAccount(form.validate, BigInt(id)).then(() => $router.go(0))">
      提交
    </tiny-button>
    <!-- TODO:avatar -->
    <!-- TODO:roles -->
  </tiny-form>
</template>
