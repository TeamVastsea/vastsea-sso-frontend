<script lang="ts" setup>
import { useInfiniteAccountList } from '@/composables';
import { TinyOption, TinySelect } from '@opentiny/vue';
import InfiniteScroll from '@opentiny/vue-renderless/common/deps/infinite-scroll';
import { onMounted, ref, watch } from 'vue';

const { data, load, loadMore, isLoading } = useInfiniteAccountList();
const vInfiniteScroll = InfiniteScroll;
const administratorId = ref<string[]>([]);
const modelValue = defineModel<string[]>();
watch(administratorId, ()=>{
  modelValue.value = administratorId.value;
})

onMounted(() => {
  load();
});
</script>

<template>
  <tiny-select :loading="isLoading" v-model="administratorId" v-infinite-scroll="loadMore" multiple>
    <tiny-option v-for="option in data" :key="option.id" :value="option.id" :label="option.profile.nick" />
  </tiny-select>
</template>
