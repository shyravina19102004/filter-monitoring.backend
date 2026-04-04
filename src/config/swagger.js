const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Filter Monitoring API',
      version: '1.0.0',
      description: 'API for monitoring filter elements in industrial equipment',
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'integer', example: 400 },
                message: { type: 'string', example: 'Неверный формат данных' },
                stack: { type: 'string', example: '...' },
              },
            },
          },
        },
        Role: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'admin' },
            description: { type: 'string', example: 'Администратор системы' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Permission: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'users:read' },
            resource: { type: 'string', example: 'users' },
            action: { type: 'string', example: 'read' },
          },
        },
        Log: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', nullable: true, example: 5 },
            action: { type: 'string', example: 'CREATE_USER' },
            module: { type: 'string', example: 'users' },
            ipAddress: { type: 'string', example: '127.0.0.1' },
            userAgent: { type: 'string', example: 'Mozilla/5.0' },
            status: { type: 'string', enum: ['success', 'error', 'warning'], example: 'success' },
            details: { type: 'object', example: { method: 'POST', url: '/api/users' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
      url: '/api-docs/swagger.json?_=' + Date.now(),
    },
  }));
};