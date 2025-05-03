<script lang="ts" setup>
import { bezierEdge, relationNode } from "@/components/ui";
import { useRoleRelationGraph } from "@/composables/useRoleRelationGraph";
import { VueFlow } from "@vue-flow/core";
import { onMounted } from "vue";

export interface RelationNode {
  id: string;
  label: string;
  to?: string;
}
const props = defineProps<{
  roleId: string;
}>();

const { fetch, onClickExpand, nodes, edges } = useRoleRelationGraph();

onMounted(() => {
  fetch(props.roleId);
});
</script>

<template>
  <div class="size-full" style="width: 100%; height: 100%">
    <vue-flow :nodes="nodes" :edges="edges">
      <template #node-custom="customProps">
        <relation-node v-bind="customProps" @expand="onClickExpand" />
      </template>
      <template #edge-custom="customEdgeProps">
        <bezier-edge v-bind="customEdgeProps" />
      </template>
    </vue-flow>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import "@vue-flow/core/dist/style.css";

/* import the default theme, this is optional but generally recommended */
@import "@vue-flow/core/dist/theme-default.css";
</style>
