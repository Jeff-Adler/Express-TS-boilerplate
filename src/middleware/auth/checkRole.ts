import { Request, Response, NextFunction } from 'express';

import { User } from '../../components/user/model';
import { Role } from '../../components/user/utils/Roles';

// TODO: Figure out why this nested function is used. Could it be smushed into one function: https://stackoverflow.com/questions/12737148/creating-a-expressjs-middleware-that-accepts-parameters
export const checkRole = (roles: Array<Role>) => {
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
