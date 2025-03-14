export const footballRoutesDocs = {
  '/football/teams': {
    get: {
      tags: ['Football'],
      summary: 'Get teams by league and season',
      description: 'Retrieves football teams for a specific league and season',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'league',
          required: true,
          schema: {
            type: 'number',
          },
          description: 'League ID',
        },
        {
          in: 'query',
          name: 'season',
          required: true,
          schema: {
            type: 'number',
          },
          description: 'Season year',
        },
      ],
      responses: {
        200: {
          description: 'List of teams',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    team: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        code: { type: 'string' },
                        country: { type: 'string' },
                        founded: { type: 'number' },
                        national: { type: 'boolean' },
                        logo: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid input parameters',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
