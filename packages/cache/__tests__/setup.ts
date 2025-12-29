import 'isomorphic-fetch'
import 'fake-indexeddb/auto'
import { afterAll, beforeAll, beforeEach, jest } from '@jest/globals'
import { createMockFetch } from '@keq-request/test'


const mockedFetch = createMockFetch({
  response: {
    body: JSON.stringify({ code: '200' }),
    headers: {
      'content-type': 'application/json',
    },
  },
})

const unMockedFetch = global.fetch

beforeAll(() => {
  global.fetch = mockedFetch as unknown as typeof fetch
})

afterAll(() => {
  global.fetch = unMockedFetch
})

beforeEach(() => {
  mockedFetch.mockClear()
})
