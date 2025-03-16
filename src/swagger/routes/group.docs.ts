export const groupRoutesDocs = {
  '/groups': {
    get: {
      tags: ['Groups'],
      summary: 'Get all groups for current user',
      description: 'Requires authentication. Returns all groups where the user is a member.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of groups',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    image: { type: 'string' },
                    creator: { type: 'string' },
                    members: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
    post: {
      tags: ['Groups'],
      summary: 'Create a new group',
      description:
        'Requires authentication. Creates a new group with the current user as creator and member.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: {
                  type: 'string',
                  description: 'Group name',
                },
                description: {
                  type: 'string',
                  description: 'Group description',
                },
                image: {
                  type: 'string',
                  format: 'binary',
                  description: 'Group image file',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Group created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  image: { type: 'string' },
                  creator: { type: 'string' },
                  members: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Invalid input' },
        401: { description: 'Unauthorized' },
      },
    },
  },
  '/groups/toggle-join/{groupId}': {
    post: {
      tags: ['Groups'],
      summary: 'Join or leave a group',
      description:
        "Requires authentication. Toggles the current user's membership in the specified group.",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'groupId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the group to join/leave',
        },
      ],
      responses: {
        200: {
          description: 'Group joined/left successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  image: { type: 'string' },
                  creator: { type: 'string' },
                  members: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Group not found' },
      },
    },
  },
};
