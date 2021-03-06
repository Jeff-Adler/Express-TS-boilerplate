import { Router } from 'express';
import { AuthController } from './controller';
import { isAuthorized } from '../../middleware/auth/isAuthorized';

export class AuthRoutes {
  readonly router: Router = Router();
  readonly controller: AuthController = new AuthController();

  public constructor() {
    console.log('auth routes constructor');
    this.initRoutes();
    console.log('auth routes post');
  }

  private initRoutes(): void {
    console.log('auth routes login');
    this.router.post('/login', this.controller.login);
  }
}
