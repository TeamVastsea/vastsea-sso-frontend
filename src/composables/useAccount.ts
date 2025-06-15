import { defineStore } from 'pinia';
import { type MaybeRef, ref, unref } from 'vue';
import { useAxios } from './useAxios';

interface TokenPair {
  localToken: string;
  id: string;
}

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
    const clear = () => {
      accessToken.value = '';
      id.value = '';
    }
    const axios = useAxios();
    const getTokenByCode = (code: MaybeRef<string>) => {
      return axios.get<unknown, TokenPair>('/auth/token', {
        params: {
          code: unref(code),
        },
      });
    };
    return { accessToken, id, setAccessToken, getTokenByCode, setId, clear };
  },
  {
    persist: true,
  },
);
