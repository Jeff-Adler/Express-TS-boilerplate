import { Request, Response } from 'express';
import { getRepository, Repository, Not } from 'typeorm';
import { validate } from 'class-validator';
import { bind } from 'decko';

import { User, IUser, UpdateableUserField } from './model';

export class UserController {
  readonly repo: Repository<User> = getRepository(User);

  @bind
  public async listAll(req: Request, res: Response): Promise<void> {
    const users = await this.repo.find({
      select: ['id', 'email', 'role'], //We dont want to send the passwords on response
    });

    res.send(users);
  }

  @bind
  public async getOneById(req: Request, res: Response): Promise<void> {
    //Get the ID from the url
    const id: number = parseInt(req.params.id);

    //Get the user from database
    try {
      const user = await this.repo.findOneOrFail(id, {
        select: ['id', 'email', 'role'], //We dont want to send the password on response
      });
      res.send(user);
    } catch (error) {
      res.status(404).send('User not found');
    }
  }

  @bind
  public async newUser(req: Request, res: Response): Promise<void> {
    //Get parameters from the body
    let { email, password, role } = req.body;
    let user = new User();
    user.email = email;
    user.password = password;
    user.role = role;

    //Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
    }

    //Try to save. If fails, the email is already in use
    try {
      console.log(user);
      await this.repo.save(user);
    } catch (e) {
      res.status(409).send('email already in use');
    }

    //If all ok, send 201 response
    res.status(201).send(user);
  }

  @bind
  public async editUser(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    let user: User;
    try {
      user = await this.repo.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }

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
    } catch (e) {
      res.status(409).send('email already in use');
    }

    res.status(204).send(user);
  }

  @bind
  public async deleteUserById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    let user: User;
    try {
      user = await this.repo.findOneOrFail(id);
      this.repo.delete(id);
      res.status(204).send(user);
    } catch (error) {
      res.status(404).send('User not found');
    }
  }

  @bind
  public async deleteUsers(req: Request, res: Response): Promise<void> {
    try {
      this.repo
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
