import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../../components/user/model';

export const retrieveProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user: User = await getRepository(User).findOneOrFail(res.locals.id);
    res.locals.currentUser = user;
  } catch (e) {
    res.send;
  }

  next();
};