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
import { createUser, getUserByFilters, getUserById, updateUser } from '../repositories';
import {
  googleLoginSchema,
  GoogleUser,
  googleUserSchema,
  LoginObject,
  loginSchema,
  RegisterObject,
  registerSchema,
} from '../validations/auth.validation';
import { validateSchema } from '../validations/schema.validation';
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import { config } from '../config/config';
import { Provider } from '../enums/provider.enum';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, username, name }: RegisterObject = validateSchema(registerSchema, req);

    const user: UserDocument | null = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return next(new BadRequestError('User already exists'));
    }

    const salt: string = await genSalt(10);
    const encryptedPassword: string = await hash(password, salt);
    await createUser({ email, password: encryptedPassword, username, name: name });

    res.status(StatusCodes.CREATED).json({ message: 'User registered successfully' });
  } catch (error: unknown) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password }: LoginObject = validateSchema(loginSchema, req);

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

export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { access_token } = validateSchema(googleLoginSchema, req);

    const googleUser: GoogleUser = (
      await axios.get<GoogleUser>(config.googleUserDetailsUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
    ).data;

    const { error } = googleUserSchema.validate(googleUser);
    if (error) {
      return next(new BadRequestError('Invalid Google token payload'));
    }

    const { email, name, picture } = googleUser;

    let user: UserDocument | null = await UserModel.findOne({ email });
    if (!user) {
      user = await createUser({
        email,
        username: email.split('@')[0],
        name: name,
        provider: Provider.GOOGLE,
        picture,
      });
    }

    const { accessToken, refreshToken }: Tokens = signTokens(user.id);

    await updateUser(user.id, { tokens: [...user.tokens, refreshToken] });

    res.status(StatusCodes.OK).json({ accessToken, refreshToken });
  } catch (error: any) {
    return next(new InternalServerError(error.message));
  }
};
