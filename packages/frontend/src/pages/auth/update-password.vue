<script lang="ts" setup>
import type { Reactive } from 'vue';
import { useAxios } from '@/composables';
import { TinyButton, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
import { reactive, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';

interface UpdatePassword {
  newPassword: string;
  oldPassword: string;
}

const updatePassword: Reactive<UpdatePassword> = reactive({
  newPassword: '',
  oldPassword: '',
});
const { axios } = useAxios();
const form = useTemplateRef<any>('form');
const router = useRouter();
const doUpdate = () => {
  form.value
    .validate()
    .then((ok: boolean) => {
      if (!ok) {
        return;
      }
      axios.patch('/secure/password', updatePassword).then(() => {
        router.back();
      });
    })
    .catch(() => {});
};
</script>

<template>
  <div class="p-4 bg-zinc-100 size-full dark:bg-zinc-900">
    <div class="mx-auto flex h-full max-w-xl items-center">
      <div
        class="p-4 rounded-lg bg-zinc-200 flex flex-col gap-2 h-fit w-full dark:bg-zinc-800"
      >
        <h1 class="text-3xl text-zinc-800 mb-4 dark:text-zinc-200">
          修改密码
        </h1>
        <tiny-form
          ref="form"
          label-position="top"
          :model="updatePassword"
          validate-type="text"
        >
          <tiny-form-item label="旧密码" required prop="oldPassword">
            <tiny-input
              v-model="updatePassword.oldPassword"
              type="password"
              show-password
            />
          </tiny-form-item>
          <tiny-form-item label="新密码" required prop="newPassword">
            <tiny-input
              v-model="updatePassword.newPassword"
              type="password"
              show-password
            />
          </tiny-form-item>
          <tiny-form-item>
            <tiny-button class="mr-2" @click="doUpdate">
              提交
            </tiny-button>
            <router-link
              :to="{ name: 'forget-password' }"
              class="text-blue-600 transition hover:text-blue-800"
            >
              忘记密码?
            </router-link>
          </tiny-form-item>
        </tiny-form>
      </div>
    </div>
  </div>
</template>
