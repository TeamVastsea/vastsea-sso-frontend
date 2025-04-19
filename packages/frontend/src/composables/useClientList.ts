import type { CommonComposablesProps } from '@/types/common-composables';
import type { Ref } from 'vue';
import type { Client } from './useClient';
import SuperJSON from 'superjson';
import { ref } from 'vue';
import instance from './axios';

export interface ClientManagerProfile {
  id: string;
  desc: string | null;
  avatar: string | null;
  nick: string;
  accountId: bigint;
}

export interface ClientInfo extends Client {
  administrator: ClientManagerProfile[];
}
export interface UseClientListProps {
  size: number;
}
export function useClientList(
  { fetcher, size: _size }: CommonComposablesProps & UseClientListProps = {
    fetcher: instance,
    size: 20,
  },
) {
  const loading = ref(false);
  const data: Ref<ClientInfo[]> = ref([]);
  const preId: Ref<undefined | string> = ref(undefined);
  const size: Ref<number> = ref(_size);
  const total = ref(0);

  // page -> preId
  const preIdRecord = new Map<number, string>();
  const getList = () => {
    loading.value = true;
    return fetcher.get<unknown, List<ClientInfo>>('/client', {
      params: SuperJSON.serialize({
        preId: preId.value,
        size: size.value,
      }).json,
    })
      .then((resp) => {
        data.value = resp.data;
        total.value = Number.parseInt(resp.total.toString());
        return resp;
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const loadNext = (page: number) => {
    preId.value = data.value[data.value.length - 1].id;
    preIdRecord.set(page, preId.value);
    return getList();
  };
  const loadPrev = (page: number) => {
    preId.value = preIdRecord.get(page);
    return getList();
  };
  const setSize = (newSize: number) => {
    size.value = newSize;
    preId.value = undefined;
    data.value = [];
    preIdRecord.clear();
    return getList();
  };
  return { getList, loadNext, loadPrev, setSize, loading, data, total, size };
}
