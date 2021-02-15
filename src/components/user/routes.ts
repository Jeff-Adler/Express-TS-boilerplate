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
    // this.router.post('/', this.controller.createUser);

    // this.router.get('/', this.controller.readUsers);

    // //TODO: Implement this route to find User by id. Need to setup middleware
    // this.router.get('/1', this.controller.readUserById);

    // this.router.delete('/6', this.controller.deleteUserById);

    /* Routes from https://medium.com/javascript-in-plain-english/creating-a-rest-api-with-jwt-authentication-and-role-based-authorization-using-typescript-fbfa3cab22a4 */
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
      this.controller.deleteUser
    );
  }
}
