import { Request } from 'express';
import { Secret, sign } from 'jsonwebtoken';

export const extractTokenFromRequest = (req: Request): string | undefined => {
  return req.header('Authorization')?.split(' ')[1];
};

export const signTokens = (
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

export const logStartFunction = (functionName: string) => {
  console.log(`Starting function ${functionName}...`);
};

export const logEndFunction = (functionName: string) => {
  console.log(`Finished function ${functionName}`);
};

export const logError = (errorMessage: string, functionName: string) => {
  console.error(`Failure function ${functionName}: ${errorMessage}`);
};
