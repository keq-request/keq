/* eslint-disable @typescript-eslint/ban-types */
import { createRequest } from '~/create-request.js'
import { KeqBaseOperation, KeqOperations } from '~/types/keq-operation.js'


interface TestModule extends KeqOperations {
  'http://test.com': {
    get: {
      requestParams: {}
      requestQuery: {
        q: string
      }
      requestHeaders: KeqBaseOperation['requestHeaders']
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
      requestHeaders: KeqBaseOperation['requestHeaders']
      requestBody: {}
      responseBody: {
        data: 'example get'
      }
    }
  }
}

export const request = createRequest<TestModule>()
