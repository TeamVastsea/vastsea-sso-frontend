<script lang="ts" setup>
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { computed, ref, type Ref, watch } from 'vue';
import { useAccount } from '../composables/useAccount';
import { type Profile, useProfile } from '../composables/useProfile';

const { id } = storeToRefs(useAccount());

const { fetchProfile } = useProfile();

const profile: Ref<Profile | null> = ref(null);
const date = computed(() => profile.value ? dayjs(profile.value.createAt).fromNow(false) : '');

watch(id, () => {
  if (!id.value) {
    return;
  }
  fetchProfile(id.value)
    .then((_profile) => {
      profile.value = _profile;
    });
}, { immediate: true });
</script>

<template>
  <div class="size-full flex items-center justify-center px-4">
    <div class="w-md p-2 rounded bg-zinc-200 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800">
      <div v-if="!profile" class="w-full h-full flex flex-col gap-4 items-center">
        <span class="text-zinc-900 dark:text-zinc-100">正在向服务端请求资源...</span>
      </div>
      <div v-else class="w-full h-full flex flex-col gap-4 items-center">
        <div class="size-32 rounded-full">
          <img v-if="profile.avatar" :src="profile.avatar" alt="" class="size-full">
          <div class="size-full dark:size-full i-mdi:account-circle dark:i-mdi:account-circle-outline text-zinc-700 dark:text-zinc-100 font-thin" />
        </div>
        <div class="w-full flex flex-col gap-2 items-center">
          <p class="text-xl text-zinc-900 dark:text-zinc-100">
            {{ profile.nick }}
          </p>
          <div class="w-full flex flex-col gap-1 items-center">
            <p class="text-sm text-zinc-600 dark:text-zinc-300">
              {{ profile.bio || '用户还没有个性签名~ ' }}
            </p>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ date }} 加入瀚海工艺
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
