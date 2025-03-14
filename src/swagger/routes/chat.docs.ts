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
                    image: { type: 'string' },
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
                    unreadCount: { type: 'number' },
                    lastMessage: { type: 'string' },
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
};
