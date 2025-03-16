export const userRoutesDocs = {
  '/user/toggle-follow/{userId}': {
    post: {
      tags: ['User'],
      summary: 'Toggle follow/unfollow a user',
      description: 'Follow or unfollow a user by providing their user ID.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'The ID of the user to follow/unfollow',
        },
      ],
      responses: {
        200: {
          description: 'User follow/unfollow action successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  googleId: { type: 'string', nullable: true },
                  picture: { type: 'string' },
                  provider: { type: 'string', enum: ['LOCAL', 'GOOGLE'] },
                  following: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Invalid user ID or attempting to follow yourself' },
        404: { description: 'User not found' },
      },
    },
  },
  '/user/details': {
    get: {
      tags: ['User'],
      summary: 'Get user details',
      description: 'Retrieve details of a user by providing their user ID as a query parameter.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'userId',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'The ID of the user whose details are being retrieved',
        },
      ],
      responses: {
        200: {
          description: 'User details retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  googleId: { type: 'string', nullable: true },
                  picture: { type: 'string' },
                  provider: { type: 'string', enum: ['LOCAL', 'GOOGLE'] },
                  following: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Invalid user ID' },
        404: { description: 'User not found' },
      },
    },
  },
};
