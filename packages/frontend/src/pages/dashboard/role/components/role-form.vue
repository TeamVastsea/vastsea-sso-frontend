<script lang="ts" setup>
import type { RoleInfoItem } from '@/composables';
import { usePermission, useRole } from '@/composables';
import { TinyButton, TinyForm, TinyFormItem, TinyInput, TinyModal, TinySelect } from '@opentiny/vue';
import { useToggle } from '@vueuse/core';
import { computed, onMounted, readonly, ref, watch } from 'vue';
import RelationGraph from './relation-graph.vue';

const { roleId, readonlyField=[],readonlyAll } = defineProps<{
  roleId: string;
  readonlyField?: string[];
  readonlyAll?: boolean
}>();
const {getPermissionList, permissionList,loading} = usePermission();
const { getRoleInfo } = useRole();
const roleInfo = ref<RoleInfoItem | null>(null);
const showRelationGraph = ref(false);
const toggleRelationGraphVisibility = useToggle(showRelationGraph);
const roleInfoPermissionId = ref<string[]>([]);
const roleInfoPermissionOptions = computed(() => {
  if (!permissionList.value) {
    return [];
  }
  return permissionList.value.map((permission) => {
    return {
      label: permission.desc || permission.name,
      value: permission.id,
    };
  });
});
watch(roleInfo, ()=>{
  if (!roleInfo.value) {
    return [];
  }
  roleInfoPermissionId.value = roleInfo.value.permission.map(permission => permission.id);
})
onMounted(() => {
  getRoleInfo(roleId)
    .then((info) => {
      roleInfo.value = info;
      return info
    })
    .then((info) => {
      getPermissionList(info.clientId, undefined, true);
    })
});
</script>

<template>
  <div class="h-full w-full">
    <tiny-form v-if="roleInfo" label-position="top" :display-only="readonlyAll">
      <tiny-form-item label="Role Id">
        <tiny-input v-model="roleInfo.id" :readonly="readonlyField.includes('id')" />
      </tiny-form-item>
      <tiny-form-item label="Role Name">
        <tiny-input v-model="roleInfo.name" :readonly="readonlyField.includes('name')"/>
      </tiny-form-item>
      <tiny-form-item label="Role Desc">
        <tiny-input v-model="roleInfo.desc" :readonly="readonlyField.includes('desc')"/>
      </tiny-form-item>
      <tiny-form-item label="Role Permissions">
        <tiny-select :loading="loading" v-model="roleInfoPermissionId" :options="roleInfoPermissionOptions" multiple tag-selectable :readonly="readonlyField.includes('permission')" />
      </tiny-form-item>
      <tiny-form-item label="Parent">
        <tiny-button @click="toggleRelationGraphVisibility()">
          展示继承关系
        </tiny-button>
      </tiny-form-item>
      <tiny-form-item v-if="!readonlyField.length">
        <tiny-button type="primary">
          提交修改
        </tiny-button>
      </tiny-form-item>
    </tiny-form>
    <tiny-modal v-model="showRelationGraph" :width="800" :height="600" title="角色继承图">
      <relation-graph v-if="roleInfo" :role-id="roleInfo.id" />
    </tiny-modal>
  </div>
</template>
