import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository, getConnection } from 'typeorm';
import { User } from '../../components/user/model';

//TODO: Think about renaming the function and breaking the up into separate functions
export const authorizeAndRetrieveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    if (!req.header('Authorization')) throw new Error();
    // Verify JWT
    const token: string = req.header('Authorization')!.replace('Bearer ', '');
    const decoded = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);

    // Save currentUser to response object
    const user: User = await getConnection(process.env.CONNECTION_TYPE).getRepository(User).findOneOrFail(decoded.id);
    res.locals.currentUser = user;

    // Send new token on response
    const { id, email } = user;
    const newToken = jwt.sign({ id, email }, process.env.JWT_SECRET as jwt.Secret, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.setHeader('token', newToken);

    next();
  } catch (error) {
    return res.status(401).send('Authentication Failed');
  }
};
