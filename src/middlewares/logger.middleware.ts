import { NextFunction, Request, Response } from 'express';
import moment from 'moment';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const dateFormat: string = 'DD-MM-YYYY HH:mm:ss.SSS';

  const startTime: string = moment().format(dateFormat);
  console.log(`[${startTime}] Started request: ${req.method} ${req.originalUrl}`);

  next();

  const finishTime: string = moment().format(dateFormat);
  console.log(`[${finishTime}] Finished request: ${req.method} ${req.originalUrl}`);
};
