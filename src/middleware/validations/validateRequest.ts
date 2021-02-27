import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] !== 'string') res.status(400).send('Request query is invalid');
    }
  }
  next();
};
