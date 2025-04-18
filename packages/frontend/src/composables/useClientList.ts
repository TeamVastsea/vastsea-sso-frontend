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
  const preId: Ref<null | bigint> = ref(null);
  const size: Ref<null | number> = ref(_size);
  const getList = () => {
    loading.value = true
    return fetcher.get<unknown, List<ClientInfo>>('/client', {
      params: SuperJSON.serialize({
        preId: preId.value,
        size: size.value,
      }).json,
    })
      .then((resp) => {
        data.value = resp.data;
      })
      .finally(() => {
        loading.value = false;
      })
  };
  return { getList, loading, data };
}
