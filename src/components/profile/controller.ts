import { Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import { User } from '../user/model';
import { bind } from 'decko';

export class ProfileController {
  readonly repo: Repository<User> = getRepository(User);

  @bind
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
    const id = res.locals.jwtPayload.userId;

    try {
      const user = await this.repo.findOneOrFail(id, {
        select: ['id', 'email', 'role'],
      });
      res.send(user);
    } catch (error) {
      res.status(404).send('Profile not found');
    }
  }
}
