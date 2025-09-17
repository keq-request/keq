import { afterAll, beforeAll, beforeEach, jest } from '@jest/globals'
// import { TextEncoder, TextDecoder } from 'util'


// https://github.com/inrupt/solid-client-authn-js/issues/1676
// global.TextEncoder = TextEncoder
// global.TextDecoder = TextDecoder as any


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => Promise.resolve(new Response(
  JSON.stringify({ code: '200' }),
  {
    headers: {
      'content-type': 'application/json',
    },
  },
)))

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
