<script lang="ts" setup>
import type { TokenPayload } from '@/store';
import { useAxios } from '@/composables';
import { useAccountStore } from '@/store';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const ok = route.query.ok?.toString();
const reason = route.query.reason?.toString();
// eslint-disable-next-line ts/no-non-null-asserted-optional-chain
const code = ok === 'true' ? route.query.code?.toString()! : null;
const account = useAccountStore();
const { axios } = useAxios();

if (!code) {
  router.replace({
    name: 'AuthError',
    query: {
      reason: reason ?? ['页面不存在'],
    },
  });
}

if (code) {
  axios
    .get<unknown, TokenPayload>('/v2/auth/token', { params: { code } })
    .then((tokenPair) => {
      account.setTokenPair(tokenPair);
      router.replace({ name: 'Profile' });
    })
    .catch((err) => {
      router.replace({
        name: 'AuthError',
        query: {
          reason: [err.message],
        },
      });
    });
}
</script>

<template>
  <div class="flex size-screen items-center justify-center">
    <span v-if="ok === 'true'">Loading</span>
    <span v-else>{{ reason }}</span>
  </div>
</template>
