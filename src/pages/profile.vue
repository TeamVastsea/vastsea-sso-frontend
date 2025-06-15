<script lang="ts" setup>
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { computed, ref, type Ref, watch } from 'vue';
import { toast } from 'vue-sonner';
import { useAccount } from '../composables/useAccount';
import { type Profile, useProfile } from '../composables/useProfile';

const { id } = storeToRefs(useAccount());

const { fetchProfile, updateProfile } = useProfile();

const profile: Ref<Profile | null> = ref(null);
const date = computed(() => profile.value ? dayjs(profile.value.createAt).fromNow(false) : '');

const onBlur = () => {
  if (!profile.value) {
    return;
  }
  updateProfile(profile.value)
    .then(() => {
      toast.success('修改成功');
    })
    .catch((reason) => {
      toast.error(reason.message);
    });
};

watch(id, () => {
  if (!id.value) {
    return;
  }
  fetchProfile(id.value)
    .then((_profile) => {
      profile.value = _profile;
      if (!_profile.bio) {
        profile.value.bio = '这个用户好懒, 没有个人签名';
      }
    });
}, { immediate: true });
</script>

<template>
  <div class="size-full flex items-center justify-center px-4">
    <div class="w-md p-2 rounded bg-zinc-200 border border-zinc-300 min-h-64 flex items-center justify-center dark:border-zinc-700 dark:bg-zinc-800">
      <transition mode="out-in" enter-active-class="transition duration-300" leave-active-class="transition duration-300" enter-from-class="opacity-0" leave-to-class="opacity-100">
        <span v-if="!profile" class="text-zinc-900 dark:text-zinc-100">正在向服务端请求资源...</span>
        <div v-else class="w-full h-full flex flex-col gap-4 items-center">
          <div class="size-32 rounded-full">
            <img v-if="profile.avatar" :src="profile.avatar" alt="" class="size-full">
            <div class="size-full dark:size-full i-mdi:account-circle dark:i-mdi:account-circle-outline text-zinc-700 dark:text-zinc-100 font-thin" />
          </div>
          <div class="w-full flex flex-col gap-2 items-center">
            <input
              v-model="profile.nick"
              class="
              text-center text-xl text-zinc-900 text-center px-2 py-1 rounded cursor-pointer outline-0
              hover:bg-zinc-300 transition
              focus:bg-zinc-300
              dark:hover:bg-zinc-700 dark:text-zinc-100
              dark:focus:bg-zinc-700
              "
              @blur="onBlur"
            >
            <div class="w-full flex flex-col gap-1 items-center">
              <input
                v-model="profile.bio"
                class="
                max-w-64 w-full
                text-center text-sm text-zinc-600 text-center px-2 py-1 rounded cursor-pointer outline-0
                hover:bg-zinc-300 transition
                focus:bg-zinc-300
                dark:hover:bg-zinc-700 dark:text-zinc-300
                dark:focus:bg-zinc-700
              "
                @blur="onBlur"
              >
              <p class="text-sm text-zinc-600 dark:text-zinc-400">
                {{ date }} 加入瀚海工艺
              </p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
