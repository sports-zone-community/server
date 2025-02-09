import { Request, Response } from 'express';
import { Secret, sign, verify } from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError } from './errors';
import { compare } from 'bcryptjs';
import { UserDocument } from '../models';
import { UserRepository } from '../repositories';
import { TokenPayload, Tokens } from './types';
import { config } from '../config/config';
import { getObjectId } from './common.utils';

export const getAuthHeader = (req: Request): string => {
  const token: string | undefined = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    throw new BadRequestError('No "Authorization" header provided');
  }

  return token;
};

export const generateAndSetTokens = async (
  user: UserDocument,
  res: Response,
): Promise<{ accessToken: string }> => {
  const { accessToken, refreshToken }: Tokens = signTokens(user.id);
  user.tokens.push(refreshToken);
  await UserRepository.updateUser(user.id, { tokens: user.tokens });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.environment === 'production',
    sameSite: 'strict',
  });

  return { accessToken };
};

const signTokens = (userId: string): Tokens => {
  const accessToken: string = sign({ userId } as TokenPayload, config.jwt.accessTokenSecret, {
    expiresIn: config.jwt.accessTokenExpiration,
  });

  const refreshToken: string = sign({ userId } as TokenPayload, config.jwt.refreshTokenSecret, {
    expiresIn: config.jwt.refreshTokenExpiration,
  });

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
    await UserRepository.updateUser(user.id, { tokens: [] });
    throw new UnauthorizedError('Token not found');
  }
};

export const isFollowingUser = async (userId: string, targetUserId: string): Promise<boolean> => {
  const user: UserDocument = await UserRepository.getUserById(userId);
  const targetUser: UserDocument = await UserRepository.getUserById(targetUserId);
  return user.following.includes(getObjectId(targetUser.id));
};
