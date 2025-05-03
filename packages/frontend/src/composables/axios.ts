import { useAccountStore } from "@/store";
import { Modal } from "@opentiny/vue";
import axios from "axios";
import { unref } from "vue";

const instance = axios.create({
  baseURL: "/api",
});

instance.interceptors.request.use((config) => {
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
      status: "error",
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
