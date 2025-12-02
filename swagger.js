const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Todo List API',
    version: '1.0.0',
    description: '基于 Koa 框架的持久化 Todo List RESTful API 服务',
    contact: {
      name: 'API Support'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '开发服务器'
    }
  ],
  components: {
    schemas: {
      Todo: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: '任务唯一标识',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          title: {
            type: 'string',
            description: '任务标题',
            example: '学习 Koa 框架'
          },
          completed: {
            type: 'boolean',
            description: '是否完成',
            example: false
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '创建时间',
            example: '2025-12-02T10:30:00.000Z'
          }
        }
      },
      CreateTodoRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            description: '任务标题',
            example: '完成作业'
          },
          completed: {
            type: 'boolean',
            description: '是否完成',
            default: false,
            example: false
          }
        }
      },
      UpdateTodoRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '任务标题',
            example: '更新后的标题'
          },
          completed: {
            type: 'boolean',
            description: '是否完成',
            example: true
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: '错误信息'
              },
              code: {
                type: 'string',
                description: '错误代码'
              }
            }
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: ['./routes.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
