import { NextFunction, Request, Response } from 'express';
import { Secret, verify } from 'jsonwebtoken';
import { extractTokenFromRequest } from '../utils/utils';
import { StatusCodes } from 'http-status-codes';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: 'Access denied. No token provided.' });
      return;
    }

    const secret: Secret = process.env.ACCESS_TOKEN_SECRET as Secret;
    const decoded = verify(token, secret) as { id: string };

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid token' });
  }
};
