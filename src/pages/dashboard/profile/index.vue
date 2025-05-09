<script lang="ts" setup>
import type { Profile } from '@/composables';
import avatarUpload from '@/components/avatar-upload.vue';
import generalLayout from '@/components/ui/layout/general-layout.vue';
import { useProfile } from '@/composables';
import { useAccountStore } from '@/store';
import {
  Modal,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyInput,
} from '@opentiny/vue';
import { useJwt } from '@vueuse/integrations/useJwt';
import { storeToRefs } from 'pinia';
import { computed, ref, useTemplateRef, watch } from 'vue';

const { fetchProfile, uploadAvatar, updateProfile } = useProfile();
const { accessToken } = storeToRefs(useAccountStore());
const { payload } = useJwt<AccessTokenPayload>(
  computed(() => accessToken.value),
);
const profile = ref<Profile | null>(null);
const url = ref('');
const avatar = ref<File | null>(null);

const form = useTemplateRef<any>('form');
const onClickUpdate = () => {
  form.value
    .validate()
    .then((ok: boolean) => {
      if (!ok || !profile.value) {
        return;
      }
      return updateProfile(profile.value);
    })
    .then(() => {
      Modal.message({
        message: '修改成功',
        status: 'success',
      });
    })
    .catch(() => {});
};

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
    if (!payload.value?.id) {
      return;
    }
    fetchProfile({ id: payload.value.id }).then((resp) => {
      profile.value = resp;
      url.value = `/api${profile.value.avatar}`;
    });
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <general-layout class="gap-2">
    <div class="mx-auto max-w-2xl w-full">
      <div>
        <h2 class="text-2xl my-4">
          基本信息
        </h2>
      </div>
      <div class="flex flex-wrap-reverse gap-4 justify-center">
        <div class="flex-shrink-0 flex-grow">
          <tiny-form
            v-if="profile"
            ref="form"
            label-position="top"
            :model="profile"
          >
            <tiny-form-item label="昵称" required>
              <tiny-input v-model="profile.nick" />
            </tiny-form-item>
            <tiny-form-item label="个人简介">
              <tiny-input v-model="profile.desc" />
            </tiny-form-item>
            <tiny-form-item>
              <tiny-button type="primary" @click="onClickUpdate">
                保存修改
              </tiny-button>
              <div class="ml-4 inline-flex gap-2">
                <router-link :to="{ name: 'update-password' }">
                  <tiny-button type="text">
                    修改密码
                  </tiny-button>
                </router-link>
                <router-link :to="{ name: 'forget-password' }">
                  <tiny-button type="text">
                    忘记密码
                  </tiny-button>
                </router-link>
              </div>
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
