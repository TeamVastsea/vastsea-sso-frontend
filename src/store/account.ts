import { useAxios } from '@/composables';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TokenPayload {
  accessToken: {
    token: string;
    ttl: number;
  };
  refreshToken: {
    token: string;
    ttl: number;
  };
}

export const useAccountStore = defineStore(
  'account',
  () => {
    const accessToken = ref('');
    const refreshToken = ref('');
    const accessTokenTTL = ref(-1);
    const refreshTokenTTL = ref(-1);
    const permissionList = ref<string[]>([]);
    const { axios } = useAxios();
    const fetchPermissionList = () => {
      return axios.get<never, string[]>('/permission/list').then((resp) => {
        permissionList.value = resp;
      });
    };
    const setTokenPair = (payload: TokenPayload) => {
      accessToken.value = payload.accessToken.token;
      refreshToken.value = payload.refreshToken.token;
      accessTokenTTL.value = payload.accessToken.ttl;
      refreshTokenTTL.value = payload.refreshToken.ttl;
    };
    const clearTokenPair = () => {
      accessToken.value = '';
      refreshToken.value = '';
    };
    return {
      accessToken,
      refreshToken,
      accessTokenTTL,
      refreshTokenTTL,
      permissionList,
      fetchPermissionList,
      setTokenPair,
      clearTokenPair,
    };
  },
  { persist: true },
);
