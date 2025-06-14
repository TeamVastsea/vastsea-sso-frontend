<script lang="ts" setup>
import { useDark } from '@vueuse/core';

useDark();
</script>

<template>
  <div class="w-full h-full bg-zinc-100 dark:bg-zinc-950">
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
