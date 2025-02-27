import swaggerJsdoc from 'swagger-jsdoc';
import { ROUTES_DOCS } from './routesDocs';

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
    paths: ROUTES_DOCS
  },
  apis: [],
};

export const specs = swaggerJsdoc(options); 