import { Mock } from 'jest-mock'
import { jest } from '@jest/globals'
import { sleep } from './sleep.js'

export interface MockFetchSuccessOptions {
  status?: number
  statusText?: string
  body?: string
  delay?: number
  headers?: HeadersInit
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

  const {
    status = 200,
    statusText = 'OK',
    body = '{"message":"Hello World"}',
    delay = 0,
    headers = { 'Content-Type': 'application/json' },
  } = options as MockFetchSuccessOptions

  return jest.fn(async () => {
    if (delay > 0) {
      await sleep(delay)
    }
    return new Response(body, {
      status,
      statusText,
      headers,
    })
  }) as unknown as Mock<typeof fetch>
}
