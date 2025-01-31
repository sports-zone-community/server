import { Request } from 'express';
import { Secret, sign, verify } from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError } from './errors';
import { compare } from 'bcryptjs';
import { UserDocument } from '../models';
import { updateUser } from '../repositories';
import { TokenPayload, Tokens } from './types';
import { config } from '../config/config';

export const getAuthHeader = (req: Request): string => {
  const token: string | undefined = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    throw new BadRequestError('No "Authorization" header provided');
  }

  return token;
};

export const signTokens = (userId: string): Tokens => {
  const accessToken: string = sign({ userId } as TokenPayload, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.tokenExpiration,
  });

  const refreshToken: string = sign({ userId } as TokenPayload, config.jwt.refreshTokenSecret);

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefresh = false): TokenPayload => {
  try {
    return verify(
      token,
      (isRefresh ? config.jwt.refreshTokenSecret : config.jwt.accessTokenSecret) as Secret,
    ) as TokenPayload;
  } catch (error: unknown) {
    throw new UnauthorizedError(`Invalid token`);
  }
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  const isMatch: boolean = await compare(password, hashedPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }
};

export const validateRefreshToken = async (user: UserDocument, token: string) => {
  if (!user.tokens.includes(token)) {
    await updateUser(user.id, { tokens: [] });
    throw new UnauthorizedError('Token not found');
  }
};
