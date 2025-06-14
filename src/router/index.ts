import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

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

export default createRouter({
  history: createWebHistory(),
  routes,
});
