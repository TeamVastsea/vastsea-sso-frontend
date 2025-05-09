<script lang="ts" setup>
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();
const toggle = useToggle(isDark);
</script>

<template>
  <div class="text-zinc-800 p-2 size-fit dark:text-zinc-100">
    <div
      v-if="!isDark"
      class="i-material-symbols:dark-mode-outline size-6"
      @click="() => toggle()"
    />
    <div
      v-else
      class="i-material-symbols:light-mode-outline size-6"
      @click="() => toggle()"
    />
  </div>
</template>
