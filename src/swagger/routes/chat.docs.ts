export const chatRoutesDocs = {
  '/api/chats': {
    get: {
      tags: ['Chats'],
      summary: 'Get all user chats',
      security: [{ bearerAuth: [] }],
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
                    chatId: { 
                      type: 'string',
                      example: '66c290f0f0f0f0f0f0f0f0f0'
                    },
                    chatName: { 
                      type: 'string',
                      example: 'hapoel'
                    },
                    unreadCount: { 
                      type: 'number',
                      example: 0
                    },
                    isGroupChat: { 
                      type: 'boolean',
                      example: true
                    },
                    groupName: { 
                      type: 'string',
                      example: 'hapoel'
                    },
                    image: { 
                      type: 'string',
                      example: 'uploads/1740257907466.jpg'
                    }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' }
      }
    }
  },
  '/api/chats/{chatId}/read': {
    put: {
      tags: ['Chats'],
      summary: 'Mark chat messages as read',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'chatId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: { description: 'Messages marked as read' },
        401: { description: 'Unauthorized' },
        404: { description: 'Chat not found' }
      }
    }
  },
  '/api/chats/messages/unread': {
    get: {
      tags: ['Chats'],
      summary: 'Get unread messages',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'List of unread messages' },
        401: { description: 'Unauthorized' }
      }
    }
  },
  '/api/chats/{chatId}': {
    get: {
      tags: ['Chats'],
      summary: 'Get chat messages',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'chatId',
          required: true,
          schema: { type: 'string' }
        }
      ],
      responses: {
        200: { description: 'Chat messages' },
        401: { description: 'Unauthorized' },
        404: { description: 'Chat not found' }
      }
    }
  }
}; 