import { Request, Response, NextFunction } from 'express';

import { User } from '../../components/user/model';
import { Role } from '../../components/user/utils/Roles';

export const hasPermission = (roles: Array<Role>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user: User = res.locals.currentUser;

    try {
      if (roles.includes(user.role)) next();
      else res.status(401).send();
    } catch (id) {
      res.status(401).send();
    }
  };
};