import { Router } from 'express';
import { AuthController } from './controller';
import { authorizeAndRetrieveUser } from '../../middleware/auth/authorizeAndRetrieveUser';

export class AuthRoutes {
  readonly router: Router = Router();
  readonly controller: AuthController = new AuthController();

  public constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/login', this.controller.login);
  }

  //TODO: Add logout!
}
