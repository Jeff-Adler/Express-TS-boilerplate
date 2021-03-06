import { Request, Response } from 'express';
import { getRepository, Repository, Not, FindManyOptions, getConnection } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { bind } from 'decko';

import { User, IUser, UpdateableUserField, UpdateableUserFields } from './model';
import { UserService } from './service';

export class UserController {
  readonly repo: Repository<User> = getConnection(process.env.CONNECTION_TYPE).getRepository(User);
  private readonly userService: UserService = new UserService();

  /**
   * Retrieve users from db
   *
   * Valid query parameters:
   * ?role=(ADMIN/USER)
   * ?orderBy=<userField>:<ASC|DESC>
   * ?skip=(0)
   * ?take=(10)
   */
  @bind
  public async listAll(req: Request, res: Response): Promise<Response> {
    try {
      const options: FindManyOptions<User> = this.userService.handleQueryParams(req);

      const users: User[] = await this.userService.readAll(options);

      return res.status(200).send(users);
    } catch (e) {
      return res.status(400).send(e);
    }
  }

  @bind
  public getOneById(req: Request, res: Response): void {
    const { id, email, role } = res.locals.retrievedUser as User;
    res.status(200).send({ id, email, role });
  }

  /**
   * Retrieve user from db by email
   *
   * Valid query parameters:
   * ?email=<email>
   */
  @bind
  public async readUserByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.query;
      const user: User = await this.repo.findOneOrFail({
        where: { email },
        select: ['id', 'email', 'role'],
      });

      return res.status(200).send(user);
    } catch (err) {
      return res.status(400).send('Invalid search');
    }
  }

  @bind
  public async newUser(req: Request, res: Response): Promise<Response> {
    let { email, password, role } = req.body;
    let user: User = new User();
    user.email = email;
    user.password = password;
    user.role = role;

    // Model validations
    const errors: ValidationError[] = await validate(user);
    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    // Database validations
    try {
      await this.repo.save(user);
      const userObj: User = await this.repo.findOneOrFail(user.id, {
        select: ['id', 'email', 'role'],
      });
      return res.status(201).send(userObj);
    } catch (e) {
      return res.status(409).send('Email already in use');
    }
  }

  @bind
  public async editUser(req: Request, res: Response): Promise<Response> {
    const user: User = res.locals.retrievedUser;

    const updates: string[] = Object.keys(req.body);

    // Validation 1: fields on req.body are valid User fields
    const isUserField = (update: string): update is keyof IUser => {
      return <keyof IUser>update !== undefined;
    };

    if (!updates.every((update) => isUserField(update))) {
      return res.status(400).send({ error: 'Invalid updates' });
    }

    // Validation 2: fields on req.body are updateable User fields
    const isUpdateableUserField = (update: string): update is UpdateableUserField => {
      return UpdateableUserFields.includes(<UpdateableUserField>update);
    };

    if (!updates.every((update) => isUpdateableUserField(update))) {
      return res.status(400).send(`Field cannot be updated`);
    }

    // Validation 3: requested updates pass model validations
    updates.forEach((update) => {
      // Type Guard
      if (isUpdateableUserField(update)) user[update] = req.body[update];
    });
    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(405).send(errors);
    }

    // Validation 4: requested updates pass database validations (e.g. email uniqueness)
    try {
      // Need to bypass restruction on email uniqueness for patching of other fields.
      await this.repo.save(user);
      const userObj: User = await this.repo.findOneOrFail(user.id, {
        select: ['id', 'email', 'role'],
      });
      return res.status(201).send(userObj);
    } catch (e) {
      return res.status(409).send('email already in use');
    }
  }

  @bind
  public async deleteUserById(req: Request, res: Response): Promise<Response> {
    const user: User = res.locals.retrievedUser;

    try {
      await this.repo.remove(user);
      return res.status(201).send(`Removed user ${user.email}`);
    } catch (error) {
      return res.status(404).send('User not found');
    }
  }

  @bind
  public async deleteUsers(req: Request, res: Response): Promise<Response> {
    try {
      await this.repo
        .createQueryBuilder()
        .delete()
        .where({ role: Not('ADMIN') })
        .execute();

      return res.status(204).send('All users deleted');
    } catch (e) {
      return res.status(401).send(e);
    }
  }
}
