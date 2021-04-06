import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository, getConnection } from 'typeorm';
import { User } from '../../components/user/model';

export const isAuthorized = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    if (!req.header('Authorization')) throw new Error();
    // Verify JWT
    const token: string = req.header('Authorization')!.replace('Bearer ', '');
    console.log('passed 1.5 validation');

    const decoded = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
    console.log('passed second validation');

    // Save currentUser to response object
    const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail(decoded.id);
    res.locals.currentUser = user;
    console.log('passed third validation');

    // Send new token on response
    const { id, email } = user;
    const newToken = jwt.sign({ id, email }, process.env.JWT_SECRET as jwt.Secret, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.setHeader('token', newToken);
    console.log('passed fourth validation');

    next();
  } catch (error) {
    return res.status(401).send('Authentication Failed');
  }
};
