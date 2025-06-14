<script lang="ts" setup>
import { ref, watch, type Ref } from 'vue';
import { useAccount } from '../composables/useAccount';
import { useProfile, type Profile } from '../composables/useProfile';
import { storeToRefs } from 'pinia';

const { id } = storeToRefs(useAccount());

const { fetchProfile } = useProfile();

const profile:Ref<Profile | null> = ref(null);

watch(id, () => {
  if (!id.value) {
    return;
  }
  fetchProfile(id.value)
    .then((_profile) => {
      profile.value = _profile
    });
}, { immediate: true });
</script>

<template>
  <div class="size-full flex items-center justify-center px-4">
    <div class="w-md p-2 rounded bg-zinc-200 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800">
      <div class="w-full h-full flex flex-col gap-4 items-center" v-if="profile">
        <div class="size-32 rounded-full">
          <img :src="profile.avatar" alt="" v-if="profile.avatar" class="size-full">
          <div class="size-full dark:size-full i-mdi:account-circle dark:i-mdi:account-circle-outline text-zinc-700 dark:text-zinc-100 font-thin" />
        </div>
        <div class="w-full flex flex-col gap-2 items-center">
          <p class="text-xl text-zinc-900 dark:text-zinc-100">{{ profile.nick }}</p>
          <div class="w-full flex flex-col gap-1 items-center">
            <p class="text-sm text-zinc-600 dark:text-zinc-300">{{ profile.bio || '用户还没有个性签名~ ' }}</p>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">114514天前加入瀚海工艺</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
