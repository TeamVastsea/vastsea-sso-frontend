<script lang="ts" setup>
import { useDark } from '@vueuse/core';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { Toaster } from 'vue-sonner';
import 'dayjs/locale/zh-cn';
import 'vue-sonner/style.css';

useDark();
dayjs.locale('zh-cn');

dayjs.extend(RelativeTime);
</script>

<template>
  <div class="w-full h-full bg-zinc-100 dark:bg-zinc-950">
    <Toaster rich-colors theme="system" position="top-center" />
    <router-view />
  </div>
</template>

<style>
html,body,#app {
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
}
* {
  box-sizing: border-box;
}
</style>
