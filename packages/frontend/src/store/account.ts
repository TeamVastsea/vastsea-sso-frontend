import { useAxios } from '@/composables';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TokenPayload {
  access_token: string;
  refresh_token: string;
}

export const useAccountStore = defineStore('account', () => {
  const accessToken = ref('');
  const refreshToken = ref('');
  const permissionList = ref<string[]>([]);
  const { axios } = useAxios();
  const fetchPermissionList = () => {
    return axios.get<never, string[]>('/permission/list')
      .then((resp) => {
        permissionList.value = resp;
      });
  };
  const setTokenPair = (payload: TokenPayload) => {
    accessToken.value = payload.access_token;
    refreshToken.value = payload.refresh_token;
  };
  const clearTokenPair = () => {
    accessToken.value = '';
    refreshToken.value = '';
  };
  return { accessToken, refreshToken, permissionList, fetchPermissionList, setTokenPair, clearTokenPair };
}, { persist: true });
