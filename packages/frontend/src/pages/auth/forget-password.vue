<script lang="ts" setup>
import { CountDown } from "@/components/ui";
import { useAxios } from "@/composables";
import { TinyButton, TinyForm, TinyFormItem, TinyInput } from "@opentiny/vue";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

interface ForgetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}
const forgetPassword: ForgetPasswordDto = reactive({
  email: "",
  code: "",
  newPassword: "",
});

const router = useRouter();

const { axios } = useAxios();
const ttl = ref(-1);
const sendMailCode = () => {
  axios
    .post<
      never,
      { ttl: number }
    >("/secure/password/forget-mail-code", null, { params: { email: forgetPassword.email } })
    .then((resp) => {
      ttl.value = resp.ttl / 1000;
    });
};
const sendForgetPassword = () => {
  axios.patch("/secure/password/forget", forgetPassword).then(() => {
    router.back();
  });
};
</script>

<template>
  <div class="p-4 bg-zinc-100 size-full dark:bg-zinc-900">
    <div class="mx-auto flex h-full max-w-xl items-center">
      <div
        class="p-4 rounded-lg bg-zinc-200 flex flex-col gap-2 h-fit w-full dark:bg-zinc-800"
      >
        <h1 class="text-3xl text-zinc-800 mb-4 dark:text-zinc-200">忘记密码</h1>
        <tiny-form
          label-position="top"
          :model="forgetPassword"
          validate-type="text"
        >
          <tiny-form-item label="Email" required prop="email">
            <tiny-input v-model="forgetPassword.email" />
          </tiny-form-item>
          <tiny-form-item label="验证码" required prop="code">
            <div class="flex gap-2 w-full">
              <tiny-input v-model="forgetPassword.code" />
              <count-down v-model="ttl" :interval="1000" :end-value="0">
                <template #done>
                  <tiny-button
                    :disabled="!forgetPassword.email.length"
                    @click="sendMailCode"
                  >
                    发送验证码
                  </tiny-button>
                </template>
              </count-down>
            </div>
          </tiny-form-item>
          <tiny-form-item label="新密码" required prop="newPassword">
            <tiny-input
              v-model="forgetPassword.newPassword"
              show-password
              type="password"
            />
          </tiny-form-item>
          <tiny-form-item>
            <tiny-button @click="sendForgetPassword"> 提交 </tiny-button>
          </tiny-form-item>
        </tiny-form>
      </div>
    </div>
  </div>
</template>
