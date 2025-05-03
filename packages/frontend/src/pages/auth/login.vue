<script lang="ts" setup>
import type { PublicClientInfo } from '@/composables';
import { useAxios, useClient } from '@/composables';
import { TinyButton, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
import { useCookies } from '@vueuse/integrations/useCookies';
import { reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const clientId = ref(route.query.clientId?.toString());
const cookie = useCookies();
const { fetchPublicInfo } = useClient();
const { axios } = useAxios();
const publicInfo = ref<PublicClientInfo | null>(null);

const loginDto = reactive({
  email: '',
  password: '',
});
if (cookie.get('session-state')) {
  axios
    .post<unknown, { code: string }>(`/auth/session?clientId=${clientId.value}`)
    .then((resp) => {
      const code = resp.code;
      router.replace({ name: 'redirect', query: { ok: 'true', code } });
    })
    .catch(() => {
      cookie.remove('session-state');
    });
}

if (clientId.value && clientId.value === 'undefined') {
  router.push({
    name: 'AuthError',
    query: {
      reason: [
        'AuthServer 出现异常',
        '这可能不是你的问题',
        '请尽快向站点管理员反馈该问题',
      ],
    },
  });
}

if (!clientId.value) {
  if (!__AUTH_SERVER__) {
    router.push({
      name: 'AuthError',
      query: {
        reason: [
          'AuthServer 出现异常',
          '这可能不是你的问题',
          '请尽快向站点管理员反馈该问题',
        ],
      },
    });
  } else {
    router.push({
      name: 'Login',
      query: {
        clientId: __AUTH_SERVER__,
      },
      force: true,
    });
    clientId.value = __AUTH_SERVER__;
  }
}
watch(
  clientId,
  () => {
    if (!clientId.value) {
      return;
    }
    fetchPublicInfo(clientId.value)
      .then((info) => {
        publicInfo.value = info;
      })
      .catch((err) => {
        if (err.statusCode === 404) {
          router.replace({
            name: 'AuthError',
            query: { reason: '客户端不存在' },
          });
        }
      });
  },
  { immediate: true },
);
</script>

<template>
  <div class="p-4 bg-zinc-100 size-full dark:bg-zinc-900">
    <div class="mx-auto flex h-full max-w-xl items-center">
      <div
        v-if="clientId"
        class="p-4 rounded-lg bg-zinc-200 flex flex-col gap-2 h-fit w-full dark:bg-zinc-800"
      >
        <div class="flex shrink-0 gap-2 w-full items-center justify-center">
          <div
            class="text-zinc-900 flex flex-col flex-wrap gap-2 dark:text-zinc-100"
          >
            <div class="mx-auto w-fit">
              <img v-if="publicInfo?.avatar" :src="publicInfo.avatar" alt="">
              <div
                v-else
                class="i-material-symbols:person-shield-outline-rounded dark:i-material-symbols:person-shield-rounded size-16 dark:size-16"
              />
            </div>
            <div class="mx-auto text-center w-fit space-y-2">
              <h1 class="text-2xl">
                {{ publicInfo?.name }}
              </h1>
              <span class="text-sm">将会登陆到</span>
            </div>
          </div>
        </div>
        <div class="shrink-0 flex-grow h-full">
          <tiny-form label-position="top" :model="loginDto">
            <form
              :action="`/api/auth/code?clientId=${clientId}&state=asdiofadsg`"
              method="post"
            >
              <tiny-form-item label="邮箱" required prop="email">
                <tiny-input v-model="loginDto.email" name="email" />
              </tiny-form-item>
              <tiny-form-item label="密码" required prop="password">
                <tiny-input
                  v-model="loginDto.password"
                  type="password"
                  name="password"
                />
                <router-link
                  view-transition
                  to="/auth/forget-password"
                  class="text-blue-500"
                >
                  忘记密码
                </router-link>
              </tiny-form-item>
              <tiny-form-item>
                <tiny-button type="primary" native-type="submit" class="mr-2">
                  登录
                </tiny-button>

                <router-link
                  to="/auth/register"
                  view-transition
                  class="text-zinc-800 dark:text-zinc-200"
                >
                  注册
                </router-link>
              </tiny-form-item>
            </form>
          </tiny-form>
        </div>
      </div>
    </div>
  </div>
</template>
