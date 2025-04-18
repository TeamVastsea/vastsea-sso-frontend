import { useAccountStore } from '@/store';
import axios from 'axios';
import SuperJSON from 'superjson';
import { unref } from 'vue';

const account = useAccountStore();

const instance = axios.create({
  baseURL: '/api',
  headers: {
    'x-meta': true,
    'Authorization': `Bearer ${unref(account.accessToken)}`,
  },
});

instance.interceptors.request.use((config) => {
  return config;
});
instance.interceptors.response.use((resp) => {
  return SuperJSON.deserialize(resp.data);
});

export default instance;
