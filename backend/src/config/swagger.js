'use strict';
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management System API',
      version: '1.0.0',
      description:
        'Production-ready RESTful API for managing tasks, users, and documents with JWT authentication.',
      contact: {
        name: 'Task Manager Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            email: { type: 'string', example: 'user@example.com' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Implement login page' },
            description: { type: 'string', example: 'Build the login form with validation' },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'TODO' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'MEDIUM' },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            assignedTo: { $ref: '#/components/schemas/User' },
            createdBy: { $ref: '#/components/schemas/User' },
            documents: { type: 'array', items: { $ref: '#/components/schemas/Document' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            filename: { type: 'string' },
            originalName: { type: 'string' },
            mimetype: { type: 'string', example: 'application/pdf' },
            size: { type: 'number', example: 204800 },
            task: { type: 'string' },
            uploadedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', nullable: true },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            data: { type: 'object', nullable: true, example: null },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
