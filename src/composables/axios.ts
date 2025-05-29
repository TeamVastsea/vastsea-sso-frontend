import type { InternalAxiosRequestConfig } from 'axios';
import { useAccountStore } from '@/store';
import { Modal } from '@opentiny/vue';
import axios from 'axios';
import { unref } from 'vue';
import { geeTest, useCaptcha } from './useCaptcha';

const instance = axios.create({
  baseURL: '/api',
  headers: {
    'X-Auth-Version': '2',
  },
});

function shouldShowCaptcha(url: string) {
  return instance.get<never, { should: boolean }>('/captcha/should-show', { params: { url } })
    .then(({ should }) => {
      return should;
    });
}

function setConfig(config: InternalAxiosRequestConfig<any>) {
  const account = useAccountStore();
  config.headers.setAuthorization(`Bearer ${unref(account.accessToken)}`, true);
}

instance.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('/captcha')) {
    return new Promise((resolve) => {
      const doBehavior = useCaptcha(geeTest, {
        product: 'bind',
        onSuccess(resp) {
          setConfig(config);
          return resolve({
            ...config,
            params: {
              ...config.params,
              ...resp,
            },
          });
        },
        captchaId: import.meta.env.VITE_GT_ID,
      });
      shouldShowCaptcha(config.url!)
        .then((show) => {
          if (!show) {
            setConfig(config);
            return resolve(config);
          }
          return doBehavior();
        });
    });
  }
  const account = useAccountStore();
  config.headers.setAuthorization(`Bearer ${unref(account.accessToken)}`, true);
  return config;
});
instance.interceptors.response.use(
  (resp) => {
    return resp.data;
  },
  (err) => {
    const account = useAccountStore();
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
  },
);

export const useAxios = () => ({ axios: instance });

export default instance;
