export const authRoutesDocs = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Registers a new user with email, name, password, and username.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string', minLength: 3, maxLength: 40 },
                password: { type: 'string', minLength: 6, maxLength: 30 },
                username: { type: 'string', minLength: 3, maxLength: 20 },
              },
              required: ['email', 'name', 'password', 'username'],
            },
          },
        },
      },
      responses: {
        201: { description: 'User registered successfully' },
        400: { description: 'Validation error' },
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'User login',
      description: 'Logs in a user with email and password.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6, maxLength: 30 },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        200: { description: 'User logged in successfully' },
        401: { description: 'Invalid credentials' },
      },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'User logout',
      description: 'Logs out the user by invalidating the refresh token.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'User logged out successfully' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/auth/refreshToken': {
    post: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      description: 'Refreshes the access token using a valid refresh token.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Token refreshed successfully' },
        401: { description: 'Invalid or expired refresh token' },
      },
    },
  },
  '/auth/verify': {
    get: {
      tags: ['Auth'],
      summary: 'Verify user authentication',
      description: 'Requires a valid access token in the Authorization header.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'User is authenticated' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/auth/google': {
    post: {
      tags: ['Auth'],
      summary: 'Google login',
      description: 'Logs in a user using Google OAuth.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                access_token: { type: 'string' },
              },
              required: ['access_token'],
            },
          },
        },
      },
      responses: {
        200: { description: 'User logged in successfully' },
        401: { description: 'Invalid Google token' },
      },
    },
  },
};
