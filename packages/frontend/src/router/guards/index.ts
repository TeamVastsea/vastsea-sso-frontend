import type { Router } from 'vue-router';
import authGuard from './auth-guard';
import autoTitle from './auto-title';
import routesGuard from './routes-guard';

const guards = [authGuard, autoTitle, routesGuard];

export function setupGuard(router: Router) {
  guards.forEach(guard => guard(router));
}
