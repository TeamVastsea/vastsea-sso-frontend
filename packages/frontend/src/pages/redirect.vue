<script lang="ts" setup>
import type { TokenPayload } from '@/store';
import { useAxios } from '@/composables';
import { useAccountStore } from '@/store';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const ok = route.query.ok?.toString();
const reason = route.query.reason?.toString();
const code = ok === 'true' ? route.query.code?.toString()! : null;
const account = useAccountStore();
const { axios } = useAxios();

if (!code) {
  router.replace({ name: 'AuthError', query: {
    reason: reason ?? ['页面不存在'],
  } });
}

if (code) {
  axios.post<unknown, TokenPayload>('/auth/token', null, { params: { code } })
    .then((tokenPair) => {
      account.setTokenPair(tokenPair);
    })
    .then(() => {
      router.replace({ name: 'Profile' });
    });
}
</script>

<template>
  <div class="flex size-screen items-center justify-center">
    <span v-if="ok === 'true'">Loading</span>
    <span v-else>{{ reason }}</span>
  </div>
</template>
