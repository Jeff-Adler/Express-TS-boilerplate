import { Router } from 'express';
import { UserController } from './controller';
import { checkJwt } from '../../middleware/checkJwt';
import { checkRole } from '../../middleware/checkRole';

export class UserRoutes {
  readonly router: Router = Router();
  readonly controller: UserController = new UserController();

  public constructor() {
    this.initRoutes();
  }

  private initRoutes(): void {
    //Get all users
    this.router.get(
      '/',
      [checkJwt, checkRole(['ADMIN'])],
      this.controller.listAll
    );

    // Get one user
    this.router.get(
      // regex expression ensures that /:id is of type number
      '/:id([0-9]+)',
      [checkJwt, checkRole(['ADMIN'])],
      this.controller.getOneById
    );

    //Create a new user
    this.router.post(
      '/',
      [checkJwt, checkRole(['ADMIN'])],
      this.controller.newUser
    );

    //Edit one user
    this.router.patch(
      '/:id([0-9]+)',
      [checkJwt, checkRole(['ADMIN'])],
      this.controller.editUser
    );

    //Delete one user
    this.router.delete(
      '/:id([0-9]+)',
      [checkJwt, checkRole(['ADMIN'])],
      this.controller.deleteUserById
    );
  }
}
