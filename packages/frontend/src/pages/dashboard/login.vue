<script lang="ts" setup>
import { useLogin } from '@/composables';
import { useTemplateRef } from 'vue';

const { login, formData, formRules } = useLogin();
const form = useTemplateRef<any>('form');
</script>

<template>
  <div class="size-full flex items-center justify-center">
    <div class="max-w-xl w-full h-fit space-y-4">
      <h1 class="text-3xl text-center">
        DashBoard Login
      </h1>
      <tiny-form ref="form" label-position="top" :model="formData" :rules="formRules" validate-type="text">
        <tiny-form-item label="邮箱" required prop="email">
          <tiny-input v-model="formData.email" />
        </tiny-form-item>
        <tiny-form-item label="密码" requried prop="password">
          <tiny-input v-model="formData.password" type="password" />
        </tiny-form-item>
        <tiny-form-item>
          <tiny-button type="primary" @click="login(form.validate)">
            提交
          </tiny-button>
        </tiny-form-item>
      </tiny-form>
    </div>
  </div>
</template>
