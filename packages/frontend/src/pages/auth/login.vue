<script lang="ts" setup>
import type { PublicClientInfo } from '@/composables';
import { useAxios, useClient } from '@/composables';
import { TinyButton, TinyForm, TinyFormItem, TinyInput } from '@opentiny/vue';
import { useCookies } from '@vueuse/integrations/useCookies';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Error from './components/error.vue';

const route = useRoute();
const router = useRouter();
const clientId = route.query.clientId?.toString();
const cookie = useCookies();
const { fetchPublicInfo } = useClient();
const { axios } = useAxios();
const publicInfo = ref<PublicClientInfo | null>(null);

const loginDto = reactive({
  email: '',
  password: '',
});
// if (cookie.get('session-state')) {
//   axios.post<unknown, { code: string }>(`/auth/session?clientId=${clientId}`)
//     .then((resp) => {
//       const code = resp.code;
//       router.replace({ name: 'redirect', query: { ok: 'true', code } });
//     });
// }
const toRegister = () => {
  if (!document.startViewTransition) {
    router.push({ name: 'Reg' });
    return;
  }
  document.startViewTransition(
    () => router.push({ name: 'Reg' }),
  );
};

if (clientId) {
  fetchPublicInfo(clientId)
    .then((info) => {
      publicInfo.value = info;
    });
}
</script>

<template>
  <div class="p-4 size-full">
    <div class="mx-auto flex h-full max-w-xl items-center">
      <div v-if="clientId" class="p-4 rounded-lg bg-zinc-200 flex flex-wrap-reverse gap-2 h-fit w-full">
        <div class="shrink-0 flex-grow h-full">
          <tiny-form label-position="top" :model="loginDto">
            <form :action="`/api/auth/code?clientId=${clientId}&state=asdiofadsg`" method="post">
              <tiny-form-item label="邮箱" required prop="email">
                <tiny-input v-model="loginDto.email" name="email" />
              </tiny-form-item>
              <tiny-form-item label="密码" required prop="password">
                <tiny-input v-model="loginDto.password" type="password" name="password" />
              </tiny-form-item>
              <tiny-form-item>
                <tiny-button type="primary" native-type="submit" class="mr-2">
                  登录
                </tiny-button>
                <router-link to="/auth/register" view-transition>
                  注册
                </router-link>
              </tiny-form-item>
            </form>
          </tiny-form>
        </div>
        <div class="flex shrink-0 gap-2 w-fit items-start">
          <div class="flex flex-wrap gap-2 min-w-40">
            <img v-if="publicInfo?.avatar" :src="publicInfo.avatar" class="size-8">
            <span> {{ publicInfo?.name }} 想要登陆</span>
          </div>
        </div>
      </div>
      <div v-if="!clientId" class="size-full">
        <error
          :tips="
            ['第三方登录需要CilentId但是没有找到', '这可能不是你的问题', '请尽快联系站点管理员']
          "
        />
      </div>
    </div>
  </div>
</template>
