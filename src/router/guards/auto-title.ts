import type { Router } from 'vue-router';
import { useTitle } from '@vueuse/core';

export default (router: Router) => {
  router.beforeEach(async (to, _, next) => {
    const { title } = to.meta;
    useTitle(title);
    next();
  });
};
