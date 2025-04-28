<script lang="ts" setup>
import type { Profile } from '@/composables';
import avatarUpload from '@/components/avatar-upload.vue';
import generalLayout from '@/components/ui/layout/general-layout.vue';
import { useProfile } from '@/composables';
import { useAccountStore } from '@/store';
import { TinyButton, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
import { useJwt } from '@vueuse/integrations/useJwt';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

const { fetchProfile, uploadAvatar } = useProfile();
const { accessToken } = storeToRefs(useAccountStore());
const { payload } = useJwt<AccessTokenPayload>(computed(() => accessToken.value));
const profile = ref<Profile | null>(null);
const url = ref('');
const avatar = ref<File | null>(null);

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

watch(payload, () => {
  if (!payload.value?.id) {
    return;
  }
  fetchProfile({ id: payload.value.id })
    .then((resp) => {
      profile.value = resp;
      url.value = `/api${profile.value.avatar}`;
    });
}, { immediate: true, deep: true });
</script>

<template>
  <general-layout class="gap-2">
    <div class="mx-auto max-w-2xl w-full">
      <div>
        <h2 class="text-2xl mb-2">
          基本信息
        </h2>
      </div>
      <div class="flex flex-wrap-reverse gap-4 justify-center">
        <div class="flex-shrink-0 flex-grow">
          <tiny-form v-if="profile" label-position="top">
            <tiny-form-item label="昵称" required>
              <tiny-input v-model="profile.nick" />
            </tiny-form-item>
            <tiny-form-item label="个人简介" required>
              <tiny-input v-model="profile.desc" />
            </tiny-form-item>
            <tiny-form-item>
              <tiny-button type="primary">
                保存修改
              </tiny-button>
            </tiny-form-item>
          </tiny-form>
        </div>
        <div>
          <avatar-upload v-model="url" v-model:file="avatar" />
        </div>
      </div>
    </div>
  </general-layout>
</template>
