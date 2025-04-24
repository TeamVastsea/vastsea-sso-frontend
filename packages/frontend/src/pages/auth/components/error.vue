<script lang="ts" setup>
import { useRouter } from 'vue-router';

defineProps<{ tips: string[] }>();
const router = useRouter();
</script>

<template>
  <div class="py-16 flex flex-col gap-8 items-center">
    <div class="size-20 h-full aspect-square">
      <img src="/logo.svg" class="mx-auto size-full">
    </div>
    <div class="text-zinc-900 text-center h-fit min-h-16 space-y-1">
      <p v-for="tip, key of tips" :key="key">
        {{ tip }}
      </p>
    </div>
    <button class="px-3 py-1.5 rounded-md w-fit cursor-pointer transition hover:bg-zinc-200 hover:dark:bg-zinc-800" @click="router.back()">
      带我离开
    </button>
  </div>
</template>
