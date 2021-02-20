import { Request, Response } from 'express';
import { getRepository, Repository, Not } from 'typeorm';
import { validate } from 'class-validator';
import { bind } from 'decko';

import { User, IUser, UpdateableUserField } from './model';

//TODO: Consider moving logic to user/services
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
  public async getOneById(req: Request, res: Response) {
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
  public async newUser(req: Request, res: Response) {
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
      return;
    }

    //Try to save. If fails, the email is already in use
    try {
      console.log(user);
      await this.repo.save(user);
    } catch (e) {
      res.status(409).send('email already in use');
      return;
    }

    //If all ok, send 201 response
    res.status(201).send(user);
  }

  //TODO: Make this modular in abstract class to allow you to say what the permitted updates are
  @bind
  public async editUser(req: Request, res: Response) {
    /*
    Validations checked:
      1. are the fields being requested to update on req.body valid User fields
      2. are the fields being reuqested to update on req.body updateable User fields
      3. do the requested updates pass validations
      4. is the email available
    */

    const updates: string[] = Object.keys(req.body);

    //Type Guard
    const isUpdateableUserField = (
      update: string
    ): update is UpdateableUserField => {
      return <keyof IUser>update !== undefined;
    };

    const isValidOperation = updates.every((update) =>
      isUpdateableUserField(update.toLowerCase())
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    const id = req.params.id;
    let user: User;
    try {
      user = await this.repo.findOneOrFail(id);
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send('User not found');
      return;
    }

    updates.forEach((update) => {
      if (isUpdateableUserField(update)) user[update] = req.body[update];
    });
    //Validate the new values on model
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to safe, if fails, that means email already in use. Email is validated for uniqueness only before save to db
    try {
      await this.repo.save(user);
    } catch (e) {
      res.status(409).send('email already in use');
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res.status(204).send(user);
  }

  @bind
  public async deleteUserById(req: Request, res: Response) {
    const id = req.params.id;

    let user: User;
    try {
      user = await this.repo.findOneOrFail(id);
    } catch (error) {
      res.status(404).send('User not found');
      return;
    }
    this.repo.delete(id);

    res.status(204).send(user);
  }

  @bind
  public async deleteUsers(req: Request, res: Response) {
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
