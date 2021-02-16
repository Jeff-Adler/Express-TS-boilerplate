import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the header
  const token: string = req.header('Authorization').replace('Bearer ', '');
  let jwtPayload;

  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, process.env.JWT_SECRET as jwt.Secret);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }

  //We send a new token on every request
  const { userId, email } = jwtPayload;
  const newToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET as jwt.Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  res.setHeader('token', newToken);

  //Call the next middleware or controller
  next();
};
