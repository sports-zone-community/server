import { NextFunction, Request, Response } from 'express';
import { IUser, UserModel } from '../models';
import { genSalt, hash } from 'bcryptjs';
import { logEndFunction, logStartFunction, signTokens, verifyPassword } from '../utils';
import { OAuth2Client } from 'google-auth-library';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { InternalServerError } from '../utils/errors/internal-server.error';
import { createUser, getUserByFilters, getUserById, updateUser } from '../repositories';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const functionName: string = register.name;
  logStartFunction(register.name);
  const { email, password, username, fullName } = req.body;

  if (!email || !password || !username || !fullName) {
    return next(new BadRequestError('Please fill all fields', { functionName }));
  }

  const user: IUser | null = await UserModel.findOne({ $or: [{ email }, { username }] });
  if (user) {
    return next(new BadRequestError('User already exists', { functionName }));
  }

  try {
    const salt: string = await genSalt(10);
    const encryptedPassword = await hash(password, salt);
    await createUser({ email, password: encryptedPassword, username, fullName });

    logEndFunction(functionName);
    res.json({ message: 'User registered successfully' });
  } catch (error: unknown) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const functionName: string = login.name;
  logStartFunction(functionName);
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Please fill all fields', { functionName }));
  }

  const user: IUser = await getUserByFilters({ email });
  await verifyPassword(password, user.password);

  const { accessToken, refreshToken } = signTokens(user.id);
  await updateUser(user.id, { tokens: [...user.tokens, refreshToken] });
  logEndFunction(functionName);
  res.json({ accessToken, refreshToken });
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const functionName: string = refresh.name;
  logStartFunction(functionName);

  const { id, token }: { id: string; token: string } = req.user;

  const user: IUser = await getUserById(id);
  if (!user.tokens.includes(token)) {
    await updateUser(id, { tokens: [] });
    return next(new UnauthorizedError('Token not found', { functionName }));
  }

  const { accessToken, refreshToken } = signTokens(id);
  user.tokens[user.tokens.indexOf(token)] = refreshToken;
  await updateUser(id, { tokens: [...user.tokens] });

  logEndFunction(functionName);
  res.send({ accessToken, refreshToken });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const functionName: string = logout.name;
  logStartFunction(functionName);

  const { id, token }: { id: string; token: string } = req.user;

  const user: IUser = await getUserById(id);
  if (!user.tokens.includes(token)) {
    await updateUser(id, { tokens: [] });
    return next(new UnauthorizedError('Token not found', { functionName }));
  }

  user.tokens.splice(user.tokens.indexOf(token), 1);
  await updateUser(id, { tokens: [...user.tokens] });

  logEndFunction(functionName);
  res.send('User logged out successfully');
};

export const verifyUser = async (req: Request, res: Response) => {
  const functionName: string = verifyUser.name;
  logStartFunction(functionName);

  const user: IUser = await getUserById(req.user!.id);

  logEndFunction(functionName);
  res.json({ user });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
  const functionName: string = loginWithGoogle.name;
  logStartFunction(functionName);

  const { token } = req.body;
  if (!token) {
    return next(new BadRequestError('Missing credential', { functionName }));
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(new BadRequestError('Invalid Google token payload', { functionName }));
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
    return next(new InternalServerError(error.message, { functionName }));
  }
};
