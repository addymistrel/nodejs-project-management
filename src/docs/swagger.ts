const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Project File Processing API',
    version: '1.0.0',
    description: 'A project-scoped API for managing projects, files, and background ZIP jobs.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Version 1 API',
    },
  ],
  tags: [
    {
      name: 'Projects',
      description: 'Project management operations',
    },
    {
      name: 'Files',
      description: 'Project file operations',
    },
    {
      name: 'Jobs',
      description: 'Background processing operations',
    },
    {
      name: 'Auth',
      description: 'User authentication operations',
    },
  ],
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Create a user account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 150 },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, maxLength: 128 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created and JWT issued' },
          '409': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate and receive a JWT',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'JWT issued' },
          '401': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh JWT tokens',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: {
                    type: 'string',
                    description: 'Valid refresh token',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'New access and refresh tokens issued' },
          '401': { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Projects'],
        summary: 'Check API health',
        responses: {
          '200': {
            description: 'The API is available',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data'],
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      type: 'object',
                      required: ['status'],
                      properties: {
                        status: {
                          type: 'string',
                          example: 'ok',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        parameters: [
          { $ref: '#/components/parameters/Limit' },
          { $ref: '#/components/parameters/PageNumber' },
        ],
        responses: {
          '200': { description: 'Paginated projects' },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateProjectRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Project created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessProjectResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
        },
      },
    },
    '/projects/{projectId}': {
      parameters: [
        {
          $ref: '#/components/parameters/ProjectId',
        },
      ],
      get: {
        tags: ['Projects'],
        summary: 'Get project details',
        responses: {
          '200': {
            description: 'Project details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessProjectDetailsResponse',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
      patch: {
        tags: ['Projects'],
        summary: 'Update a project',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProjectRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated project',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessProjectResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
      delete: {
        tags: ['Projects'],
        summary: 'Delete a project and its related data',
        responses: {
          '200': {
            description: 'Project deleted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessageResponse',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
    },
    '/projects/{projectId}/files': {
      parameters: [
        {
          $ref: '#/components/parameters/ProjectId',
        },
      ],
      post: {
        tags: ['Files'],
        summary: 'Upload files to a project',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['files'],
                properties: {
                  files: {
                    type: 'array',
                    minItems: 1,
                    maxItems: 10,
                    items: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Files uploaded',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessUploadFilesResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
          '413': {
            description: 'Uploaded file is too large',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Files'],
        summary: 'List files in a project',
        parameters: [
          { $ref: '#/components/parameters/Limit' },
          { $ref: '#/components/parameters/PageNumber' },
        ],
        responses: {
          '200': {
            description: 'Project files',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessFileListResponse',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
    },
    '/projects/{projectId}/files/{fileId}': {
      parameters: [
        {
          $ref: '#/components/parameters/ProjectId',
        },
        {
          $ref: '#/components/parameters/FileId',
        },
      ],
      delete: {
        tags: ['Files'],
        summary: 'Delete a project file',
        responses: {
          '200': {
            description: 'File deleted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessMessageResponse',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
    },
    '/projects/{projectId}/files/{fileId}/download': {
      parameters: [
        {
          $ref: '#/components/parameters/ProjectId',
        },
        {
          $ref: '#/components/parameters/FileId',
        },
      ],
      get: {
        tags: ['Files'],
        summary: 'Download a project file',
        responses: {
          '200': {
            description: 'File contents',
            content: {
              'application/octet-stream': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
    },
    '/projects/{projectId}/jobs/zip': {
      parameters: [
        {
          $ref: '#/components/parameters/ProjectId',
        },
      ],
      post: {
        tags: ['Jobs'],
        summary: 'Create a ZIP compression job',
        description: 'The ZIP is created asynchronously by a Worker Thread.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateZipJobRequest',
              },
            },
          },
        },
        responses: {
          '202': {
            description: 'ZIP job accepted',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessJobResponse',
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/BadRequest',
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
    },
    '/projects/{projectId}/jobs': {
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      get: {
        tags: ['Jobs'],
        summary: 'List project jobs',
        parameters: [
          { $ref: '#/components/parameters/Limit' },
          { $ref: '#/components/parameters/PageNumber' },
        ],
        responses: {
          '200': { description: 'Paginated project jobs' },
        },
      },
    },
    '/projects/{projectId}/jobs/{jobId}': {
      parameters: [
        {
          $ref: '#/components/parameters/ProjectId',
        },
        {
          $ref: '#/components/parameters/JobId',
        },
      ],
      get: {
        tags: ['Jobs'],
        summary: 'Get ZIP job status',
        responses: {
          '200': {
            description: 'Current job status',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessJobResponse',
                },
              },
            },
          },
          '404': {
            $ref: '#/components/responses/NotFound',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    parameters: {
      Limit: {
        name: 'limit',
        in: 'query',
        description: 'Page size: maximum number of items to return',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      PageNumber: {
        name: 'pageNumber',
        in: 'query',
        description: 'Page number, starting at 1',
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
      },
      ProjectId: {
        name: 'projectId',
        in: 'path',
        required: true,
        description: 'Project identifier',
        schema: {
          type: 'integer',
          format: 'int64',
          minimum: 1,
        },
        example: 1,
      },
      FileId: {
        name: 'fileId',
        in: 'path',
        required: true,
        description: 'File identifier',
        schema: {
          type: 'integer',
          format: 'int64',
          minimum: 1,
        },
        example: 1,
      },
      JobId: {
        name: 'jobId',
        in: 'path',
        required: true,
        description: 'Job identifier',
        schema: {
          type: 'integer',
          format: 'int64',
          minimum: 1,
        },
        example: 1,
      },
    },
    schemas: {
      CreateProjectRequest: {
        type: 'object',
        required: ['name'],
        additionalProperties: false,
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 150,
            example: 'Video Assets Processing',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 5000,
            example: 'Handles raw media uploads and compression',
          },
        },
      },
      UpdateProjectRequest: {
        type: 'object',
        minProperties: 1,
        maxProperties: 2,
        additionalProperties: false,
        properties: {
          name: {
            type: 'string',
            minLength: 1,
            maxLength: 150,
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 5000,
          },
        },
      },
      Project: {
        type: 'object',
        required: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'integer',
            format: 'int64',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'Video Assets Processing',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Handles raw media uploads and compression',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ProjectDetails: {
        allOf: [
          {
            $ref: '#/components/schemas/Project',
          },
          {
            type: 'object',
            required: ['filesCount', 'jobsCount'],
            properties: {
              filesCount: {
                type: 'integer',
                minimum: 0,
                example: 3,
              },
              jobsCount: {
                type: 'integer',
                minimum: 0,
                example: 1,
              },
            },
          },
        ],
      },
      File: {
        type: 'object',
        required: ['fileId', 'projectId', 'name', 'size', 'type', 'uploadedAt', 'isOutput'],
        properties: {
          fileId: {
            type: 'integer',
            format: 'int64',
          },
          projectId: {
            type: 'integer',
            format: 'int64',
          },
          name: {
            type: 'string',
            example: 'video.mp4',
          },
          size: {
            type: 'integer',
            format: 'int64',
            minimum: 0,
          },
          type: {
            type: 'string',
            example: 'video/mp4',
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time',
          },
          isOutput: {
            type: 'boolean',
          },
        },
      },
      UploadFilesResponse: {
        type: 'object',
        required: ['projectId', 'files'],
        properties: {
          projectId: {
            type: 'integer',
            format: 'int64',
          },
          files: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/File',
            },
          },
        },
      },
      CreateZipJobRequest: {
        type: 'object',
        required: ['fileIds'],
        additionalProperties: false,
        properties: {
          fileIds: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: {
              type: 'integer',
              format: 'int64',
              minimum: 1,
            },
            example: [1, 2],
          },
        },
      },
      Job: {
        type: 'object',
        required: ['jobId', 'projectId', 'type', 'status', 'progress', 'createdAt'],
        properties: {
          jobId: {
            type: 'integer',
            format: 'int64',
          },
          projectId: {
            type: 'integer',
            format: 'int64',
          },
          type: {
            type: 'string',
            enum: ['ZIP_COMPRESSION'],
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
          },
          progress: {
            type: 'integer',
            minimum: 0,
            maximum: 100,
          },
          outputFileId: {
            type: 'integer',
            format: 'int64',
          },
          error: {
            type: 'string',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          startedAt: {
            type: 'string',
            format: 'date-time',
          },
          completedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      SuccessProjectResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            $ref: '#/components/schemas/Project',
          },
        },
      },
      SuccessProjectDetailsResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            $ref: '#/components/schemas/ProjectDetails',
          },
        },
      },
      SuccessUploadFilesResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            $ref: '#/components/schemas/UploadFilesResponse',
          },
        },
      },
      SuccessFileListResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            required: ['items', 'total', 'limit', 'pageNumber'],
            properties: {
              items: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/File',
                },
              },
              total: {
                type: 'integer',
                minimum: 0,
              },
              limit: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
              },
              pageNumber: {
                type: 'integer',
                minimum: 1,
              },
            },
          },
        },
      },
      SuccessJobResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            $ref: '#/components/schemas/Job',
          },
        },
      },
      SuccessMessageResponse: {
        type: 'object',
        required: ['success', 'data'],
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            required: ['message'],
            properties: {
              message: {
                type: 'string',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'error'],
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Project not found',
          },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'string',
            example: 'Project not found',
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Invalid request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
    },
  },
} as const;

export { swaggerDocument };
