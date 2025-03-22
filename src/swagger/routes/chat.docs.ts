export const chatRoutesDocs = {
  '/chats': {
    get: {
      tags: ['Chats'],
      summary: 'Get all user chats',
      description: 'Requires authentication. User ID is extracted from the JWT token.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'query',
          name: 'isGroupChat',
          schema: {
            type: 'boolean',
          },
          description: 'Filter for group chats only',
        },
      ],
      responses: {
        200: {
          description: 'List of user chats',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    chatId: { type: 'string' },
                    chatName: { type: 'string' },
                    unreadCount: { type: 'number' },
                    isGroupChat: { type: 'boolean' },
                    groupName: { type: 'string' },
                    groupId: { type: 'string' },
                    image: { type: 'string' },
                    lastMessage: {
                      type: 'object',
                      properties: {
                        messageId: { type: 'string' },
                        content: { type: 'string' },
                        sender: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            username: { type: 'string' },
                          },
                        },
                        timestamp: { type: 'string', format: 'date-time' },
                        formattedTime: { type: 'string' },
                        isRead: { type: 'boolean' },
                        read: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                    },
                    participants: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' },
                          username: { type: 'string' },
                          picture: { type: 'string' },
                        },
                      },
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
  },
  '/chats/{chatId}/read': {
    put: {
      tags: ['Chats'],
      summary: 'Mark chat messages as read',
      description: 'Requires authentication. User ID is extracted from the JWT token.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'chatId',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Messages marked as read',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  result: { type: 'object' },
                },
              },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Chat not found' },
      },
    },
  },
  '/chats/messages/unread': {
    get: {
      tags: ['Chats'],
      summary: 'Get unread messages',
      description: 'Requires authentication. User ID is extracted from the JWT token.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of unread messages',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    chatId: { type: 'string' },
                    chatName: { type: 'string' },
                    unreadCount: { type: 'number' },
                    isGroupChat: { type: 'boolean' },
                    groupName: { type: 'string' },
                    participants: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' },
                          username: { type: 'string' },
                        },
                      },
                    },
                    lastMessage: {
                      type: 'object',
                      properties: {
                        messageId: { type: 'string' },
                        content: { type: 'string' },
                        sender: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            username: { type: 'string' },
                          },
                        },
                        timestamp: { type: 'string', format: 'date-time' },
                        formattedTime: { type: 'string' },
                        isRead: { type: 'boolean' },
                        read: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
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
  },
  '/chats/{chatId}': {
    get: {
      tags: ['Chats'],
      summary: 'Get chat messages',
      description: 'Requires authentication. User ID is extracted from the JWT token.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'chatId',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Chat messages',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    messageId: { type: 'string' },
                    content: { type: 'string' },
                    sender: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        username: { type: 'string' },
                      },
                    },
                    timestamp: { type: 'string' },
                    formattedTime: { type: 'string' },
                    isRead: { type: 'boolean' },
                    read: {
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
        404: {
          description: 'Chat not found',
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
      },
    },
  },
  '/chats/ai/suggestion': {
    post: {
      tags: ['Chats'],
      summary: 'Get AI suggestion for message',
      description: 'Requires authentication. Returns an AI-generated suggestion based on the provided prompt.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['prompt'],
              properties: {
                prompt: {
                  type: 'string',
                  description: 'The prompt for generating a suggestion',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'AI suggestion',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  suggestion: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: 'Invalid input' },
        401: { description: 'Unauthorized' },
        500: { description: 'Internal server error' },
      },
    },
  },
};
