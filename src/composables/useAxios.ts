import axios from 'axios';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAccount } from './useAccount';

const _axios = axios.create({
  baseURL: '/api',
});

_axios.interceptors.response.use((value) => {
  if (value.status === 401) {
    const router = useRouter();
    const { clear } = useAccount();
    clear();
    router.replace({ name: 'Login' });
    return value.data;
  }
  if (value.status < 399) {
    return value.data;
  }
  return value.data;
});

_axios.interceptors.request.use((conf) => {
  const { accessToken } = storeToRefs(useAccount());
  if (accessToken.value) {
    conf.headers.Authorization = `${accessToken.value}`;
  }
  return conf;
});

export function useAxios() {
  return _axios;
}
