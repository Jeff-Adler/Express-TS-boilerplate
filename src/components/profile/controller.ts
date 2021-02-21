import { Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import { User, IUser, UpdateableUserField } from '../user/model';
import { bind } from 'decko';
import { validate } from 'class-validator';

// Since user is retrieved from res.locals, these methods are only accessible to the user who is logged in
export class ProfileController {
  readonly repo: Repository<User> = getRepository(User);

  @bind
  //TODO: just get user from res.locals instead
  public async getProfile(req: Request, res: Response): Promise<void> {
    const id = res.locals.user.id;

    try {
      const user = await this.repo.findOneOrFail(id, {
        select: ['id', 'email', 'role'],
      });
      res.send(user);
    } catch (error) {
      res.status(404).send('Profile not found');
    }
  }

  @bind
  public async updateProfile(req: Request, res: Response): Promise<void> {
    const user: User = res.locals.user;

    const updates: string[] = Object.keys(req.body);

    // Validation 1: fields on req.body are valid User fields
    const isUserField = (update: string): update is keyof IUser => {
      return <keyof IUser>update !== undefined;
    };

    if (!updates.every((update) => isUserField(update))) {
      res.status(400).send({ error: 'Invalid updates' });
    }

    // Validation 2: fields on req.body are updateable User fields: for this route, only 'email' can be updated
    const isUpdateableUserField = (update: string): update is 'email' => {
      return <'email'>update !== undefined;
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
}
