import { Request, Response } from 'express';
import {
  getRepository,
  Repository,
  Not,
  FindConditions,
  OrderByCondition,
  FindManyOptions,
} from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { bind } from 'decko';

import { User, IUser, UpdateableUserField } from './model';
import { Role, rolesArr } from './utils/Roles';
import { UserService } from './service';

// type orderType = [keyof IUser, 'ASC' | 'DESC'];

export class UserController {
  readonly repo: Repository<User> = getRepository(User);
  private readonly userService: UserService = new UserService();

  // Valid query parameters:
  // GET /users?role=(ADMIN/USER)
  // GET /users?take=(10)&skip=(0)
  // GET /users?orderBy=<userField>:<ASC||DESC>
  @bind
  public async listAll(req: Request, res: Response): Promise<void> {
    let where: FindConditions<User> = {};
    let order: OrderByCondition = {};
    let skip: number;
    let take: number;

    try {
      const role = <Role>(<string>req.query.role)?.toUpperCase();
      // Runtime validation of role parameter
      if (rolesArr.includes(role)) where = { ...where, role: role };

      let field: string = '';
      let ordering: string = '';
      if ((<string>req.query.orderBy)?.split(':').length >= 2)
        [field, ordering] = (<string>req.query.orderBy)?.split(':');
      if (
        field &&
        ordering &&
        <OrderByCondition>{ [field]: ordering.toUpperCase() } !== undefined
      ) {
        order = <OrderByCondition>{ [field]: ordering.toUpperCase() };
      }

      skip = parseInt(<string>req.query.skip) || 0;
      take = parseInt(<string>req.query.take) || 0;

      let options: FindManyOptions<User> = { select: ['id', 'email', 'role'] };

      if (Object.keys(where).length) options = { ...options, where };
      if (Object.keys(order).length) options = { ...options, order };
      if (skip) options = { ...options, skip };
      if (take) options = { ...options, take };

      const users: User[] = await this.userService.readAll(options);

      // let users: User[];
      // if (where !== {}) {
      //   users = await this.repo.find({
      //     select: ['id', 'email', 'role'],
      //     order,
      //     where,
      //     take,
      //     skip,
      //   });
      // } else {
      //   users = await this.repo.find({
      //     select: ['id', 'email', 'role'],
      //     order,
      //     take,
      //     skip,
      //   });
      // }

      res.status(200).send(users);
    } catch (e) {
      res.status(400).send(e);
    }
  }

  @bind
  public getOneById(req: Request, res: Response): void {
    const { id, email, role } = res.locals.retrievedUser as User;
    res.status(200).send({ id, email, role });
  }

  // GET /users/search?email=<email>
  @bind
  public async readUserByEmail(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email } = req.query;
      const user: User = await this.repo.findOneOrFail({
        where: { email },
        select: ['id', 'email', 'role'],
      });

      res.status(200).send(user);
    } catch (err) {
      res.status(400).send('No user with that email found');
    }
  }

  @bind
  public async newUser(req: Request, res: Response): Promise<void> {
    let { email, password, role } = req.body;
    let user: User = new User();
    user.email = email;
    user.password = password;
    user.role = role;

    // Model validations
    const errors: ValidationError[] = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
    }

    // Database validations
    try {
      await this.repo.save(user);
      delete user.password;
      res.status(201).send(user);
    } catch (e) {
      res.status(409).send('Email already in use');
    }
  }

  @bind
  public async editUser(req: Request, res: Response): Promise<void> {
    const user: User = res.locals.retrievedUser;

    const updates: string[] = Object.keys(req.body);

    // Validation 1: fields on req.body are valid User fields
    const isUserField = (update: string): update is keyof IUser => {
      return <keyof IUser>update !== undefined;
    };

    if (!updates.every((update) => isUserField(update))) {
      res.status(400).send({ error: 'Invalid updates' });
    }

    // Validation 2: fields on req.body are updateable User fields
    const isUpdateableUserField = (update: string): update is UpdateableUserField => {
      return <UpdateableUserField>update !== undefined;
    };

    if (!updates.every((update) => isUpdateableUserField(update))) {
      res.status(400).send({ error: 'Field cannot be updated' });
    }

    // Validation 3: requested updates pass model validations
    updates.forEach((update) => {
      // Type Guard
      if (isUpdateableUserField(update)) user[update] = req.body[update];
    });
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(405).send(errors);
    }

    // Validation 4: requested updates pass database validations (e.g. email uniqueness)
    try {
      await this.repo.save(user);
      delete user.password;
      res.status(204).send(user);
    } catch (e) {
      res.status(409).send('email already in use');
    }
  }

  @bind
  public async deleteUserById(req: Request, res: Response): Promise<void> {
    const user: User = res.locals.retrievedUser;

    try {
      await this.repo.remove(user);
      res.status(204).send('Removed user');
    } catch (error) {
      res.status(404).send('User not found');
    }
  }

  @bind
  public async deleteUsers(req: Request, res: Response): Promise<void> {
    try {
      await this.repo
        .createQueryBuilder()
        .delete()
        .where({ role: Not('ADMIN') })
        .execute();

      res.status(204).send('All users deleted');
    } catch (e) {
      res.status(401).send(e);
    }
  }
}
