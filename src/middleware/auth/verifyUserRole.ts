import { Request, Response, NextFunction } from 'express';

import { User } from '../../components/user/model';
import { Role } from '../../components/user/utils/Roles';

export const verifyUserRole = (roles: Array<Role>) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const user: User = res.locals.currentUser;

    try {
      if (roles.includes(user.role)) next();
      else return res.status(401).send('User does not have permission to access this endpoint');
    } catch (id) {
      return res.status(401).send('User does not have permission to access this endpoint');
    }
  };
};
