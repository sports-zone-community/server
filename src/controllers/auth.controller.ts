import { Request, Response } from 'express';
import { UserDocument } from '../models';
import { genSalt, hash } from 'bcryptjs';
import {
  BadRequestError,
  signTokens,
  Tokens,
  validateRefreshToken,
  verifyPassword,
} from '../utils';
import { UserRepository } from '../repositories';
import {
  GoogleLoginObject,
  GoogleUser,
  googleUserSchema,
  LoginObject,
  RegisterObject,
} from '../validations/auth.validation';
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import { config } from '../config/config';
import { Provider } from '../enums/provider.enum';
import { ValidationResult } from 'joi';

export const register = async (req: Request, res: Response) => {
  const { email, password, username, name }: RegisterObject = req.body as RegisterObject;

  const salt: string = await genSalt(10);
  const encryptedPassword: string = await hash(password, salt);
  await UserRepository.createUser({ email, password: encryptedPassword, username, name });

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
  const { id, token } = req.user;

  const user: UserDocument = await UserRepository.getUserById(id);
  await validateRefreshToken(user, token);

  const { accessToken, refreshToken }: Tokens = signTokens(id);
  user.tokens[user.tokens.indexOf(token)] = refreshToken;
  await UserRepository.updateUser(id, { tokens: [...user.tokens] });

  res.status(StatusCodes.OK).send({ accessToken, refreshToken });
};

export const logout = async (req: Request, res: Response) => {
  const { id, token } = req.user;

  const user: UserDocument = await UserRepository.getUserById(id);
  await validateRefreshToken(user, token);

  user.tokens.splice(user.tokens.indexOf(token), 1);
  await UserRepository.updateUser(id, { tokens: [...user.tokens] });

  res.status(StatusCodes.OK).send('User logged out successfully');
};

export const verifyUser = async (req: Request, res: Response) => {
  const user: UserDocument = await UserRepository.getUserById(req.user!.id);
  res.status(StatusCodes.OK).json({ user });
};

export const loginWithGoogle = async (req: Request, res: Response) => {
  const { access_token }: GoogleLoginObject = req.body as GoogleLoginObject;

  const googleUser: GoogleUser = (
    await axios.get<GoogleUser>(config.google.userDetailsUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
  ).data;

  const { value, error }: ValidationResult<GoogleUser> = googleUserSchema.validate(googleUser);
  if (error) {
    throw new BadRequestError('Invalid Google token payload');
  }

  const user: UserDocument = await UserRepository.getOrCreateUser({
    email: value.email,
    username: value.email.split('@')[0],
    name: value.name,
    provider: Provider.GOOGLE,
    picture: value.picture,
  });

  const { accessToken, refreshToken }: Tokens = signTokens(user.id);
  await UserRepository.updateUser(user.id, { tokens: [...user.tokens, refreshToken] });

  res.status(StatusCodes.OK).json({ accessToken, refreshToken });
};
