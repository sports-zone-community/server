import { CorsOptions } from 'cors';
import { config } from '../config/config';
import { UnauthorizedError } from './errors';

export const getCorsOptions = (): CorsOptions => {
  const allowedOrigins: string[] = config.allowedOrigins;

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new UnauthorizedError('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  };
};
