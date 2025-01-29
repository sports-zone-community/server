import { Request, Response } from 'express';
import { UserDocument, UserModel } from '../models';
import { genSalt, hash } from 'bcryptjs';
import {
  BadRequestError,
  LoggedUser,
  signTokens,
  Tokens,
  validateToken,
  verifyPassword,
} from '../utils';
import { OAuth2Client } from 'google-auth-library';
import { UserRepository } from '../repositories';
import { LoginObject, RegisterObject } from '../validations/auth.validation';
import { StatusCodes } from 'http-status-codes';

export const register = async (req: Request, res: Response) => {
  const { email, password, username, fullName }: RegisterObject = req.body as RegisterObject;

  const salt: string = await genSalt(10);
  const encryptedPassword: string = await hash(password, salt);
  await UserRepository.createUser({ email, password: encryptedPassword, username, fullName });

  res.status(StatusCodes.CREATED).json({ message: 'User registered successfully' });
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: LoginObject = req.body as LoginObject;

  const user: UserDocument = await UserRepository.getUserByFilters({ email });
  await verifyPassword(password, user.password);

  const { accessToken, refreshToken }: Tokens = signTokens(user.id);
  await UserRepository.updateUser(user.id, { tokens: [...user.tokens, refreshToken] });

  res.status(StatusCodes.OK).json({ accessToken, refreshToken });
};

export const refresh = async (req: Request, res: Response) => {
  const { id, token }: LoggedUser = req.user;

  const user: UserDocument = await UserRepository.getUserById(id);
  await validateToken(user, token);

  const { accessToken, refreshToken }: Tokens = signTokens(id);
  user.tokens[user.tokens.indexOf(token)] = refreshToken;
  await UserRepository.updateUser(id, { tokens: [...user.tokens] });

  res.status(StatusCodes.OK).send({ accessToken, refreshToken });
};

export const logout = async (req: Request, res: Response) => {
  const { id, token }: LoggedUser = req.user;

  const user: UserDocument = await UserRepository.getUserById(id);
  await validateToken(user, token);

  user.tokens.splice(user.tokens.indexOf(token), 1);
  await UserRepository.updateUser(id, { tokens: [...user.tokens] });

  res.status(StatusCodes.OK).send('User logged out successfully');
};

export const verifyUser = async (req: Request, res: Response) => {
  const user: UserDocument = await UserRepository.getUserById(req.user!.id);
  res.status(StatusCodes.OK).json({ user });
};

const client: OAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// TODO: Shorten this or move to smaller functions
export const loginWithGoogle = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    throw new BadRequestError('Missing credential');
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new BadRequestError('Invalid Google token payload');
  }

  const { email, name } = payload;

  let user: UserDocument | null = await UserModel.findOne({ email });
  if (!user) {
    user = new UserModel({
      email,
      username: email.split('@')[0],
      fullName: name || 'Google User',
      password: null,
      tokens: [],
    });
    await user.save();
  }

  const { accessToken, refreshToken }: Tokens = signTokens(user.id);

  const maxTokens: number = Number(process.env.GOOGLE_CLIENT_ID);
  user.tokens = [...(user.tokens || []), refreshToken].slice(-maxTokens);
  await user.save();

  res.status(StatusCodes.OK).json({ accessToken, refreshToken });
};
