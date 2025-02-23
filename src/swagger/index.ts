import swaggerJsdoc from 'swagger-jsdoc';
import { chatRoutesDocs } from './routes/chat.docs';
import { groupRoutesDocs } from './routes/group.docs';
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat API',
      version: '1.0.0',
      description: 'API documentation for the Chat application',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths: {
      ...chatRoutesDocs,
      ...groupRoutesDocs
    }
  },
  apis: [],
};

export const specs = swaggerJsdoc(options); 