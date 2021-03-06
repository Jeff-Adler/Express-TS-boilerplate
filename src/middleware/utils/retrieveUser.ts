import { Request, Response, NextFunction } from 'express';
import { User } from '../../components/user/model';
import { getRepository, getConnection } from 'typeorm';

export const retrieveUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = req.params.id;

  try {
    res.locals.retrievedUser = (await getConnection(process.env.CONNECTION_TYPE)
      .getRepository(User)
      .findOneOrFail(id)) as User;
    next();
  } catch (error) {
    res.status(404).send('User not found');
  }
};
