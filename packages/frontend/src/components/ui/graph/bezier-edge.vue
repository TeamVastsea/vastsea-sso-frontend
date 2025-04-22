<script setup lang="ts">
import type { EdgeProps } from '@vue-flow/core';
import { BezierEdge, useVueFlow } from '@vue-flow/core';
import { computed } from 'vue';
import ArrowMarker from './arrow-marker.vue';

const props = defineProps<EdgeProps>();

const {findNode} = useVueFlow();

const markerId = computed(() => `${props.id}-marker`)
</script>

<script lang="ts">
export default {
  name: 'CustomEdge',
};
</script>

<template>
  <BezierEdge
    class="stroke-blue-500!"
    :source-x="sourceX"
    :source-y="sourceY"
    :target-x="targetX"
    :target-y="targetY"
    :source-position="sourcePosition"
    :target-position="targetPosition"
    :marker-end="`url(#${markerId})`"
    :marker-start="`url(#${markerId})`"
  />
  <arrow-marker type="arrow" :id="markerId" :width="20" :height="20" />
</template>