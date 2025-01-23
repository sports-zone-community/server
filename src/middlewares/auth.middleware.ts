import { NextFunction, Request, Response } from 'express';
import { getAuthHeader, TokenPayload, verifyToken } from '../utils';

declare global {
  namespace Express {
    interface Request {
      user: { id: string; token: string };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token: string = getAuthHeader(req);
  const { userId }: TokenPayload = verifyToken(token);

  req.user = { id: userId, token };
  next();
};
