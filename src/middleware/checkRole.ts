import { Request, Response, NextFunction } from 'express';
import { getRepository, Repository } from 'typeorm';

import { User } from '../components/user/model';

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous middleware
    const id = res.locals.jwtPayload.userId;

    //Get user role from the database
    const userRepository: Repository<User> = getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
      //Check if array of authorized roles includes the user's role
      if (roles.indexOf(user.role) > -1) next();
      else res.status(401).send();
    } catch (id) {
      res.status(401).send();
    }
  };
};