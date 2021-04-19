import { Router } from 'express';
import { authorizeAndRetrieveUser } from '../../middleware/auth/authorizeAndRetrieveUser';
import { verifyUserRole } from '../../middleware/auth/verifyUserRole';
import { ProfileController } from './controller';

export class ProfileRoutes {
  readonly router: Router = Router();
  readonly controller: ProfileController = new ProfileController();

  public constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', [authorizeAndRetrieveUser, verifyUserRole(['ADMIN', 'USER'])], this.controller.getProfile);

    this.router.patch(
      '/update',
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN', 'USER'])],
      this.controller.updateProfile
    );

    this.router.patch(
      '/change-password',
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN', 'USER'])],
      this.controller.changePassword
    );

    this.router.delete(
      '/delete',
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN', 'USER'])],
      this.controller.deleteProfile
    );
  }
}
