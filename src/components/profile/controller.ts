import { Request, Response } from 'express';
import { getRepository, Repository, getConnection } from 'typeorm';
import { User, IUser } from '../user/model';
import { bind } from 'decko';
import { validate, ValidationError } from 'class-validator';

// res.locals.currentUser is declared in isAuthorized
export class ProfileController {
  readonly repo: Repository<User> = getConnection(process.env.CONNECTION_TYPE).getRepository(User);

  @bind
  public getProfile(req: Request, res: Response): Response {
    const { id, email, role } = res.locals.currentUser as User;

    try {
      return res.status(200).send({ id, email, role });
    } catch (error) {
      return res.status(404).send('Profile not found');
    }
  }

  @bind
  public async updateProfile(req: Request, res: Response): Promise<Response> {
    const user: User = res.locals.currentUser;

    const updates: string[] = Object.keys(req.body);

    // Validation 1: fields on req.body are valid User fields
    const isUserField = (update: string): update is keyof IUser => {
      return <keyof IUser>update !== undefined;
    };

    if (!updates.every((update) => isUserField(update))) {
      return res.status(400).send({ error: 'Invalid updates' });
    }

    // Validation 2: fields on req.body are updateable User fields: for this route, only 'email' can be updated
    const isUpdateableUserField = (update: string): update is 'email' => {
      return <'email'>update !== undefined;
    };

    if (!updates.every((update) => isUpdateableUserField(update))) {
      return res.status(400).send({ error: 'Field cannot be updated' });
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
      await this.repo.save(user);
      const userObj: User = await this.repo.findOneOrFail(user.id, {
        select: ['id', 'email', 'role'],
      });
      return res.status(204).send(userObj);
    } catch (e) {
      return res.status(409).send('email already in use');
    }
  }

  @bind
  public async changePassword(req: Request, res: Response): Promise<Response> {
    const user: User = res.locals.currentUser;

    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      return res.status(400).send();
    }

    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) res.status(401).send();

    user.password = newPassword;

    const errors: ValidationError[] = await validate(user);
    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    try {
      await this.repo.save(user);
      return res.status(204).send('Password changed');
    } catch (e) {
      return res.status(401).send(e);
    }
  }

  @bind
  public async deleteProfile(req: Request, res: Response): Promise<Response> {
    const user: User = res.locals.currentUser;

    try {
      await this.repo.delete(user);
      return res.status(200).send('Account deleted');
    } catch (e) {
      return res.status(401).send(e);
    }
  }
}
