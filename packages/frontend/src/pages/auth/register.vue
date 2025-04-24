<script lang="ts" setup>
import { TinyButton, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
</script>

<template>
  <div class="p-4 size-full">
    <div class="mx-auto flex h-full max-w-xl items-center">
      <div class="form-wrapper p-4 border border-zinc-300 rounded bg-zinc-200 h-fit w-full">
        <h1 class="text-3xl mb-4">
          注册账号
        </h1>
        <tiny-form label-position="top">
          <tiny-form-item label="邮箱" required>
            <tiny-input />
          </tiny-form-item>
          <tiny-form-item label="验证码" required>
            <tiny-input />
          </tiny-form-item>
          <tiny-form-item label="密码" required>
            <tiny-input />
          </tiny-form-item>
          <tiny-form-item label="昵称" required>
            <tiny-input />
          </tiny-form-item>
          <tiny-form-item label="个人简介" required>
            <tiny-input />
          </tiny-form-item>
          <tiny-form-item>
            <tiny-button type="primary">
              注册
            </tiny-button>
          </tiny-form-item>
        </tiny-form>
      </div>
    </div>
  </div>
</template>

<style>
.form-wrapper {
  view-transition-name: formWrapper;
}
</style>
