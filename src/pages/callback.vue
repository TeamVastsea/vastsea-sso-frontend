<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAccount } from '../composables/useAccount';

const router = useRouter();
const code = computed(() => router.currentRoute.value.query.code?.toString() ?? '');
const fail = ref(false);
const { setId, setAccessToken, getTokenByCode } = useAccount();
watch(code, () => {
  if (!code.value || fail.value) {
    return;
  }
  getTokenByCode(code)
    .then((tokenPair) => {
      setAccessToken(tokenPair.localToken);
      setId(tokenPair.id);
      router.replace({ name: 'Profile' });
    })
    .catch(() => {
      fail.value = true;
    });
}, { immediate: true });
</script>

<template>
  <div class="size-full flex flex-col items-center justify-center">
    <span v-if="!fail" class="text-zinc-900 dark:text-zinc-100">Loading...</span>
    <div v-else class="w-fit mx-auto flex flex-col text-center gap-2">
      <span class="text-zinc-900 dark:text-zinc-100 text-xl">网络错误</span>
      <router-link to="/login" class="text-blue-500">
        点击重试
      </router-link>
    </div>
  </div>
</template>
