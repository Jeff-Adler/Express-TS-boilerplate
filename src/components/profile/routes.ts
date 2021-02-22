import { Router } from 'express';
import { checkJwt } from '../../middleware/auth/checkJwt';
import { checkRole } from '../../middleware/auth/checkRole';
import { ProfileController } from './controller';

export class ProfileRoutes {
  readonly router: Router = Router();
  readonly controller: ProfileController = new ProfileController();

  public constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', [checkJwt, checkRole(['ADMIN', 'USER'])], this.controller.getProfile);

    this.router.patch(
      '/update',
      [checkJwt, checkRole(['ADMIN', 'USER'])],
      this.controller.updateProfile
    );

    this.router.delete(
      '/delete',
      [checkJwt, checkRole(['ADMIN', 'USER'])],
      this.controller.deleteProfile
    );
  }
}
