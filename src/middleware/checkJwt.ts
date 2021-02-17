import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  let jwtPayload;

  try {
    const token: string = req.header('Authorization').replace('Bearer ', '');
    jwtPayload = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
    //res.locals is the conventional way to add fields to response in intermediary middleware
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    res.status(401).send();
    return;
  }

  // Send a new token on every request
  const { userId, email } = jwtPayload;
  const newToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  res.setHeader('token', newToken);

  next();
};
