import router from "@/router";
import TinyVue from "@opentiny/vue";
import { createPinia } from "pinia";
import persistedPlugin from "pinia-plugin-persistedstate";
import { createApp } from "vue";
import App from "./App.vue";
import "virtual:uno.css";
import "@opentiny/vue-theme/dark-theme-index.css";

const pinia = createPinia();
pinia.use(persistedPlugin);
const app = createApp(App);
app.use(router);
app.use(TinyVue);
app.use(pinia);
app.mount("#app");
