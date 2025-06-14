import type { Router } from 'vue-router';
import { useAccount } from '../../composables/useAccount';
import { storeToRefs } from 'pinia';

export const authGuard = (router: Router) => {
  const path = ['/profile'];
  router.beforeEach((to, _, next) => {
    const { accessToken } = storeToRefs(useAccount());
    if (
      accessToken && (path.includes('callback') || path.includes('login'))
    ) {
      return next('/profile')
    }
    if (
      path.some(path => to.path.includes(path)) && !accessToken
    ) {
      return next('/login');
    }
    return next(to);
  });
};
