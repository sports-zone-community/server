import { Request } from 'express';

export const extractTokenFromRequest = (req: Request): string | undefined => {
  return req.header('Authorization')?.split(' ')[1];
};
