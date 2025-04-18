import type { Router } from 'vue-router';
import authGuard from './auth-guard';

const guards = [authGuard];

export function setupGuard(router: Router) {
  guards.forEach(guard => guard(router));
}
