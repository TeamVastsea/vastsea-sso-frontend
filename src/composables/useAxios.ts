import { Axios } from 'axios';

const axios = new Axios();

axios.interceptors.response.use((value) => {
  return JSON.parse(value.data);
});

export const useAxios = () => {
  return axios;
};
