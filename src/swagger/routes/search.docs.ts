export const searchRoutesDocs = {
  '/search/{searchQuery}': {
    get: {
      tags: ['Search'],
      summary: 'Search for content',
      description:
        'Requires authentication. Returns search results based on the search query parameter.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'searchQuery',
          required: true,
          schema: { type: 'string' },
          description: 'Search query',
        },
      ],
      responses: {
        200: {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    content: { type: 'string' },
                    author: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        username: { type: 'string' },
                      },
                    },
                    timestamp: { type: 'string' },
                    formattedTime: { type: 'string' },
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
};
