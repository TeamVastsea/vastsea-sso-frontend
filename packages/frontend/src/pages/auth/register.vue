<script lang="ts" setup>
import { GeeTest } from '@/components/ui';
import { useAxios } from '@/composables';
import {
  Modal,
  TinyButton,
  TinyCheckbox,
  TinyForm,
  TinyFormItem,
  TinyInput,
} from '@opentiny/vue';
import { reactive, ref, useTemplateRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface RegisterDTO {
  email: string;
  password: string;
  code: string;
  profile: {
    nick: string;
    desc: string;
  };
  usa: boolean;
}

const form = useTemplateRef<Form>('form');

const route = useRoute();
const router = useRouter();
const clientId = route.query.clientId?.toString();

if (!clientId) {
  router.replace({
    query: { clientId: __AUTH_SERVER__ },
  });
}

const registerBody: RegisterDTO = reactive({
  email: '',
  password: '',
  code: '',
  profile: {
    nick: '',
    desc: '',
  },
  usa: false,
});

const mailCodeTTL = ref(-1);

const { axios } = useAxios();

const sendEmail = () => {
  if (!registerBody.email) {
    return;
  }
  axios
    .post<never, { ttl: number }>('/account/mail-code', null, {
      params: {
        email: registerBody.email,
      },
    })
    .then(({ ttl }) => {
      mailCodeTTL.value = ttl;
      const handles = setInterval(() => {
        if (mailCodeTTL.value === 0) {
          clearInterval(handles);
          return;
        }
        mailCodeTTL.value -= 1;
      }, 1000);
    });
};

const register = () => {
  form.value
    .validate()
    .then((ok: boolean) => {
      if (!ok) {
        return;
      }
      axios.post('/account/register', registerBody).then(() => {
        Modal.message({
          message: '注册成功',
        });
        router.replace({
          path: `/auth/login`,
          query: router.currentRoute.value.query,
        });
      });
    })
    .catch(() => {});
};
</script>

<template>
  <div class="p-4 bg-zinc-100 size-full dark:bg-zinc-900">
    <div class="mx-auto flex h-full max-w-xl items-center">
      <div
        class="form-wrapper p-4 border border-zinc-300 rounded bg-zinc-200 h-fit w-full dark:border-none dark:bg-zinc-800"
      >
        <h1 class="text-3xl text-zinc-800 mb-4 dark:text-zinc-200">
          注册账号
        </h1>
        <tiny-form
          ref="form"
          label-position="top"
          validate-type="text"
          :model="registerBody"
        >
          <tiny-form-item label="邮箱" required prop="email">
            <tiny-input v-model="registerBody.email" />
          </tiny-form-item>
          <tiny-form-item label="验证码" required prop="code">
            <div class="flex gap-2 w-full">
              <tiny-input v-model="registerBody.code" />
              <tiny-button
                v-if="mailCodeTTL <= 0"
                :disabled="!registerBody.email.length"
                @click="sendEmail"
              >
                发送验证码
              </tiny-button>
              <tiny-button v-else>
                {{ mailCodeTTL }}
              </tiny-button>
            </div>
          </tiny-form-item>
          <tiny-form-item label="密码" required prop="password">
            <tiny-input
              v-model="registerBody.password"
              type="password"
              show-password
            />
          </tiny-form-item>
          <tiny-form-item label="昵称" required prop="profile.nick">
            <tiny-input v-model="registerBody.profile.nick" />
          </tiny-form-item>
          <tiny-form-item label="个人简介" prop="profile.nick">
            <tiny-input v-model="registerBody.profile.desc" />
          </tiny-form-item>
          <tiny-form-item prop="usa">
            <tiny-checkbox v-model="registerBody.usa" class="*:pt-0">
              点击同意 用户服务条款
            </tiny-checkbox>
          </tiny-form-item>
          <tiny-form-item>
            <tiny-button type="primary" @click="register">
              注册
            </tiny-button>
          </tiny-form-item>
        </tiny-form>
      </div>
    </div>
  </div>
</template>

<style>
.form-wrapper {
  view-transition-name: formWrapper;
}
</style>
