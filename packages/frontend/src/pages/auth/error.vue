<script lang="ts" setup>
import { useRoute } from "vue-router";
import error from "./components/error.vue";

const route = useRoute();
const reason = route.query.reason?.toString().split(",") ?? [];
</script>

<template>
  <div class="p-4 bg-zinc-100 size-full dark:bg-zinc-900">
    <div class="mx-auto flex h-full max-w-xl items-center">
      <div class="w-full">
        <error :tips="reason" />
      </div>
    </div>
  </div>
</template>
