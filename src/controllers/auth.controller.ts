import { NextFunction, Request, Response } from 'express';
import { UserDocument, UserModel } from '../models';
import { genSalt, hash } from 'bcryptjs';
import {
  BadRequestError,
  InternalServerError,
  LoggedUser,
  signTokens,
  Tokens,
  validateToken,
  verifyPassword,
} from '../utils';
import { OAuth2Client } from 'google-auth-library';
import { createUser, getUserByFilters, getUserById, updateUser } from '../repositories';
import { LoginObject, RegisterObject } from '../validations/auth.validation';
import { StatusCodes } from 'http-status-codes';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, username, fullName }: RegisterObject = req.body as RegisterObject;

    const user: UserDocument | null = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return next(new BadRequestError('User already exists'));
    }

    const salt: string = await genSalt(10);
    const encryptedPassword: string = await hash(password, salt);
    await createUser({ email, password: encryptedPassword, username, fullName });

    res.status(StatusCodes.CREATED).json({ message: 'User registered successfully' });
  } catch (error: unknown) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginObject = req.body as LoginObject;

    const user: UserDocument = await getUserByFilters({ email });
    await verifyPassword(password, user.password);

    const { accessToken, refreshToken }: Tokens = signTokens(user.id);
    await updateUser(user.id, { tokens: [...user.tokens, refreshToken] });
    res.status(StatusCodes.OK).json({ accessToken, refreshToken });
  } catch (error: unknown) {
    return next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, token }: LoggedUser = req.user;

    const user: UserDocument = await getUserById(id);
    await validateToken(user, token);

    const { accessToken, refreshToken }: Tokens = signTokens(id);
    user.tokens[user.tokens.indexOf(token)] = refreshToken;
    await updateUser(id, { tokens: [...user.tokens] });

    res.status(StatusCodes.OK).send({ accessToken, refreshToken });
  } catch (error: unknown) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, token }: LoggedUser = req.user;

    const user: UserDocument = await getUserById(id);
    await validateToken(user, token);

    user.tokens.splice(user.tokens.indexOf(token), 1);
    await updateUser(id, { tokens: [...user.tokens] });

    res.status(StatusCodes.OK).send('User logged out successfully');
  } catch (error: unknown) {
    return next(error);
  }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserDocument = await getUserById(req.user!.id);
    res.status(StatusCodes.OK).json({ user });
  } catch (error: unknown) {
    return next(error);
  }
};

const client: OAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.body;
  if (!token) {
    return next(new BadRequestError('Missing credential'));
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(new BadRequestError('Invalid Google token payload'));
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
  } catch (error: any) {
    return next(new InternalServerError(error.message));
  }
};
