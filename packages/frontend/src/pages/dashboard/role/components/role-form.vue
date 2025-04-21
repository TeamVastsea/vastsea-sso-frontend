<script lang="ts" setup>
import type { RoleInfoItem } from '@/composables';
import { useRole } from '@/composables';
import { TinyButton, TinyForm, TinyFormItem, TinyInput, TinyModal, TinySelect } from '@opentiny/vue';
import { computed, onMounted, ref } from 'vue';
import RelationGraph, { type RelationNode } from './relation-graph.vue';
import { useToggle } from '@vueuse/core';

const { roleId } = defineProps<{
  roleId: string;
}>();

const { getRoleInfo } = useRole();
const roleInfo = ref<RoleInfoItem | null>(null);
const showRelationGraph = ref(false);
const toggleRelationGraphVisibility = useToggle(showRelationGraph);
const roleInfoPermissionId = computed(() => {
  if (!roleInfo.value) {
    return [];
  }
  return roleInfo.value.permission.map(permission => permission.name);
});
const roleInfoPermissionOptions = computed(() => {
  if (!roleInfo.value) {
    return [];
  }
  return roleInfo.value.permission.map((permission) => {
    return {
      label: permission.desc || permission.name,
      value: permission.id,
    };
  });
});

const nodes = computed(()=>{
  const ret:RelationNode[] = [];
  if (!roleInfo.value){
    return [];
  }
  for (const parent of roleInfo.value.parents){
    ret.push({
      id: parent.id,
      label: parent.name,
    })
    ret.push({id:roleInfo.value.id, label: roleInfo.value.name, to: parent.id})
  }
  return ret;
})

onMounted(() => {
  getRoleInfo(roleId)
    .then((info) => {
      roleInfo.value = info;
    });
});
</script>

<template>
  <div class="h-full w-full">
    <tiny-form v-if="roleInfo" label-position="top">
      <tiny-form-item label="Role Id">
        <tiny-input v-model="roleInfo.id" />
      </tiny-form-item>
      <tiny-form-item label="Role Name">
        <tiny-input v-model="roleInfo.name" />
      </tiny-form-item>
      <tiny-form-item label="Role Desc">
        <tiny-input v-model="roleInfo.desc" />
      </tiny-form-item>
      <tiny-form-item label="Role Permissions">
        <tiny-select v-model="roleInfoPermissionId" :options="roleInfoPermissionOptions" multiple tag-selectable />
      </tiny-form-item>
      <tiny-form-item label="Parent">
        <tiny-button @click="toggleRelationGraphVisibility()">
          展示继承关系
        </tiny-button>
      </tiny-form-item>
    </tiny-form>
    <tiny-modal fullscreen v-model="showRelationGraph">
      <relation-graph :nodes="nodes" />
    </tiny-modal>
  </div>
</template>
