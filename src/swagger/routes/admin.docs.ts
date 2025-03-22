export const adminRoutesDocs = {
  '/admin/delete-all': {
    delete: {
      tags: ['Admin'],
      summary: 'Delete all collections',
      description: 'Requires authentication. Deletes all documents in all collections.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'All collections cleared',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: { description: 'Failed to clear collections' },
      },
    },
  },
};
