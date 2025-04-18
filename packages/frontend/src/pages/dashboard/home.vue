<script lang="ts" setup>
import colorSwitch from '@/components/color-switch.vue';
import { useSidebar } from '@/composables';
import { dashboardHomeChildren } from '@/router';

const { isOpen, toggleSidebar, isMobile } = useSidebar();

const menus = dashboardHomeChildren;
</script>

<template>
  <div class="size-full flex group" :data-sidebar-open="isOpen">
    <div
      :data-isMobile="isMobile"
      :data-show="isOpen"
      :data-isMobileShow="isMobile && isOpen"
      class="
      bg-zinc-100 flex flex-col shrink-0 overflow-auto relative
      w-full basis-48 h-full dark:bg-zinc-800 group z-10
      data-[show=false]:basis-0
      data-[show=false]:overflow-hidden
      data-[isMobileShow=true]:fixed data-[isMobileShow=true]:top-0 data-[isMobileShow=true]:left-0
      "
    >
      <div class="sticky top-2 p-2 bg-zinc-200 dark:bg-zinc-700 rounded w-fit ml-2 mt-2 group-data-[isMobile=false]:hidden" @click="toggleSidebar">
        <div v-if="isOpen" class="i-tabler:layout-sidebar-left-collapse size-5 dark:text-zinc-50" />
        <div v-if="!isOpen" class="i-tabler:layout-sidebar-right-collapse size-5 dark:text-zinc-50" />
      </div>
      <ul class="space-y-3 px-2 my-4 flex-auto">
        <router-link
          v-for="menu of menus"
          :key="menu.name"
          :to="{ name: menu.name }"
          exact-active-class="bg-zinc-200 dark:bg-blue-500/20"
          class="cursor-pointer block rounded transition dark:text-blue"
        >
          <li class="px-2 py-1.5">
            {{ menu.meta?.title }}
          </li>
        </router-link>
      </ul>
      <div class="mb-0 h-fit w-full border-t dark:border-t-zinc-600 border-t-zinc-300 ">
        <color-switch class="mr-0 ml-auto" />
      </div>
    </div>
    <div class="flex-grow flex-shrink bg-zinc-50 dark:bg-zinc-900 flex flex-col min-w-0 max-w-full">
      <div class="w-full h-fit p-2">
        <div class="size-fit flex-auto hover:bg-zinc-200 dark:hover:bg-zinc-800 p-2 cursor-pointer rounded transition" @click="toggleSidebar">
          <div v-if="isOpen" class="i-tabler:layout-sidebar-left-collapse size-6 dark:text-zinc-50" />
          <div v-if="!isOpen" class="i-tabler:layout-sidebar-right-collapse size-6 dark:text-zinc-50" />
        </div>
      </div>
      <div class="size-full bg-zinc-200 dark:bg-zinc-950 p-4 overflow-auto">
        <div class="size-full bg-zinc-100 dark:bg-zinc-900 p-4 rounded overflow-auto">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
