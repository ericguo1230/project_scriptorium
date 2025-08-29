import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Scriptorium API",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "user@example.com" },
            firstName: { type: "string", example: "John" },
            lastName: { type: "string", example: "Doe" },
            role: { type: "string", example: "user" },
            avatar: {
              type: "string",
              format: "uri",
              example: "https://example.com/avatar.jpg",
            },
            phoneNumber: { type: "string", example: "+1234567890" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Template: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Template Title" },
            description: { type: "string", example: "Template Description" },
            code: { type: "string", example: "console.log('Hello, World!');" },
            stdin: { type: "string", example: "input" },
            isForked: { type: "boolean", example: false },
            forkedFromId: { type: "integer", example: 1 },
            userId: { type: "integer", example: 1 },
            tamplateTags: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  tag: { type: "string", example: "python" },
                },
              },
              example: [{ id: 1, tag: "python" }],
            },
            language: { type: "string", example: "javascript" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Blog: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            title: { type: "string", example: "Blog Title" },
            description: { type: "string", example: "Blog Content" },
            userId: { type: "integer", example: 1 },
            isVisible: { type: "boolean", example: true },
            netRating: { type: "integer", example: 5 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            tags: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  tag: { type: "string" },
                },
              },
              example: [{ id: 1, tag: "tutorial" }],
            },
            links: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                },
              },
            },
          },
        },
        BlogComment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 123 },
            blogPostId: { type: "integer", example: 1 },
            content: {
              type: "string",
              example: "This is a great post! Thanks for sharing.",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CodeExecution: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 123, nullable: true },
            language: { type: "string", example: "javascript" },
            code: { type: "string", example: "console.log('Hello, World!');" },
            stdin: { type: "string", example: "input" },
            stdout: { type: "string", example: "Hello, World!" },
            stderr: { type: "string" },
            compileStdout: { type: "string" },
            compileStderr: { type: "string" },
            compileTimeMs: { type: "integer", example: 100 },
            isCompiled: { type: "boolean", example: true },
            executionTimeMs: { type: "integer", example: 50 },
            exitCode: { type: "integer", example: 0 },
            status: { type: "string", example: "completed" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: ["./src/**/route.ts"], // files containing annotations as above
};

export const openapiSpecification = swaggerJsdoc(options);
