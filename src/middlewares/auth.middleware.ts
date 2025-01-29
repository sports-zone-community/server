import { NextFunction, Request, Response } from 'express';
import { getAuthHeader, TokenPayload, verifyToken } from '../utils';
import { UserRepository } from '../repositories';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token: string = getAuthHeader(req);
  const { userId }: TokenPayload = verifyToken(token);
  try {
    await UserRepository.getUserById(userId);
    req.user = { id: userId, token };
    next();
  } catch (error: unknown) {
    next(error);
  }
};
