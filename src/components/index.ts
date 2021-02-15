import { Router } from 'express';
import { AuthRoutes } from './auth/routes';
import { UserRoutes } from './user/routes';

export function initApiRoutes(router: Router): void {
  // Test route
  router.get('/', () => console.log('Hello World'));

  router.use(`/auth`, new AuthRoutes().router);

  // Declare routes available to any request containing `users`
  router.use(`/users`, new UserRoutes().router);
}
