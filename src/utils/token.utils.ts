import { Request } from 'express';
import { Secret, sign } from 'jsonwebtoken';

export const extractTokenFromRequest = (req: Request): string | undefined => {
  return req.header('Authorization')?.split(' ')[1];
};

export const signTokens = (
  userId: string,
): { accessToken: string; refreshToken: string } => {
  const accessToken = sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    { expiresIn: process.env.JWT_TOKEN_EXPIRATION },
  );

  const refreshToken = sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET as Secret,
  );

  return { accessToken, refreshToken };
};
