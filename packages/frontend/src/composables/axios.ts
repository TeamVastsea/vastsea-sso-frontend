import { useAccountStore } from '@/store';
import axios from 'axios';
import { unref } from 'vue';
import { useRouter } from 'vue-router';

const account = useAccountStore();

const instance = axios.create({
  baseURL: '/api',
  headers: {
    Authorization: `Bearer ${unref(account.accessToken)}`,
  },
});
const router = useRouter();
instance.interceptors.request.use((config) => {
  return config;
});
instance.interceptors.response.use((resp) => {
  return resp.data;
}, (err) => {
  if (err.status === 401) {
    account.accessToken = '';
    account.refreshToken = '';
    router.replace({ name: 'dashboard-login' });
  }
});

export default instance;
