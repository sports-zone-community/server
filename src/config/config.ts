import dotenv from 'dotenv';

dotenv.config();

export const config: Config = {
  environment: process.env.NODE_ENV!,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  ssl: {
    keyPath: process.env.SSL_KEY_PATH!,
    certPath: process.env.SSL_CERT_PATH!,
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  database: {
    host: process.env.DB_HOST!,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 27017,
    name: process.env.DB_NAME!,
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
  },
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION!,
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION!,
  },
  google: {
    userDetailsUrl: process.env.GOOGLE_USER_DETAILS_URL!,
  },
  pageSize: process.env.PAGE_SIZE ? parseInt(process.env.PAGE_SIZE) : 5,
  ai: {
    token: process.env.AI_TOKEN!,
  },
  footballApi: {
    apiKey: process.env.FOOTBALL_API_KEY!,
    footballApiUrl: process.env.FOOTBALL_API_URL!,
  },
};

export interface Config {
  environment: string;
  port: number;
  ssl: {
    keyPath: string;
    certPath: string;
  };
  allowedOrigins: string[];
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiration: string;
    refreshTokenExpiration: string;
  };
  google: {
    userDetailsUrl: string;
  };
  pageSize: number;
  footballApi: {
    apiKey: string;
    footballApiUrl: string;
  };
  ai: {
    token: string;
  };
}
