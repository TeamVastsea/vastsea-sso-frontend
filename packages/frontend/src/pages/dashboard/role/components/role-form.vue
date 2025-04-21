<script lang="ts" setup>
import { useRole } from '@/composables';

const { roleId } = defineProps<{
  roleId: string;
}>();

const { getRoleInfo } = useRole();
getRoleInfo(roleId)
  .then((resp) => {
    console.log(resp);
  });
</script>

<template>
  hi
</template>
