export interface TokenPayload {
  userId: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoggedUser {
  id: string;
  token: string;
}

declare global {
  namespace Express {
    interface Request {
      user: LoggedUser;
    }
  }
}