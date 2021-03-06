import { Router } from 'express';
import { isAuthorized } from '../../middleware/auth/isAuthorized';
import { hasPermission } from '../../middleware/auth/hasPermission';
import { ProfileController } from './controller';

export class ProfileRoutes {
  readonly router: Router = Router();
  readonly controller: ProfileController = new ProfileController();

  public constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', [isAuthorized, hasPermission(['ADMIN', 'USER'])], this.controller.getProfile);

    this.router.patch('/update', [isAuthorized, hasPermission(['ADMIN', 'USER'])], this.controller.updateProfile);

    this.router.patch(
      '/change-password',
      [isAuthorized, hasPermission(['ADMIN', 'USER'])],
      this.controller.changePassword
    );

    this.router.delete('/delete', [isAuthorized, hasPermission(['ADMIN', 'USER'])], this.controller.deleteProfile);
  }
}
