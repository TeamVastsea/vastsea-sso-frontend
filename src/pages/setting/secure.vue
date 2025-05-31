<script lang="ts" setup>
import { useModal } from '@/components/ui';
import UpdatePassword from '@/components/update-password.vue';
import { useAccountStore } from '@/store';
import { h } from 'vue';
import { useRouter } from 'vue-router';

const { createModal, removeCurrent } = useModal();
const store = useAccountStore();
const router = useRouter();
const onUpdateSuccess = () => {
  store.clearTokenPair();
  removeCurrent();
  router.replace('/');
};
</script>

<template>
  <div class="p-4 flex flex-col gap-2 h-full w-full">
    <h1 class="text-2xl text-zinc-900 mb-4 hidden dark:text-zinc-100 md:block">
      安全管理
    </h1>
    <div class="text-zinc-200 p-4 py-2 b-y border-zinc-500 flex w-full justify-between">
      <span>密码</span>
      <span
        class="cursor-pointer"
        @click="() => createModal({
          content: h(UpdatePassword, { onSuccess: onUpdateSuccess }),
        })"
      >修改</span>
    </div>
  </div>
</template>
