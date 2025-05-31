<script lang="ts" setup>
import updatePassword from '@/components/update-password.vue';
import { useAccountStore } from '@/store';
import { useRouter } from 'vue-router';

const { clearTokenPair } = useAccountStore();
const router = useRouter();

const onUpdateSuccess = () => {
  clearTokenPair();
  router.replace({ path: '/' });
};
</script>

<template>
  <div class="p-4 bg-zinc-100 size-full dark:bg-zinc-900">
    <update-password @sucess="onUpdateSuccess" />
  </div>
</template>
