import { Request, Response } from 'express';
import { IUser, User } from '../models';
import { compare, genSalt, hash } from 'bcryptjs';
import { Secret, verify } from 'jsonwebtoken';
import {
  extractTokenFromRequest,
  logEndFunction,
  logError,
  logStartFunction,
  signTokens,
} from '../utils/utils';
import { StatusCodes } from 'http-status-codes';
import { OAuth2Client } from 'google-auth-library';

export const register = async (req: Request, res: Response) => {
  logStartFunction('register');
  const { email, password, username, fullName } = req.body;

  if (!email || !password || !username || !fullName) {
    logError('Please fill all fields', 'register');
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please fill all fields' });
    return;
  }

  try {
    const user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user) {
      logError('User already exists', 'register');
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'User already exists' });
      return;
    }

    const salt: string = await genSalt(10);
    const encryptedPassword = await hash(password, salt);
    const newUser: IUser = new User({
      email,
      password: encryptedPassword,
      username,
      fullName,
    });
    await newUser.save();

    logEndFunction('register');
    res.json({ message: 'User registered successfully' });
  } catch (error: any) {
    logError(error.message, 'register');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  logStartFunction('login');
  const { email, password } = req.body;

  if (!email || !password) {
    logError('Please fill all fields', 'login');
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please fill all fields' });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logError('User does not exist', 'login');
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User does not exist' });
      return;
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      logError('Invalid credentials', 'login');
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = signTokens(user.id);
    user.tokens = user.tokens.length ? [...user.tokens, refreshToken] : [refreshToken];
    await user.save();

    logEndFunction('login');
    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  logStartFunction('refreshToken');
  const token = extractTokenFromRequest(req);

  if (!token) {
    logError('Invalid request', 'refreshToken');
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid request' });
    return;
  }

  verify(token, process.env.REFRESH_TOKEN_SECRET as Secret, async (error, userInfo: any) => {
    if (error) {
      logError('Invalid token', 'refreshToken');
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid token' });
    }

    const userId = userInfo.id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        logError('User not found', 'refreshToken');
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'user not found' });
      }

      if (!user.tokens.includes(token)) {
        logError('Token not found', 'refreshToken');
        user.tokens = [];
        await user.save();
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'token not found' });
      }

      const { accessToken, refreshToken } = signTokens(userId);
      user.tokens[user.tokens.indexOf(token)] = refreshToken;
      await user.save();

      logEndFunction('refreshToken');
      res.send({ accessToken, refreshToken });
    } catch (error: any) {
      logError(error.message, 'refreshToken');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  });
};

export const logout = async (req: Request, res: Response) => {
  logStartFunction('logout');
  const token = extractTokenFromRequest(req);

  if (!token) {
    logError('Invalid request', 'logout');
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid request' });
    return;
  }

  verify(token, process.env.REFRESH_TOKEN_SECRET as Secret, async (error, userInfo: any) => {
    if (error) {
      logError('Invalid token', 'logout');
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid token' });
    }

    const userId = userInfo.id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        logError('User not found', 'logout');
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'user not found' });
      }

      if (!user.tokens.includes(token)) {
        logError('Token not found', 'logout');
        user.tokens = [];
        await user.save();
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'token not found' });
      }

      user.tokens.splice(user.tokens.indexOf(token), 1);
      await user.save();

      logEndFunction('logout');
      res.send('User logged out successfully');
    } catch (error: any) {
      logError(error.message, 'logout');
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  });
};

export const verifyUser = async (req: Request, res: Response) => {
  logStartFunction('verifyUser');
  try {
    const user = await User.findById(req?.user?.id).select('-password -tokens');
    if (!user) {
      logError('User not found', 'verifyUser');
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'User not found' });
      return;
    }

    logEndFunction('verifyUser');
    res.json({ user });
  } catch (error: any) {
    logError(error.message, 'verifyUser');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (req: Request, res: Response) => {
  logStartFunction('loginWithGoogle');
  const { token } = req.body;

  if (!token) {
    logError('Missing credential', 'googleSignIn');
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing credential' });
    return;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token payload');
    }

    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
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

    logEndFunction('loginWithGoogle');
    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    logError(error.message, 'loginWithGoogle');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
