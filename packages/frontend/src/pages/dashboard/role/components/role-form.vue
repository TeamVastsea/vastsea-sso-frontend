<script lang="ts" setup>
import type { CreateRole, RoleInfoItem } from "@/composables";
import { usePermission, useRole } from "@/composables";
import {
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyInput,
  TinyModal,
  TinySelect,
} from "@opentiny/vue";
import { useToggle } from "@vueuse/core";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import RelationGraph from "./relation-graph.vue";

const {
  roleId,
  readonlyField = [],
  readonlyAll,
  submitBehavior,
} = defineProps<{
  roleId: string;
  readonlyField?: string[];
  readonlyAll?: boolean;
  submitBehavior?: (id: string, info: Partial<CreateRole>) => void;
}>();
const { getPermissionList, permissionList, loading } = usePermission();
const { getRoleInfo, getRoleList, roleList } = useRole();
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
const roleSelect = computed(() => {
  return roleList.value.map((role) => {
    return {
      label: role.desc || role.name,
      value: role.id,
    };
  });
});
const form = useTemplateRef<Form>("form");
const roleParents = ref<string[]>([]);

const onClickSubmit = () => {
  if (!form.value) {
    return;
  }

  form.value
    .validate()
    .then((ok: boolean) => {
      if (!ok) {
        return;
      }
      submitBehavior?.(roleInfo.value?.id ?? "", {
        name: roleInfo.value?.name,
        desc: roleInfo.value?.desc,
        permissions: roleInfoPermissionId.value,
        parent: roleParents.value,
        clientId: roleInfo.value?.clientId,
      });
    })
    .catch(() => {});
};

watch(
  roleInfo,
  () => {
    if (!roleInfo.value) {
      return [];
    }
    roleInfoPermissionId.value = roleInfo.value.permission.map(
      (permission) => permission.id,
    );
    roleParents.value = roleInfo.value.parents.map((role) => role.id);
  },
  { deep: true },
);
onMounted(() => {
  getRoleInfo(roleId)
    .then((info) => {
      roleInfo.value = info;
      return info;
    })
    .then((info) => {
      getPermissionList(info.clientId, undefined, true);
      getRoleList({ all: true, clientId: info.clientId });
    });
});
</script>

<template>
  <div class="h-full w-full">
    <tiny-form
      v-if="roleInfo"
      ref="form"
      :model="roleInfo"
      label-position="top"
      :display-only="readonlyAll"
    >
      <tiny-form-item label="Role Id">
        <tiny-input
          v-model="roleInfo.id"
          :disabled="readonlyField.includes('id')"
        />
      </tiny-form-item>
      <tiny-form-item label="角色名">
        <tiny-input
          v-model="roleInfo.name"
          :disabled="readonlyField.includes('name')"
        />
      </tiny-form-item>
      <tiny-form-item label="角色简介">
        <tiny-input
          v-model="roleInfo.desc"
          :disabled="readonlyField.includes('desc')"
        />
      </tiny-form-item>
      <tiny-form-item label="角色权限">
        <tiny-select
          v-model="roleInfoPermissionId"
          :loading="loading"
          :options="roleInfoPermissionOptions"
          multiple
          tag-selectable
          :disabled="readonlyField.includes('permission')"
        />
      </tiny-form-item>
      <tiny-form-item label="角色父级">
        <tiny-select
          v-model="roleParents"
          :loading="loading"
          :options="roleSelect"
          multiple
          tag-selectable
          :disabled="readonlyField.includes('role-parent')"
        />
      </tiny-form-item>
      <tiny-form-item label="角色继承图">
        <tiny-button @click="toggleRelationGraphVisibility()">
          展示继承关系
        </tiny-button>
      </tiny-form-item>
      <tiny-form-item v-if="readonlyAll ? false : readonlyField.length">
        <tiny-button type="primary" @click="onClickSubmit">
          提交修改
        </tiny-button>
      </tiny-form-item>
    </tiny-form>
    <tiny-modal
      v-model="showRelationGraph"
      :width="800"
      :height="600"
      title="角色继承图"
    >
      <relation-graph v-if="roleInfo" :role-id="roleInfo.id" />
    </tiny-modal>
  </div>
</template>
