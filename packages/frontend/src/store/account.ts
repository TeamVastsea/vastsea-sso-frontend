import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TokenPayload {
  access_token: string;
  refresh_token: string;
}

export const useAccountStore = defineStore('account', () => {
  const accessToken = ref('');
  const refreshToken = ref('');
  const setTokenPair = (payload: TokenPayload) => {
    accessToken.value = payload.access_token;
    refreshToken.value = payload.refresh_token;
  };
  return { accessToken, refreshToken, setTokenPair };
}, { persist: true });
