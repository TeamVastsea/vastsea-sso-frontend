import axios, { Axios } from 'axios';
import SuperJSON from 'superjson';


const instance = axios.create({
  baseURL: '/api',
  headers: {
    'x-meta': true
  }
})

instance.interceptors.request.use((config) => {
  console.log(config)
  return config;
});
instance.interceptors.response.use((resp) => {
  return SuperJSON.deserialize(resp.data);
});

export default instance;
