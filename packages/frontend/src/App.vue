<script lang="ts" setup>
import { useDark } from "@vueuse/core";
import { onMounted } from "vue";

const theme = useDark();
onMounted(() => {
  if (theme.value) {
    document.documentElement.classList.toggle("dark");
  }
});
</script>

<template>
  <div class="size-full">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>
