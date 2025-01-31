export const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  ssl: {
    keyPath: process.env.SSL_KEY_PATH ?? './certs/localhost-key.pem',
    certPath: process.env.SSL_CERT_PATH ?? './certs/localhost.pem',
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 27017,
    name: process.env.DB_NAME ?? 'sportsZone',
  },
  jwt: {
    accessTokenSecret:
      process.env.ACCESS_TOKEN_SECRET ??
      '4fe99a6dba4f4fd518e96d0ad78d5230f6dd3eced161ad4fef8c59f474eb21151e9e099a1750147a3ed4a18f3e49b3c96cdd65104182c63919e323d25f4e6819',
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET ??
      '6a32e91e05bd5054d3c532a84e24a6133da1ee2d45d7bc119c721951a7ef527177dbd2d010ac92357bd4152f5f6f558623751ef744e38de32eda0fa6761c76a7',
    tokenExpiration: process.env.JWT_TOKEN_EXPIRATION ?? '1h',
  },
  google: {
    userDetailsUrl:
      process.env.GOOGLE_USER_DETAILS_URL ?? 'https://www.googleapis.com/oauth2/v1/userinfo',
  },
};

export interface Config {
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
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    tokenExpiration: string;
  };
  google: {
    userDetailsUrl: string;
  };
}
