import { Request, Response, NextFunction } from 'express';

export const validateQueryParams = (req: Request, res: Response, next: NextFunction): void => {
  if (Object.keys(req.query).length) {
    for (const key in req.query) {
      if (typeof req.query[key] !== 'string') {
        res.status(400).send('Request query is invalid');
        return;
      }
    }
  }
  next();
};
