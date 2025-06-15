import type { Router } from 'vue-router';
import { useAccount } from '../../composables/useAccount';
import { storeToRefs } from 'pinia';

export const authGuard = (router: Router) => {
  const authPath = ['/login', '/callback'];
  const whiteList = [...authPath];
  router.beforeEach((to, _, next) => {
    const { accessToken } = storeToRefs(useAccount());
    if (authPath.includes(to.path)) {
      if (!accessToken.value) {
        return next();
      }
      return next('/profile');
    }
    if (!whiteList.includes(to.path) && !accessToken.value) {
      return next('/login');
    }
    return next();
  });
};
