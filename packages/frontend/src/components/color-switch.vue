<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggle = useToggle(isDark);
</script>

<template>
  <div class="size-fit p-2 text-zinc-800 dark:text-zinc-100">
    <div v-if="!isDark" class="i-material-symbols:dark-mode-outline size-6" @click="() => toggle()" />
    <div v-else class="i-material-symbols:light-mode-outline size-6" @click="() => toggle()" />
  </div>
</template>
