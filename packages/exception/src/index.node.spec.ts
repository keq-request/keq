import { expect, jest, test } from '@jest/globals'
import { throwException } from './index.js'
import { RequestException } from './exception.js'
import { Mock } from 'node:test'
import { createRequest } from 'keq'


test('throwException()', async () => {
  const fetchAPI200 = jest.fn(async () => new Response('{}', {
    status: 200,
    statusText: 'Ok',
    headers: {
      'Content-Type': 'application/json',
    },
  })) as unknown as Mock<typeof fetch>

  const fetchAPI400 = jest.fn(async () => new Response('{"message":"error"}', {
    status: 400,
    statusText: 'Bad Request',
    headers: {
      'Content-Type': 'application/json',
    },
  })) as unknown as Mock<typeof fetch>

  const fetchAPI500 = jest.fn(async () => new Response('{"message":"error"}', {
    status: 500,
    statusText: 'Internal Server Error',
    headers: {
      'Content-Type': 'application/json',
    },
  })) as unknown as Mock<typeof fetch>

  const fetchAPIError = jest.fn(async () => {
    throw new Error('Network Error')
  }) as unknown as Mock<typeof fetch>

  const request = createRequest()

  request
    .use(throwException(async (ctx) => {
      if (ctx.response) {
        if (ctx.response.status === 400) {
          throw new RequestException(ctx.response.status, ctx.response.statusText, false)
        } else if (ctx.response.status === 500) {
          throw new RequestException(ctx.response.status, ctx.response.statusText)
        }
      }
    }))

  await expect(
    request
      .get('https://example.com')
      .option('fetchAPI', fetchAPI400)
      .retry(1, 0, (attempt, error) => {
        if (error) return true
        return false
      }),
  ).rejects.toThrow(RequestException)

  await expect(
    request
      .get('https://example.com')
      .option('fetchAPI', fetchAPI500)
      .retry(1, 0, (attempt, error) => {
        if (error) return true
        return false
      }),
  ).rejects.toThrow(Error)

  await expect(
    request
      .get('https://example.com')
      .option('fetchAPI', fetchAPIError)
      .retry(1, 0),
  ).rejects.toThrow(Error)

  await expect(
    request
      .get('https://example.com')
      .option('fetchAPI', fetchAPI200)
      .retry(1, 0, (attempt, error) => {
        if (error) return true
        return false
      }),
  ).resolves.toEqual({})

  expect(fetchAPI200).toBeCalledTimes(1)
  expect(fetchAPI400).toBeCalledTimes(1)
  expect(fetchAPI500).toBeCalledTimes(2)
  expect(fetchAPIError).toBeCalledTimes(2)
})
