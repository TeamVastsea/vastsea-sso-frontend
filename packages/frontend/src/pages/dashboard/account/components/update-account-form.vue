<script lang="ts" setup>
import { useAccount, useRole } from "@/composables";
import {
  TinyCheckbox,
  TinyForm,
  TinyFormItem,
  TinyInput,
  TinySelect,
} from "@opentiny/vue";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";

const { id } = defineProps<{ id: string }>();

const { updateAccount, account, fetchAccount } = useAccount();

const role = ref<string[]>([]);

const { roleList, getRoleList } = useRole();

const roleOptions = computed(() => {
  return roleList.value.map((role) => {
    return {
      label: role.name,
      value: role.id,
    };
  });
});
const form = useTemplateRef<any>("form");

watch(
  account.value,
  () => {
    role.value = account.value.role.map((role) => role.id.toString());
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  fetchAccount(BigInt(id)).then((account) => {
    role.value = account.role.map((role) => role.id.toString());
  });
  getRoleList();
});
</script>

<template>
  <tiny-form ref="form" label-position="top" :model="account">
    <tiny-form-item label="Email" required prop="email">
      <tiny-input v-model="account.email" />
    </tiny-form-item>
    <tiny-form-item label="密码" prop="password">
      <tiny-input v-model="account.password" />
    </tiny-form-item>
    <tiny-form-item label="昵称" required prop="profile.nick">
      <tiny-input v-model="account.profile.nick" />
    </tiny-form-item>
    <tiny-form-item label="个人简介" required prop="profile.desc">
      <tiny-input v-model="account.profile.desc" />
    </tiny-form-item>
    <tiny-form-item label="是否启用" prop="profile.active">
      <tiny-checkbox v-model="account.active" />
    </tiny-form-item>
    <tiny-form-item prop="profile.role" label="角色">
      <tiny-select v-model="role" :options="roleOptions" multiple />
    </tiny-form-item>
    <tiny-button
      type="primary"
      @click="
        updateAccount(form.validate, BigInt(id), { ...account, role }).then(
          () => $router.go(0),
        )
      "
    >
      提交
    </tiny-button>
    <!-- TODO:avatar -->
  </tiny-form>
</template>
