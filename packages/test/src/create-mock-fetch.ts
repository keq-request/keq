import { Mock } from 'jest-mock'
import { jest } from '@jest/globals'
import { sleep } from './sleep.js'
import { createResponse, CreateResponseOptions } from './create-response.js'

export interface MockFetchSuccessOptions {
  response?: CreateResponseOptions
  delay?: number
}

export interface MockFetchErrorOptions {
  error: Error
  delay?: number
}

export type MockFetchOptions = MockFetchSuccessOptions | MockFetchErrorOptions

export const createMockFetch = (options: MockFetchOptions = {}): Mock<typeof fetch> => {
  if ('error' in options && options.error) {
    const { error, delay = 0 } = options
    return jest.fn(async () => {
      if (delay > 0) {
        await sleep(delay)
      }
      throw error
    }) as unknown as Mock<typeof fetch>
  }

  const { delay = 0 } = options as MockFetchSuccessOptions

  const createResponseOptions: CreateResponseOptions = {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
    body: '{"message":"Hello World"}',
  }

  if (options && 'response' in options && options.response) {
    Object.assign(createResponseOptions, options.response)
  }

  return jest.fn<typeof fetch>(async () => {
    if (delay > 0) await sleep(delay)
    return createResponse(createResponseOptions)
  })
}
