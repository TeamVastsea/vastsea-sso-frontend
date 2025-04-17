import router from '@/router'
import TinyVue from '@opentiny/vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(TinyVue)
app.mount('#app')
