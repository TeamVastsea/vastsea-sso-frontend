<script lang="ts" setup>
import colorSwitch from '@/components/color-switch.vue';
import { useSidebar } from '@/composables';
import { dashboardHomeChildren } from '@/router';

const { isOpen, toggleSidebar, isMobile } = useSidebar();

const menus = dashboardHomeChildren;
</script>

<template>
  <div class="group flex size-full" :data-sidebar-open="isOpen">
    <div
      :data-isMobile="isMobile"
      :data-show="isOpen"
      :data-isMobileShow="isMobile && isOpen"
      class="group bg-zinc-100 flex shrink-0 basis-48 flex-col h-full w-full relative z-10 overflow-auto dark:bg-zinc-800 data-[show=false]:basis-0 data-[isMobileShow=true]:left-0 data-[isMobileShow=true]:top-0 data-[isMobileShow=true]:fixed data-[show=false]:overflow-hidden"
    >
      <div class="ml-2 mt-2 p-2 rounded bg-zinc-200 w-fit top-2 sticky dark:bg-zinc-700 group-data-[isMobile=false]:hidden" @click="toggleSidebar">
        <div v-if="isOpen" class="i-tabler:layout-sidebar-left-collapse size-5 dark:text-zinc-50" />
        <div v-if="!isOpen" class="i-tabler:layout-sidebar-right-collapse size-5 dark:text-zinc-50" />
      </div>
      <ul class="my-4 px-2 flex-auto space-y-3">
        <router-link
          v-for="menu of menus"
          :key="menu.name"
          :to="{ name: menu.name }"
          exact-active-class="bg-zinc-200 dark:bg-blue-500/20 dark:text-blue-200!"
          class="text-zinc-800 rounded block cursor-pointer transition dark:text-zinc-200"
        >
          <li class="px-2 py-1.5">
            {{ menu.meta?.title }}
          </li>
        </router-link>
      </ul>
      <div class="mb-0 border-t border-t-zinc-300 h-fit w-full dark:border-t-zinc-600">
        <color-switch class="ml-auto mr-0" />
      </div>
    </div>
    <div class="bg-zinc-50 flex flex-shrink flex-grow flex-col max-w-full min-w-0 dark:bg-zinc-900">
      <div class="p-2 h-fit w-full">
        <div class="p-2 rounded flex-auto size-fit cursor-pointer transition hover:bg-zinc-200 dark:hover:bg-zinc-800" @click="toggleSidebar">
          <div v-if="isOpen" class="i-tabler:layout-sidebar-left-collapse size-6 dark:text-zinc-50" />
          <div v-if="!isOpen" class="i-tabler:layout-sidebar-right-collapse size-6 dark:text-zinc-50" />
        </div>
      </div>
      <div class="p-4 bg-zinc-200 size-full overflow-auto dark:bg-zinc-950">
        <div class="p-4 rounded bg-zinc-100 size-full overflow-auto dark:bg-zinc-900">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
