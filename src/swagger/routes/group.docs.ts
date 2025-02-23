export const groupRoutesDocs = {
  '/api/groups': {
    get: {
      tags: ['Groups'],
      summary: 'Get all groups for current user',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of groups' },
        401: { description: 'Unauthorized' }
      }
    },
    post: {
      tags: ['Groups'],
      summary: 'Create a new group',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                image: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Group created successfully' },
        400: { description: 'Invalid input' },
        401: { description: 'Unauthorized' }
      }
    }
  },
  '/api/groups/toggle-join/{groupId}': {
    post: {
      tags: ['Groups'],
      summary: 'Join or leave a group',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'groupId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: { description: 'Group joined/left successfully' },
        401: { description: 'Unauthorized' },
        404: { description: 'Group not found' }
      }
    }
  }
}; 