<script lang="ts" setup>
import { useDark } from '@vueuse/core';

useDark();
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
