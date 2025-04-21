<script lang="ts" setup>
import type { Edge, Node } from '@vue-flow/core';
import {VueFlow} from '@vue-flow/core';
import { ref, toRefs, watch } from 'vue';

export interface RelationNode {
  id: string;
  label: string;
  to?: string;
}
const props = defineProps<{
  nodes: RelationNode[];
}>();

const { nodes:_nodes } = toRefs(props);

const relationNodeMap = new Map<string, Node>();

const nodes = ref<Node[]>([]);

const edges = ref<Edge[]>([]);

watch(_nodes, () => {
  console.log(_nodes.value)
  if(!_nodes.value){
    return;
  }
  for (const node of _nodes.value) {
    if (relationNodeMap.has(node.id)) {
      continue;
    }
    const flowNode = {
      id: node.id,
      data: {
        label: node.label,
      },
      position: {
        x: 200,
        y: 200,
      },
    };
    relationNodeMap.set(node.id, flowNode);
    nodes.value.push(flowNode);
    edges.value.push({
      id: `${node.id} -> ${node.to}`,
      source: node.id,
      target: node.to ?? '',
    });
  }
}, { immediate: true, deep: true });
</script>

<template>
  <div class="size-full">
    <vue-flow :nodes="nodes" :edges="edges" />
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>
