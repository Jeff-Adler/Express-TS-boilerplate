import { Request, Response, NextFunction } from 'express';
import { getRepository, Repository } from 'typeorm';

import { User } from '../components/user/model';
import { Role } from '../components/user/utils/Roles';

// checkRole depends on checkJwt to extract user from JWT
export const checkRole = (roles: Array<Role>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = res.locals.jwtPayload.userId;

    const userRepository: Repository<User> = getRepository(User);

    try {
      const user: User = await userRepository.findOneOrFail(id);
      if (roles.includes(user.role)) next();
      else res.status(401).send();
    } catch (id) {
      res.status(401).send();
    }
  };
};
