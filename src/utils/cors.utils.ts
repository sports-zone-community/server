import { CorsOptions } from 'cors';

export const getCorsOptions = (): CorsOptions => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

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
