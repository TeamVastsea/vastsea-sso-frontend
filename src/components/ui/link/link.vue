<script lang="ts" setup>
import type { RouterLinkProps } from 'vue-router';

const props = defineProps<RouterLinkProps>();
</script>

<template>
  <router-link
    v-bind="props"
    exact-active-class="bg-zinc-200 dark:bg-blue-500/20 dark:text-blue-200!"
    class="text-zinc-800 rounded block cursor-pointer transition dark:text-zinc-200"
  >
    <slot />
  </router-link>
</template>
