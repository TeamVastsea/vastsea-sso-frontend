import type { Router } from 'vue-router';
import { useAccountStore } from '@/store';
import { nextTick } from 'vue';

export default (router: Router) => {
  router.beforeEach(async (_to, _from, next) => {
    await nextTick();
    const routes = router.getRoutes();
    const accounts = useAccountStore();
    if (accounts.permissionList.includes('*')) {
      return next();
    }
    for (const route of routes) {
      const system = route.meta.system;
      if (!system || !system.length) {
        continue;
      }
      const canVisit
        = accounts.permissionList.length > 0
          && accounts.permissionList.every((permission) => {
            return system.some(sys => permission.toUpperCase().startsWith(sys));
          });
      if (!canVisit && route.name && router.hasRoute(route.name)) {
        router.removeRoute(route.name);
      }
    }
    next();
  });
};
