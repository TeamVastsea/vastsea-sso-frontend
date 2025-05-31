<script lang="ts" setup>
import type { Profile } from '@/composables';
import avatarUpload from '@/components/avatar-upload.vue';
import { useProfile } from '@/composables';
import { useAccountStore } from '@/store';
import { useJwt } from '@vueuse/integrations/useJwt';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import 'dayjs/locale/zh-cn';

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { fetchProfile, uploadAvatar } = useProfile();
const { accessToken } = storeToRefs(useAccountStore());
const { payload } = useJwt<AccessTokenPayload>(
  computed(() => accessToken.value),
);
const profile = ref<Profile | null>(null);
const url = ref('');
const avatar = ref<File | null>(null);
const router = useRouter();
const id = computed(() => router.currentRoute.value.query.id?.toString());
const toNow = computed(() => {
  if (!profile.value) {
    return;
  }
  const createAt = profile.value.account.createAt;
  return dayjs(createAt).fromNow();
});

const getProfile = (id: string) => {
  return fetchProfile({ id })
    .then((resp) => {
      profile.value = resp;
      if (resp.avatar) {
        url.value = `/api${profile.value.avatar}`;
      }
    });
};

const back = () => {
  router.push({ path: '/' });
};

watch(id, () => {
  if (!id.value) {
    return;
  }
  getProfile(id.value)
    .catch(() => {
      if (!payload.value) {
        router.replace({ path: '/' });
        return;
      }
      getProfile(payload.value.id);
    });
}, { immediate: true });

watch(avatar, () => {
  if (!avatar.value) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    url.value = reader.result?.toString() ?? '';
    if (avatar.value) {
      uploadAvatar(avatar.value);
    }
  };
  reader.readAsDataURL(avatar.value);
});

watch(
  payload,
  () => {
    if (!payload.value?.id || id.value) {
      return;
    }
    fetchProfile({ id: payload.value.id }).then((resp) => {
      profile.value = resp;
      url.value = `/api${profile.value.avatar}`;
    });
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  if (!id.value && !payload.value?.id) {
    router.replace({ path: '/' });
  }
});
</script>

<template>
  <div class="p-4 bg-zinc-200 flex flex-col gap-4 h-screen w-screen justify-center overflow-auto dark:bg-zinc-900">
    <div class="box-sizing mx-auto p-4 rounded bg-zinc-50 shrink-0 max-w-sm w-full shadow-dark space-y-2 dark:bg-zinc-800">
      <div class="p-2 rounded size-fit transition hover:bg-zinc-300/50 hover:dark:bg-zinc-700" @click="back">
        <div class="i-material-symbols:arrow-back-ios-new-rounded text-zinc-800 cursor-pointer dark:text-zinc-200" />
      </div>
      <div class="flex flex-col items-center">
        <avatar-upload v-model="url" v-model:file="avatar" readonly />
        <div class="mt-5 flex flex-col w-fit items-center space-y-3">
          <h1 class="text-3xl text-zinc-800 font-sans dark:text-zinc-200">
            {{ profile?.nick }}
          </h1>
          <div class="text-xs text-zinc-700 font-sans flex gap-2 items-center dark:text-zinc-400">
            <span>ID: {{ profile?.accountId }} </span>
            <span> | </span>
            <span>{{ toNow }} 加入瀚海工艺</span>
          </div>
          <p class="fonr-sans text-zinc-700 dark:text-zinc-300">
            {{ profile?.desc ?? '该用户还暂时没有签名...' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
