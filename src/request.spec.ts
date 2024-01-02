import { expect, jest, test } from '@jest/globals'
import { Mock } from 'jest-mock'
import { request } from './request'
import { KeqRetryOn } from './types/keq-retry-on'


test('send request with basic auth', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  await request
    .get('http://test.com')
    .auth('username', 'password')

  expect(mockedFetch.mock.calls).toHaveLength(1)

  const args = mockedFetch.mock.calls[0]
  const headers = args[1]?.headers
  expect(headers).not.toBeUndefined()
  expect(headers).toBeInstanceOf(Headers)
  expect((headers as Headers).get('authorization')).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=')
})


test('send request and get Response Class', async () => {
  const res = await request
    .get('http://test.com')
    .type('json')
    .option('resolveWithFullResponse')

  expect(res.headers.get('content-type')).toEqual('application/json')
  expect(await res.json()).toEqual({ code: '200' })
})

test('send request with custom fetch API', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => Promise.resolve(new Response(
    JSON.stringify({ code: '201' }),
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )))


  const responseBody = await request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)

  expect(mockedFetch.mock.calls).toHaveLength(1)

  expect(responseBody).toEqual({ code: '201' })
})


test('send request retry twice', async () => {
  const mockedFetch = jest.fn()
  const retryOn = jest.fn<KeqRetryOn>(() => true)

  await request
    .get('http://test.com')
    .retry(2, 0, retryOn)
    .option('fetchAPI', mockedFetch)

  expect(mockedFetch.mock.calls).toHaveLength(3)

  expect(retryOn.mock.calls.length).toBe(2)
  expect(retryOn.mock.calls[0][0]).toBe(0)
  expect(retryOn.mock.calls[1][0]).toBe(1)
})

test('throw error when fetch failed', async () => {
  const mockedFetch = jest.fn(() => {
    throw new Error('fetch failed')
  })

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)

  await expect(() => keq.end()).rejects.toThrow('fetch failed')
})
