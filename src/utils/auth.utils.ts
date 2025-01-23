import { Request } from 'express';
import { Secret, sign, verify } from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError } from './errors';
import { compare } from 'bcryptjs';

export interface TokenPayload {
  userId: string;
}

export const getAuthHeader = (req: Request): string => {
  const token: string | undefined = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    throw new BadRequestError('No "Authorization" header provided');
  }

  return token;
};

export const signTokens = (userId: string): { accessToken: string; refreshToken: string } => {
  const accessToken: string = sign(
    { userId } as TokenPayload,
    process.env.ACCESS_TOKEN_SECRET as Secret,
    { expiresIn: process.env.JWT_TOKEN_EXPIRATION },
  );

  const refreshToken = sign({ userId } as TokenPayload, process.env.REFRESH_TOKEN_SECRET as Secret);

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return verify(token, process.env.REFRESH_TOKEN_SECRET as Secret) as TokenPayload;
  } catch (error: unknown) {
    throw new UnauthorizedError('Invalid token');
  }
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  const isMatch: boolean = await compare(password, hashedPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }
};
