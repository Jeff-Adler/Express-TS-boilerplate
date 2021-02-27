import { Request, Response } from 'express';
import { getRepository, Repository, Not } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { bind } from 'decko';

import { User, IUser, UpdateableUserField } from './model';
import { Role, rolesArr } from './utils/Roles';

export class UserController {
  readonly repo: Repository<User> = getRepository(User);

  //TODO: Input query parameters
  // GET /users?role=(admin/user)
  // GET /users?take=(10)&skip=(0)
  // GET /users?sortBy=id/role/createdAt:(asc/desc)
  @bind
  public async listAll(req: Request, res: Response): Promise<void> {
    // TODO: Figure out how to use query params with TypeORM
    // sortBy: user find({ order: {field: "ASC"/"DESC"}})

    // // // filter parameter
    // let match: { role: string };
    // // // sort parameter
    // const sort = {};

    // if (req.query.role) {
    //   match.role = req.query.role as string;
    // }

    // if (req.query.sortBy) {
    //   const parts = req.query.sortBy.split(':');
    //   // parts[0] = field to sort by
    //   // parts[1] = asc/desc
    //   // sets sort value to -1 if query parameter is set to desc, 1 if asc/anything else
    //   sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    // }

    // try {
    //   await req.user.populate({
    //       // path specifies field on User for which we want to get data
    //       path: 'tasks',
    //       // specifies matching parameter for path. Shorthand notation for match: {}
    //       match,
    //       options: {
    //           //Mongoose knows to ignore this field if it's not passed a number, so default limit will essentially be 0
    //           limit: parseInt(req.query.limit),
    //           skip: parseInt(req.query.skip),
    //           //Shorthand notation for sort : {} using sort variabe from above
    //           sort
    //       }
    //   }).execPopulate()

    // // example:
    // await this.repo.find({
    //   select: ['id', 'email', 'role'],
    //   relations: ['profile', 'photos', 'videos'],
    //   order: {
    //     email: 'ASC',
    //     id: 'DESC',
    //   },
    //   skip: 5,
    //   take: 10,
    //   cache: true,
    // });

    // const limit: string = req.query.limit as string;

    // const isRole = (roleParam: string): roleParam is Role => {
    //   let role = roleParam as Role;
    //   console.log('Typeof: ' + typeof role);
    //   return <Role>roleParam !== undefined;
    // };

    let role: Role;
    if (rolesArr.includes(<Role>(<string>req.query.role))) role = <Role>req.query.role;

    const skip: number = parseInt(<string>req.query.skip) || 0;
    const take: number = parseInt(<string>req.query.take) || 0;

    const users = await this.repo.find({
      select: ['id', 'email', 'role'],
      // where: { role },
      take,
      skip,
    });

    res.send(users);
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
