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

if (code) {
  axios.post<unknown, TokenPayload>('/auth/token', null, { params: { code } })
    .then((tokenPair) => {
      account.setTokenPair(tokenPair);
    })
    .catch((reason) => {
      // notify reason
    })
    .then(() => {
      router.replace({ name: 'AccountManage' });
    // notify.
    });
}
</script>

<template>
  <div class="flex size-screen items-center justify-center">
    <span v-if="ok === 'true'">Loading</span>
    <span v-else>{{ reason }}</span>
  </div>
</template>
