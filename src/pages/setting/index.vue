<script lang="ts" setup>
import { Link as UiLink } from '@/components/ui';
import { useAccount, useProfile } from '@/composables';
import { useAccountStore } from '@/store';
import { useJwt } from '@vueuse/integrations/useJwt.mjs';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const { accessToken } = storeToRefs(useAccountStore());
const { payload } = useJwt<AccessTokenPayload>(
  computed(() => accessToken.value),
);

const {
  fetchProfile,
} = useProfile();

const profile = computed(() => {
  return payload.value ? fetchProfile(payload.value) : null;
});
</script>

<template>
  <div class="p-4 bg-zinc-50 h-screen w-screen overflow-auto dark:bg-zinc-900">
    <div class="group mx-auto flex gap-4 h-full max-w-screen-lg relative">
      <div
        class="group rounded-md bg-zinc-100 flex shrink-0 basis-48 flex-col h-full w-full top-0 sticky z-10 overflow-auto dark:bg-zinc-800"
      >
        <ul class="my-4 px-2 flex-auto space-y-3">
          <ui-link :to="{ name: 'setting::profile' }">
            <li class="p-2">
              个人信息
            </li>
          </ui-link>
        </ul>
      </div>
      <div class="rounded-md bg-zinc-100 h-full w-full dark:bg-zinc-800 overflow-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>
