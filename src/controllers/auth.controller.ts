import { Request, Response } from 'express';
import { IUser, UserModel } from '../models';
import { compare, genSalt, hash } from 'bcryptjs';
import {
  getAuthHeader,
  logEndFunction,
  logStartFunction,
  signTokens,
  TokenPayload,
  verifyToken,
} from '../utils';
import { OAuth2Client } from 'google-auth-library';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { InternalServerError } from '../utils/errors/internal-server.error';

export const register = async (req: Request, res: Response) => {
  const functionName: string = register.name;
  logStartFunction(register.name);
  const { email, password, username, fullName } = req.body;

  if (!email || !password || !username || !fullName) {
    throw new BadRequestError('Please fill all fields', { functionName });
  }

  try {
    const user: IUser | null = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (user) {
      throw new BadRequestError('User already exists', { functionName });
    }
    const salt: string = await genSalt(10);
    const encryptedPassword = await hash(password, salt);
    const newUser: IUser = new UserModel({
      email,
      password: encryptedPassword,
      username,
      fullName,
    });
    await newUser.save();

    logEndFunction(functionName);
    res.json({ message: 'User registered successfully' });
  } catch (error: any) {
    throw new InternalServerError(error.message, { functionName });
  }
};

export const login = async (req: Request, res: Response) => {
  const functionName: string = login.name;
  logStartFunction(functionName);
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please fill all fields', { functionName });
  }

  try {
    const user: IUser | null = await UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('User does not exist', { functionName });
    }

    const isMatch: boolean = await compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials', { functionName });
    }

    const { accessToken, refreshToken } = signTokens(user.id);
    user.tokens = [...user.tokens, refreshToken];
    await user.save();

    logEndFunction(functionName);
    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    throw new InternalServerError(error.message, { functionName });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const functionName: string = refreshToken.name;
  logStartFunction(functionName);

  const token: string = getAuthHeader(req, functionName);
  const { userId }: TokenPayload = verifyToken(token, functionName);

  try {
    const user: IUser | null = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', { functionName });
    }

    if (!user.tokens.includes(token)) {
      user.tokens = [];
      await user.save();
      throw new UnauthorizedError('Token not found', { functionName });
    }

    const { accessToken, refreshToken } = signTokens(userId);
    user.tokens[user.tokens.indexOf(token)] = refreshToken;
    await user.save();

    logEndFunction(functionName);
    res.send({ accessToken, refreshToken });
  } catch (error: any) {
    throw new InternalServerError(error.message, { functionName });
  }
};

export const logout = async (req: Request, res: Response) => {
  const functionName: string = logout.name;
  logStartFunction(functionName);

  const token: string = getAuthHeader(req, functionName);
  const { userId }: TokenPayload = verifyToken(token, functionName);

  try {
    const user: IUser | null = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', { functionName });
    }

    if (!user.tokens.includes(token)) {
      user.tokens = [];
      await user.save();
      throw new UnauthorizedError('Token not found', { functionName });
    }

    user.tokens.splice(user.tokens.indexOf(token), 1);
    await user.save();

    logEndFunction(functionName);
    res.send('User logged out successfully');
  } catch (error: any) {
    throw new InternalServerError(error.message, { functionName });
  }
};

export const verifyUser = async (req: Request, res: Response) => {
  const functionName: string = verifyUser.name;
  logStartFunction(functionName);
  try {
    const user: IUser = await UserModel.findById(req?.user?.id).select('-password -tokens');
    if (!user) {
      throw new NotFoundError('User not found', { functionName });
    }

    logEndFunction(functionName);
    res.json({ user });
  } catch (error: any) {
    throw new InternalServerError(error.message, { functionName });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req: Request, res: Response) => {
  const functionName: string = loginWithGoogle.name;
  logStartFunction(functionName);

  const { token } = req.body;
  if (!token) {
    throw new BadRequestError('Missing credential', { functionName });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new BadRequestError('Invalid Google token payload', { functionName });
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

    logEndFunction(functionName);
    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    throw new InternalServerError(error.message, { functionName });
  }
};
