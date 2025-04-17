import router from '@/router';
import TinyVue from '@opentiny/vue';
import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:uno.css';
import { createPinia } from 'pinia';
import persistedPlugin from 'pinia-plugin-persistedstate';

const pinia=createPinia();
pinia.use(persistedPlugin);
const app = createApp(App);
app.use(router);
app.use(TinyVue);
app.use(pinia);
app.mount('#app');
