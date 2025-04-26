<script lang="ts" setup>
import { useDark } from '@vueuse/core';
import { onMounted } from 'vue';

const theme = useDark();
onMounted(() => {
  if (theme.value) {
    document.documentElement.classList.toggle('dark');
  }
});
</script>

<template>
  <div class="size-full">
    <router-view />
  </div>
</template>
