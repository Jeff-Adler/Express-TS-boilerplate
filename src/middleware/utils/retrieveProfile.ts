import { Request, Response, NextFunction } from 'express';
import { getRepository, getConnection } from 'typeorm';
import { User } from '../../components/user/model';

export const retrieveProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user: User = await getConnection(process.env.CONNECTION_TYPE)
      .getRepository(User)
      .findOneOrFail(res.locals.id);
    res.locals.currentUser = user;
  } catch (e) {
    res.send;
  }

  next();
};
