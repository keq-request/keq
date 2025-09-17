import { expect, test } from '@jest/globals'
import { OpenAPIV3 } from 'openapi-types'
import { removeUnnecessaryRef } from './remove-unnecessary-ref'


test('removeUnnecessaryRef', async () => {
  const RequestBody: OpenAPIV3.RequestBodyObject = {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      },
    },

  }

  const Response: OpenAPIV3.ResponseObject = {
    description: '',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
      },
    },

  }
  const swagger: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
      title: 'Test',
      version: '1.0.0',
    },
    paths: {
      '/test': {
        post: {
          requestBody: {
            $ref: '#/components/requestBodies/RequestBody',
          },
          responses: {
            200: {
              $ref: '#/components/responses/Response',
            },
          },
        },
      },
    },
    components: {
      requestBodies: {
        RequestBody,
      },
      responses: {
        Response,
      },
    },
  }

  removeUnnecessaryRef(swagger)

  expect(swagger.paths['/test']!.post!.requestBody).toEqual(RequestBody)
  expect(swagger.paths['/test']!.post!.responses[200]).toEqual(Response)
})

