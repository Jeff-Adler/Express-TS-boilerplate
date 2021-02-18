import { Router } from 'express';
import { AuthRoutes } from './auth/routes';
import { ProfileRoutes } from './profile/routes';
import { UserRoutes } from './user/routes';

export function initApiRoutes(router: Router): void {
  // Test route
  router.get('/', (req, res) => res.status(200).send('Hello World'));

  router.use(`/auth`, new AuthRoutes().router);
  router.use(`/profile`, new ProfileRoutes().router);
  router.use(`/users`, new UserRoutes().router);
}
