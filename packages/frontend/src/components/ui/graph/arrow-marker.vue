<script lang="ts" setup>
import type { MarkerProps } from "@vue-flow/core";

defineProps<MarkerProps & { id: string }>();
</script>

<template>
  <svg class="vue-flow__marker vue-flow__container">
    <defs>
      <marker
        :id="id"
        class="vue-flow__arrowhead"
        viewBox="-10 -10 20 20"
        refX="0"
        refY="0"
        :markerWidth="width"
        :markerHeight="height"
        markerUnits="strokeWidth"
        orient="auto-start-reverse"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          class="fill-blue-500"
          d="M -4 -4 H 4 V 4 H -4 Z"
        />
      </marker>
    </defs>
  </svg>
</template>
