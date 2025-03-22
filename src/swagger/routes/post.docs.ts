export const postRoutesDocs = {
  '/posts/explore': {
    get: {
      tags: ['Posts'],
      summary: 'Get explore posts',
      description: 'Requires authentication. Returns a paginated list of explore posts.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'page',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number for pagination',
        },
      ],
      responses: {
        200: {
          description: 'List of explore posts',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    content: { type: 'string' },
                    image: { type: 'string' },
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
      },
    },
  },
  '/posts/user/{userId}': {
    get: {
      tags: ['Posts'],
      summary: 'Get posts by user ID',
      description:
        'Requires authentication. Returns a paginated list of posts by the specified user.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the user to get posts for',
        },
        {
          in: 'query',
          name: 'page',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number for pagination',
        },
      ],
      responses: {
        200: {
          description: 'List of posts by the user',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    content: { type: 'string' },
                    image: { type: 'string' },
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
        404: { description: 'User not found' },
      },
    },
  },
  '/posts/group/{groupId}': {
    get: {
      tags: ['Posts'],
      summary: 'Get posts by group ID',
      description:
        'Requires authentication. Returns a paginated list of posts by the specified group.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'groupId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the group to get posts for',
        },
        {
          in: 'query',
          name: 'page',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number for pagination',
        },
      ],
      responses: {
        200: {
          description: 'List of posts by the group',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string' },
                    content: { type: 'string' },
                    image: { type: 'string' },
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
        404: { description: 'Group not found' },
      },
    },
  },
  '/posts/{postId}': {
    get: {
      tags: ['Posts'],
      summary: 'Get post by ID',
      description: 'Requires authentication. Returns the details of the specified post.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'postId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the post to get details for',
        },
      ],
      responses: {
        200: {
          description: 'Post details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  content: { type: 'string' },
                  image: { type: 'string' },
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
        401: { description: 'Unauthorized' },
        404: { description: 'Post not found' },
      },
    },
    put: {
      tags: ['Posts'],
      summary: 'Update post by ID',
      description: 'Requires authentication. Updates the details of the specified post.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'postId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the post to update',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                content: { type: 'string' },
                image: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Post updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  content: { type: 'string' },
                  image: { type: 'string' },
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
    delete: {
      tags: ['Posts'],
      summary: 'Delete post by ID',
      description: 'Requires authentication. Deletes the specified post.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'postId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the post to delete',
        },
      ],
      responses: {
        200: {
          description: 'Post deleted successfully',
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
        404: { description: 'Post not found' },
      },
    },
  },
  '/posts': {
    post: {
      tags: ['Posts'],
      summary: 'Create a new post',
      description:
        'Requires authentication. Creates a new post with the current user as the author.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                content: { type: 'string' },
                image: { type: 'string', format: 'binary' },
                groupId: { type: 'string' },
              },
              required: ['content'],
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Post created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  content: { type: 'string' },
                  image: { type: 'string' },
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
      },
    },
  },
  '/posts/toggle-like/{postId}': {
    post: {
      tags: ['Posts'],
      summary: 'Toggle like on a post',
      description: 'Requires authentication. Toggles the like status of the specified post.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'postId',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the post to like/unlike',
        },
      ],
      responses: {
        200: {
          description: 'Post like status toggled successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  content: { type: 'string' },
                  image: { type: 'string' },
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
        401: { description: 'Unauthorized' },
        404: { description: 'Post not found' },
      },
    },
  },
};
