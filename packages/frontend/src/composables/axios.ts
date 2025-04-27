import { useAccountStore } from '@/store';
import { Modal } from '@opentiny/vue';
import axios from 'axios';
import { unref } from 'vue';

const account = useAccountStore();

const instance = axios.create({
  baseURL: '/api',
  headers: {
    Authorization: `Bearer ${unref(account.accessToken)}`,
  },
});

instance.interceptors.request.use((config) => {
  config.headers.setAuthorization(`Bearer ${unref(account.accessToken)}`, true);
  return config;
});
instance.interceptors.response.use((resp) => {
  return resp.data;
}, (err) => {
  Modal.message({
    message: err.response.data.message,
    status: 'error',
  });
  if (err.status === 401) {
    history.go(0);
    account.clearTokenPair();
    return;
  }
  throw err.response.data;
});

export const useAxios = () => ({ axios: instance });

export default instance;
