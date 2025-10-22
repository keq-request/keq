import { KeqContext, KeqMiddleware } from 'keq'
import { Mock } from 'jest-mock'
import { jest } from '@jest/globals'
import { createMockFetch, MockFetchOptions } from './create-mock-fetch.js'

export function createFetchMiddleware(options: MockFetchOptions = {}): Mock<KeqMiddleware> {
  return jest.fn(async (context: KeqContext): Promise<void> => {
    const fetchAPI = createMockFetch(options)
    const response = await fetchAPI(...context.request.toFetchArguments())
    context.res = response
  })
}
