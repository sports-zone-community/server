import { NextFunction, Request, Response } from 'express';
import { getAuthHeader, TokenPayload, verifyToken } from '../utils';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token: string = getAuthHeader(req);
  const { userId }: TokenPayload = verifyToken(token);

  req.user = { id: userId, token };
  next();
};

export const requireAccessToken = (req: Request, res: Response, next: NextFunction): void => {
  const token: string = getAuthHeader(req);
  const { userId }: TokenPayload = verifyToken(token, true);

  req.user = { id: userId, token };
  next();
};
