export const commentRoutesDocs = {
  '/comments': {
    get: {
      tags: ['Comments'],
      summary: 'Get comments by post ID',
      description: 'Requires authentication. Post ID is provided as a query parameter.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'postId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the post to get comments for',
        },
      ],
      responses: {
        200: {
          description: 'List of comments for the post',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    commentId: { type: 'string' },
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
        401: { description: 'Unauthorized' },
        404: { description: 'Post not found' },
      },
    },
    post: {
      tags: ['Comments'],
      summary: 'Add a comment to a post',
      description: 'Requires authentication. User ID is extracted from the JWT token.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                postId: { type: 'string' },
                content: { type: 'string' },
              },
              required: ['postId', 'content'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Comment added successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  commentId: { type: 'string' },
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
        400: { description: 'Invalid input' },
        401: { description: 'Unauthorized' },
        404: { description: 'Post not found' },
      },
    },
  },
  '/comments/{commentId}': {
    delete: {
      tags: ['Comments'],
      summary: 'Delete a comment by ID',
      description: 'Requires authentication. User ID is extracted from the JWT token.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'commentId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the comment to delete',
        },
      ],
      responses: {
        200: {
          description: 'Comment deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Comment not found' },
      },
    },
  },
};
