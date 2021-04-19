import { Router } from 'express';
import { authorizeAndRetrieveUser } from '../../middleware/auth/authorizeAndRetrieveUser';
import { verifyUserRole } from '../../middleware/auth/verifyUserRole';
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
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN']), validateQueryParams],
      this.controller.listAll
    );

    // Get one user by id
    this.router.get(
      '/:id([0-9]+)',
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN']), retrieveUser],
      this.controller.getOneById
    );

    // Get one user by email
    this.router.get(
      '/search',
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN']), validateQueryParams],
      this.controller.readUserByEmail
    );

    //Create a new user
    this.router.post('/', [authorizeAndRetrieveUser, verifyUserRole(['ADMIN'])], this.controller.newUser);

    //Edit one user (email or role)
    this.router.patch(
      '/:id([0-9]+)',
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN']), retrieveUser],
      this.controller.editUser
    );

    //Delete one user
    this.router.delete(
      '/:id([0-9]+)',
      [authorizeAndRetrieveUser, verifyUserRole(['ADMIN']), retrieveUser],
      this.controller.deleteUserById
    );

    //Delete all non-admin users
    this.router.delete('/', [authorizeAndRetrieveUser, verifyUserRole(['ADMIN'])], this.controller.deleteUsers);
  }
}
