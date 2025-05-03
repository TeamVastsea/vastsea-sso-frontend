import type { Router } from 'vue-router';
import { useAccountStore } from '@/store';

export default (router: Router) => {
  router.beforeEach(async (to, _, next) => {
    if (!to.meta.auth) {
      next();
      return;
    }
    const accountStore = useAccountStore();
    if (!accountStore.accessToken) {
      next({
        name: 'Login',
        replace: true,
        query: { clientId: __AUTH_SERVER__ },
      });
      return;
    }
    if (!accountStore.permissionList.length) {
      return accountStore.fetchPermissionList().then(() => next());
    }
    next();
  });
};
