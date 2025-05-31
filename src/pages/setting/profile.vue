<script lang="ts" setup>
import type { Profile } from '@/composables';
import AvatarUpload from '@/components/avatar-upload.vue';
import { Hr as UiHr } from '@/components/ui';
import { useProfile } from '@/composables';
import { useAccountStore } from '@/store';
import {
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyInput,
} from '@opentiny/vue';
import { asyncComputed } from '@vueuse/core';
import { useJwt } from '@vueuse/integrations/useJwt.mjs';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

const { accessToken } = storeToRefs(useAccountStore());
const { payload } = useJwt<AccessTokenPayload>(computed(() => accessToken.value));

const { fetchProfile, updateProfile, uploadAvatar } = useProfile();

const profile = ref<Profile | null>(null);

const avatarUrl = ref();
const avatarFile = ref<File | null>(null);
const submitLoading = ref(false);

const onClickSubmit = () => {
  if (!profile.value) {
    return;
  }
  submitLoading.value = true;
  updateProfile(profile.value)
    .finally(() => {
      submitLoading.value = false;
    });
};

watch(payload, () => {
  if (!payload.value) {
    return;
  }
  fetchProfile({ id: payload.value.id })
    .then((resp) => {
      profile.value = resp;
    });
}, { immediate: true });
watch(profile, () => {
  if (!profile.value) {
    return;
  }
  avatarUrl.value = `/api${profile.value.avatar}`;
}, { immediate: true });
watch(avatarFile, () => {
  if (!avatarFile.value) {
    return;
  }
  uploadAvatar(avatarFile.value)
    .then((resp) => {
      avatarUrl.value = `/api${resp.path}`;
    });
}, { immediate: true });
</script>

<template>
  <div class="p-4 flex flex-col gap-2 h-full w-full">
    <h1 class="text-2xl text-zinc-900 dark:text-zinc-100">
      个人资料
    </h1>
    <ui-hr />
    <h2 class="text-xl text-zinc-800 dark:text-zinc-200">
      基本信息
    </h2>
    <div class="flex grow h-full w-full">
      <div class="w-full space-y-3">
        <tiny-form v-if="profile" label-position="top" :model="profile">
          <tiny-form-item label="个人昵称" required>
            <tiny-input v-model="profile.nick" />
          </tiny-form-item>
          <tiny-form-item label="个人简介">
            <tiny-input v-model="profile.desc" />
          </tiny-form-item>
          <tiny-form-item>
            <tiny-button type="info" :loading="submitLoading" @click="onClickSubmit">
              保存
            </tiny-button>
          </tiny-form-item>
        </tiny-form>
      </div>
      <div class="px-12">
        <avatar-upload v-model="avatarUrl" v-model:file="avatarFile" />
      </div>
    </div>
  </div>
</template>
