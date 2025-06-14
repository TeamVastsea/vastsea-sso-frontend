import { createApp } from 'vue';
import App from './App.vue';
import 'virtual:uno.css';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia();
const app = createApp(App);

pinia.use(piniaPluginPersistedstate);

app.use(router);
app.use(pinia);
app.mount('#app');
