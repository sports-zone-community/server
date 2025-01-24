export interface TokenPayload {
  userId: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// TODO: Make all fields optional again?

export interface LoggedUser {
  id: string;
  token: string;
  groups?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user: LoggedUser;
    }
  }
}
