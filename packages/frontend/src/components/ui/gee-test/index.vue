<script lang="ts" setup>
import { useAxios } from '@/composables';
import { onMounted, ref, toRefs, useTemplateRef, watch } from 'vue';

const props = defineProps<{ endPoint: string }>();

const { endPoint } = toRefs(props);

const captcha = useTemplateRef('geetest-captcha');
const { axios } = useAxios();
const show = ref(false);

watch(endPoint, () => {
  axios.get<never, { should: boolean }>('/captcha/should-show', { params: { url: endPoint.value } })
    .then((resp) => {
      show.value = resp.should;
    });
}, { immediate: true });

onMounted(() => {
  if (!captcha.value) {
    return;
  }

  initGeetest4({
    captchaId: __GT_ID__,
    nativeButton: {
      height: '100%',
      width: '100%',
    },
  }, (captcha) => {
    captcha.appendTo('#captchaBox');
    captcha.onSuccess(() => {
      const {
        lot_number,
        captcha_output,
        pass_token,
        gen_time,
      } = captcha.getValidate();
      axios.get('/captcha/valid', { params: { lot_number, captcha_output, pass_token, gen_time } });
    });
  });
});
</script>

<template>
  <transition enter-active-class="transition duration-500" leave-active-class=" transition duration-1000" enter-to-class="opacity-100" leave-to-class="opacity-0" appear>
    <div v-show="show" id="captchaBox" ref="geetest-captcha" />
  </transition>
</template>
