import type { CommonComposablesProps } from '@/types/common-composables';
import { reactive } from 'vue';
import instance from './axios';

export interface CreateClientData {
  name: string;
  desc: string;
  avatar: string;
  redirect: string;
  administrator: string[];
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
    fetcher
  }:CommonComposablesProps= {fetcher:instance}
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
      ...formData
    })
  }

  return { formData, rules, create };
}
