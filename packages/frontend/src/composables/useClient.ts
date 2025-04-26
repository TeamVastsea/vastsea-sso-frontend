import type { CommonComposablesProps } from '@/types/common-composables';
import type { ClientInfo } from './useClientList';
import { reactive } from 'vue';
import instance from './axios';

export interface PublicClientInfo {
  clientId: string;
  avatar: string | null;
  name: string;
  redirect: string;
}

export interface CreateClientData {
  name: string;
  desc: string;
  avatar: string;
  redirect: string;
  administrator: string[];
}
export interface UpdateClient extends Partial<CreateClientData> {
  active?: boolean;
}
export interface Client {
  name: string;
  id: string;
  desc: string;
  avatar: string;
  clientId: string;
  clientSecret: string;
  redirect: string;
  active: boolean;
}
export function useClient(
  {
    fetcher,
  }: CommonComposablesProps = { fetcher: instance },
) {
  const formData: CreateClientData = reactive({
    name: '',
    desc: '',
    avatar: '',
    redirect: '',
    administrator: [],
  });
  const rules = {
    name: [{ required: true }],
    desc: [{ required: true }],
    redirect: [{ required: true }],
  };

  const create = () => {
    return fetcher.post<unknown, Client>('/client', {
      ...formData,
    });
  };
  const update = (id: string, data: UpdateClient) => {
    return fetcher.patch<unknown, Client>(`/client/${id}`, data);
  };
  const fetchInfo = (id: string) => {
    return fetcher.get<unknown, Client>(`/client/${id}`);
  };
  const fetchPublicInfo = (id: string) => {
    return fetcher.get<unknown, PublicClientInfo>(`/client/pub-info/${id}`);
  };

  return { formData, rules, create, fetchInfo, update, fetchPublicInfo };
}
