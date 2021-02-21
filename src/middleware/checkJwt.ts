import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../components/user/model';

export const checkJwt = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.header) throw new Error();

    const token: string = req.header('Authorization')!.replace('Bearer ', '');
    const decoded = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
    const user = await getRepository(User).findOneOrFail(decoded.id);
    res.locals.user = user;

    // Send a new token on every request
    const { id, email } = user;
    const newToken = jwt.sign({ id, email }, process.env.JWT_SECRET as jwt.Secret, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.setHeader('token', newToken);

    next();
  } catch (error) {
    res.status(401).send('Authentication Failed');
    // TODO: Do we need this return statement?
    return;
  }
};
