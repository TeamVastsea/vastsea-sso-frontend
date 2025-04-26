import type { Router } from 'vue-router';
import authGuard from './auth-guard';
import autoTitle from './auto-title';

const guards = [authGuard, autoTitle];

export function setupGuard(router: Router) {
  guards.forEach(guard => guard(router));
}
