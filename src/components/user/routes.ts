import { Router } from 'express';
import { UserController } from './controller';

export class UserRoutes {
  readonly router: Router = Router();
  readonly controller: UserController = new UserController();

  public constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.get('/', this.controller.readUsers);

    //TODO: Implement this route to find User by id. Need to setup middleware
    this.router.get('/1', this.controller.readUserById);

    this.router.delete('/6', this.controller.deleteUserById);
  }
}
