import { Router } from 'express';
import { AuthController } from './controller';
import { checkJwt } from '../../middleware/checkJwt';

export class AuthRoutes {
  readonly router: Router = Router();
  readonly controller: AuthController = new AuthController();

  public constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    //Login route
    this.router.post('/login', this.controller.login);

    //Change my password
    this.router.post(
      '/change-password',
      [checkJwt],
      this.controller.changePassword
    );
  }
}
