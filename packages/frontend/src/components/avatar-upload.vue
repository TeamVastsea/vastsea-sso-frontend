<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';

const modelValue = defineModel<string>({ required: true });
const fileModelValue = defineModel<File | null>('file', { required: true });
const trigger = useTemplateRef('trigger');
let file: File | null = null;

const isError = ref(false);

const onTriggerChange = () => {
  file = trigger.value?.files?.item(0) ?? null;
  if (!file) {
    return;
  }
  fileModelValue.value = file;
};
</script>

<template>
  <div class="flex flex-col gap-2 size-fit items-center justify-center">
    <div class="relative">
      <div class="group/avatar rounded-full size-100px cursor-pointer relative overflow-hidden" @click="trigger?.click()">
        <img
          v-if="modelValue && !isError"
          :src="modelValue"
          class="size-100px object-cover"
          @error="() => isError = true"
        >
        <div
          v-else
          class="i-material-symbols:account-circle-full text-zinc-700 rounded-full size-100px dark:text-zinc-300"
          @click="trigger?.click()"
        />
        <div class="bg-black/50 opacity-0 flex size-full transition duration-300 items-center left-0 top-0 justify-center absolute group-hover/avatar:opacity-100">
          <div class="i-material-symbols:upload-rounded text-white size-10" />
        </div>
      </div>
      <input ref="trigger" class="hidden" type="file" @change="onTriggerChange">
    </div>
    <div class="text-sm text-zinc-700 text-center dark:text-zinc-300">
      <p>上传头像</p>
      <p>请上传2M以内的头像</p>
      <p>支持PNG/GIF/WEBP/JPEG</p>
    </div>
  </div>
</template>
