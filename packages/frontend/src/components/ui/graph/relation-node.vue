<script lang="ts" setup>
import type { NodeProps } from '@vue-flow/core';
import type { VNode } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { isVNode } from 'vue';

const {
  data,
} = defineProps<NodeProps<{ id: string; label: string | VNode; showExpand: boolean }>>();

const emits = defineEmits<{
  expand: [string];
}>();
</script>

<template>
  <div class="flex flex-col items-center">
    <handle type="target" class="opacity-0" :position="Position.Top" />
    <div class="px-10 py-2 text-center rounded bg-blue-500 text-zinc-50 min-w-16">
      <component :is="data.label" v-if="isVNode(data.label)" />
      <span v-else>{{ data.label }}</span>
    </div>
    <handle type="source" class="opacity-0" :position="Position.Bottom" />
    <div v-if="data.showExpand" class="i-material-symbols:add cursor-pointer color-blue-500" @click="emits('expand', data.id)" />
  </div>
</template>
