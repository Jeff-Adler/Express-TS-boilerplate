import { Request, Response, NextFunction } from 'express';

export class HttpException extends Error {
  public status: number;
  public message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export const handleHttpException = (req: Request, res: Response, next: NextFunction) => {
  const httpException = new HttpException(404, 'Not Found');
  next(httpException);
};
