import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import {authGuard} from './guard/auth';

export const routes: RouteRecordRaw[] = [
  {
    name: 'Home',
    path: '/',
    component: () => import('../pages/home.vue'),
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('../pages/login.vue'),
  },
  {
    name: 'Callback',
    path: '/callback',
    component: () => import('../pages/callback.vue'),
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('../pages/profile.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

authGuard(router);

export default router;