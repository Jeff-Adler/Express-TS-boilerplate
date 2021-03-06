import { Request, Response, Router, NextFunction, ErrorRequestHandler } from 'express';
import { AuthRoutes } from './auth/routes';
import { ProfileRoutes } from './profile/routes';
import { UserRoutes } from './user/routes';
import { handleHttpException, HttpException } from '../middleware/exceptions/HttpException';

export function initApiRoutes(router: Router): void {
  console.log('beginning of init routes');

  // Test route
  router.get('/', (req: Request, res: Response) => res.status(200).send('Server is running!'));

  router.use(`/auth`, new AuthRoutes().router);
  router.use(`/profile`, new ProfileRoutes().router);
  router.use(`/users`, new UserRoutes().router);

  //Consider moving catch-all route to independent location
  router.use(
    [handleHttpException],
    (err: HttpException, req: Request, res: Response, next: NextFunction): Response | void => {
      if (err.status === 404) {
        return res.status(400).send('404');
      }

      if (err.status === 500) {
        return res.status(500).send('500');
      }

      return;
    }
  );
}
