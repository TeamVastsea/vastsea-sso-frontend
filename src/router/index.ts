import type { RouteRecordRaw } from 'vue-router';
import Home from '@/pages/index.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { setupGuard } from './guards';

const AuthChildren: RouteRecordRaw[] = [
  {
    name: 'AuthError',
    path: 'error',
    component: () => import('@/pages/auth/error.vue'),
    meta: {
      auth: false,
      title: '出错了',
    },
  },
  {
    name: 'Login',
    path: 'login',
    component: () => import('@/pages/auth/login.vue'),
    meta: {
      auth: false,
      title: '登录',
    },
  },
  {
    name: 'Reg',
    path: 'register',
    component: () => import('@/pages/auth/register.vue'),
    meta: {
      auth: false,
      title: '注册',
    },
  },
  {
    name: 'forget-password',
    path: 'forget-password',
    component: () => import('@/pages/auth/forget-password.vue'),
    meta: {
      auth: false,
      title: '忘记密码',
    },
  },
  {
    name: 'update-password',
    path: 'update-password',
    component: () => import('@/pages/auth/update-password.vue'),
    meta: {
      auth: true,
      title: '修改密码',
    },
  },
];

export const dashboardHomeChildren: RouteRecordRaw[] = [
  {
    name: 'AccountManage',
    path: 'account',
    component: () => import('@/pages/dashboard/account/index.vue'),
    meta: {
      auth: true,
      title: '账号管理',
      system: ['ACCOUNT'],
      sideBar: true,
    },
  },
  {
    name: 'ClientManage',
    path: 'client',
    component: () => import('@/pages/dashboard/client/index.vue'),
    meta: {
      auth: true,
      title: '客户端管理',
      system: ['CLIENT'],
      sideBar: true,
    },
  },
  {
    name: 'PermissionManage',
    path: 'permission',
    component: () => import('@/pages/dashboard/permission/index.vue'),
    meta: {
      auth: true,
      title: '权限管理',
      system: ['PERMISSION'],
      sideBar: true,
    },
  },
  {
    name: 'RoleManage',
    path: 'role',
    component: () => import('@/pages/dashboard/role/index.vue'),
    meta: {
      auth: true,
      title: '角色管理',
      system: ['ROLE'],
      sideBar: true,
    },
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Home,
    redirect: `/auth/login?clientId=${import.meta.env.VITE_AUTH_SERVER_CLIENT_ID}`,
    children: [
      {
        name: 'redirect',
        path: 'redirect',
        component: () => import('@/pages/redirect.vue'),
      },
      {
        path: 'dashboard',
        children: [
          {
            name: 'DashBoardHome',
            path: 'home',
            component: () => import('@/pages/dashboard/home.vue'),
            meta: {
              auth: true,
            },
            children: dashboardHomeChildren,
          },
        ],
      },
      {
        path: 'auth',
        children: [...AuthChildren],
      },
    ],
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('@/pages/profile/index.vue'),
    meta: {
      auth: false,
      title: '个人空间',
    },
  },
  {
    name: 'Setting',
    path: '/setting',
    component: () => import('@/pages/setting/index.vue'),
    meta: {
      auth: true,
      title: '个人设置',
    },
    redirect: '/setting/profile',
    children: [
      {
        name: 'setting::profile',
        path: 'profile',
        component: () => import('@/pages/setting/profile.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)',
    redirect: `/auth/login?clientId=${import.meta.env.VITE_AUTH_SERVER_CLIENT_ID}`,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupGuard(router);

export default router;
