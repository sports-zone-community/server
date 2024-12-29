import { Request, Response } from 'express';
import { IUser, User } from '../models/user.model';
import { compare, genSalt, hash } from 'bcryptjs';
import { Secret, sign, verify } from 'jsonwebtoken';
import { extractTokenFromRequest } from '../utils/utils';

export const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    res.json({ error: 'Please fill all fields' });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.json({ error: 'User already exists' });
      return;
    }

    const salt: string = await genSalt(10);
    const encryptedPassword = await hash(password, salt);
    const newUser: IUser = new User({
      email,
      password: encryptedPassword,
      username,
    });
    await newUser.save();

    res.json({ message: 'User registered successfully', newUser });
  } catch (error: any) {
    console.error('Error registering user: ', error.message);
    res.status(403).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.json({ error: 'Please fill all fields' });
    return;
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.json({ error: 'User does not exist' });
      return;
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      res.json({ error: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = signTokens(user.id);
    user.tokens = user.tokens ? [...user.tokens, refreshToken] : [refreshToken];
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    res.status(401);
    return;
  }

  verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as Secret,
    async (error, userInfo: any) => {
      if (error) {
        return res.status(403).send(error.message);
      }

      const userId = userInfo.id;

      try {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(403).send('Invalid request');
        }

        if (!user.tokens.includes(token)) {
          user.tokens = [];
          await user.save();
          return res.status(403).send('Invalid request');
        }

        const { accessToken, refreshToken } = signTokens(userId);
        user.tokens[user.tokens.indexOf(token)] = refreshToken;
        await user.save();

        res.send({ accessToken, refreshToken });
      } catch (error: any) {
        console.error('Error refreshing token: ', error.message);
        res.status(403).json({ error: error.message });
      }
    },
  );
};

export const logout = (req: Request, res: Response) => {
  const token = extractTokenFromRequest(req);

  if (!token) {
    res.status(401);
    return;
  }

  verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as Secret,
    async (error, userInfo: any) => {
      if (error) {
        return res.status(403).send(error.message);
      }

      const userId = userInfo.id;

      try {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(403).send('Invalid request');
        }

        if (!user.tokens.includes(token)) {
          user.tokens = [];
          await user.save();
          return res.status(403).send('Invalid request');
        }

        user.tokens.splice(user.tokens.indexOf(token), 1);
        await user.save();

        res.send('User logged out successfully');
      } catch (error: any) {
        console.error('Error logging out user: ', error.message);
        res.status(403).json({ error: error.message });
      }
    },
  );
};

const signTokens = (
  userId: string,
): { accessToken: string; refreshToken: string } => {
  const accessToken = sign(
    { id: userId },
    process.env.ACCESS_TOKEN_SECRET as Secret,
    { expiresIn: process.env.JWT_TOKEN_EXPIRATION },
  );

  const refreshToken = sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET as Secret,
  );

  return { accessToken, refreshToken };
};
