import { defineStore } from 'pinia';
import { ref, unref, type MaybeRef } from 'vue';
import { useAxios } from './useAxios';

type TokenPair = {
  localToken: string;
  id: string;
};

export const useAccount = defineStore(
  'Account',
  () => {
    const accessToken = ref('');
    const id = ref('');
    const setAccessToken = (token: string) => {
      accessToken.value = `Bearer ${token}`;
    };
    const setId = (userId: string) => {
      id.value = userId;
    };
    const axios = useAxios();
    const getTokenByCode = (code: MaybeRef<string>) => {
      return axios.get<unknown, TokenPair>('/api/auth/token', {
        params: {
          code: unref(code),
        },
      });
    };
    return { accessToken, id, setAccessToken, getTokenByCode, setId };
  },
  {
    persist: true,
  },
);
