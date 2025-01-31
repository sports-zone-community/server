import { NextFunction, Request, Response } from 'express';
import { getAuthHeader, TokenPayload, verifyToken } from '../utils';
import { UserRepository } from '../repositories';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token: string = getAuthHeader(req);
  const { userId }: TokenPayload = verifyToken(token);
  await UserRepository.getUserById(userId);

  req.user = { id: userId, token };
  next();
};

export const verifyRefreshTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token: string = getAuthHeader(req);
  const { userId }: TokenPayload = verifyToken(token, true);

  req.user = { id: userId, token };
  next();
};
