import { NextFunction, Request, Response } from 'express';
import { UserDocument, UserModel } from '../models';
import { genSalt, hash } from 'bcryptjs';
import {
  BadRequestError,
  InternalServerError,
  signTokens,
  UnauthorizedError,
  verifyPassword,
} from '../utils';
import { OAuth2Client } from 'google-auth-library';
import { createUser, getUserByFilters, getUserById, updateUser } from '../repositories';
import {
  LoginObject,
  loginSchema,
  RegisterObject,
  registerSchema,
} from '../validations/schemas/user.schemas';
import { validateSchema } from '../validations/schema.validation';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, username, fullName }: RegisterObject = validateSchema(
      registerSchema,
      req,
    );

    const user: UserDocument | null = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return next(new BadRequestError('User already exists'));
    }

    const salt: string = await genSalt(10);
    const encryptedPassword = await hash(password, salt);
    await createUser({ email, password: encryptedPassword, username, fullName });

    res.json({ message: 'User registered successfully' });
  } catch (error: unknown) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginObject = validateSchema(loginSchema, req);

    const user: UserDocument = await getUserByFilters({ email });
    await verifyPassword(password, user.password);

    const { accessToken, refreshToken } = signTokens(user.id);
    await updateUser(user.id, { tokens: [...user.tokens, refreshToken] });
    res.json({ accessToken, refreshToken });
  } catch (error: unknown) {
    return next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, token }: { id: string; token: string } = req.user;

    const user: UserDocument = await getUserById(id);
    if (!user.tokens.includes(token)) {
      await updateUser(id, { tokens: [] });
      return next(new UnauthorizedError('Token not found'));
    }

    const { accessToken, refreshToken } = signTokens(id);
    user.tokens[user.tokens.indexOf(token)] = refreshToken;
    await updateUser(id, { tokens: [...user.tokens] });

    res.send({ accessToken, refreshToken });
  } catch (error: unknown) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, token }: { id: string; token: string } = req.user;

    const user: UserDocument = await getUserById(id);
    if (!user.tokens.includes(token)) {
      await updateUser(id, { tokens: [] });
      return next(new UnauthorizedError('Token not found'));
    }

    user.tokens.splice(user.tokens.indexOf(token), 1);
    await updateUser(id, { tokens: [...user.tokens] });

    res.send('User logged out successfully');
  } catch (error: unknown) {
    return next(error);
  }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserDocument = await getUserById(req.user!.id);
    res.json({ user });
  } catch (error: unknown) {
    return next(error);
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    let user = await UserModel.findOne({ email });
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

    const { accessToken, refreshToken } = signTokens(user.id);

    const MAX_TOKENS = 5;
    user.tokens = [...(user.tokens || []), refreshToken].slice(-MAX_TOKENS);
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    return next(new InternalServerError(error.message));
  }
};
