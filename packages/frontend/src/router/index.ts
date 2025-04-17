import type { RouteRecordRaw } from 'vue-router'
import Home from '@/pages/index.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
  },
]
export default createRouter({
  history: createWebHistory(),
  routes,
})
