<script lang="ts" setup>
import { useDark } from '@vueuse/core';
import { onMounted, watch } from 'vue';

const theme = useDark();

watch(theme, () => {
  document.documentElement.classList.add(theme.value ? 'dark' : 'light');
});

onMounted(() => {
  document.documentElement.classList.add(theme.value ? 'dark' : 'light');
});
</script>

<template>
  <div class="size-full">
    <router-view />
  </div>
</template>
