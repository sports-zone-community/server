import { CorsOptions } from 'cors';
import { config } from '../config/config';

export const getCorsOptions = (): CorsOptions => {
  const allowedOrigins = config.allowedOrigins;

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  };
};
