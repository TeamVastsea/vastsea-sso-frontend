<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAccount } from '../composables/useAccount';

const router = useRouter();
const code = computed(() => router.currentRoute.value.query.code?.toString() ?? '');
const { setId,setAccessToken, getTokenByCode } = useAccount();
watch(code, () => {
  if (!code.value) {
    return;
  }
  getTokenByCode(code)
    .then((tokenPair) => {
      console.log(tokenPair.localToken);
      setAccessToken(tokenPair.localToken);
      setId(tokenPair.id);
    });
}, { immediate: true });
</script>

<template>
  <div class="size-full flex items-center justify-center">
    <span class="text-zinc-900 dark:text-zinc-100">Loading...</span>
  </div>
</template>
