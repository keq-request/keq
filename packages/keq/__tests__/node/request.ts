/* eslint-disable @typescript-eslint/no-empty-object-type */
import { createRequest } from '~/index.js'

import type { KeqDefaultOperation, KeqApiSchema } from '~/request/types/api-schema/index.js'


interface TestModule extends KeqApiSchema {
  'http://test.com': {
    get: {
      requestParams: {}
      requestQuery: {
        q: string
      }
      requestHeaders: KeqDefaultOperation['requestHeaders']
      requestBody: {}
      responseBody: {
        data: 'test get'
      }
    }
    post: {
      requestParams: {}
      requestQuery: {
        q: string
      }
      requestHeaders: {
        'x-test': 'test'
      }
      requestBody: {
        id: number
        name: string
        file: Buffer
      }
      responseBody: {
        data: 'test post'
      }
    }
  }
  'http://example.com': {
    get: {
      requestParams: {}
      requestQuery: {}
      requestHeaders: KeqDefaultOperation['requestHeaders']
      requestBody: {}
      responseBody: {
        data: 'example get'
      }
    }
  }
}

export const request = createRequest<TestModule>()
