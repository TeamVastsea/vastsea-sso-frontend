<script lang="ts" setup>
import { onMounted } from 'vue';

onMounted(() => {
  window.location.href = `${import.meta.env.VITE_SSO_URL}/login/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_CALLBACK}&response_type=code&scope=openid id email profile`;
});
</script>

<template>
  <div class="w-full h-full flex items-center justify-center">
    <p class="text-zinc-900 dark:text-zinc-100 font-sans">
      Loading ...
    </p>
  </div>
</template>
