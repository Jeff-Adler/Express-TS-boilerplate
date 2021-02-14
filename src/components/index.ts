import { Router } from 'express';
import { UserRoutes } from './user/routes';

export function initApiRoutes(router: Router): void {
  // Test route
  router.get('/', () => console.log('Hello World'));

  // Declare routes available to any request containing `users`
  router.use(`/users`, new UserRoutes().router);
}
