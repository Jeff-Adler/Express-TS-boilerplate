import { Router } from 'express';
import { isAuthorized } from '../../middleware/auth/isAuthorized';
import { hasPermission } from '../../middleware/auth/hasPermission';
import { UserController } from './controller';
import { retrieveUser } from '../../middleware/utils/retrieveUser';
import { validateQueryParams } from '../../middleware/validations/validateQueryParams';

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
      [isAuthorized, hasPermission(['ADMIN']), validateQueryParams],
      this.controller.listAll
    );

    // Get one user by id
    this.router.get(
      '/:id([0-9]+)',
      [isAuthorized, hasPermission(['ADMIN']), retrieveUser],
      this.controller.getOneById
    );

    // Get one user by email
    this.router.get(
      '/search',
      [isAuthorized, hasPermission(['ADMIN'])],
      this.controller.readUserByEmail
    );

    //Create a new user
    this.router.post('/', [isAuthorized, hasPermission(['ADMIN'])], this.controller.newUser);

    //Edit one user (email or role)
    this.router.patch(
      '/:id([0-9]+)',
      [isAuthorized, hasPermission(['ADMIN']), retrieveUser],
      this.controller.editUser
    );

    //Delete one user
    this.router.delete(
      '/:id([0-9]+)',
      [isAuthorized, hasPermission(['ADMIN']), retrieveUser],
      this.controller.deleteUserById
    );

    //Delete all non-admin users
    this.router.delete('/', [isAuthorized, hasPermission(['ADMIN'])], this.controller.deleteUsers);
  }
}
