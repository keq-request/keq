import { describe, expect, test } from '@jest/globals'
import { throwException } from './index.js'
import { createRequest, RequestException } from 'keq'
import { createMockFetch } from 'keq-test'


describe('throwException()', () => {
  const request = createRequest()
  request.use(throwException((ctx) => {
    if (ctx.response) {
      if (ctx.response.status === 400) {
        throw new RequestException(ctx.response.status, ctx.response.statusText, false)
      } else if (ctx.response.status === 500) {
        throw new RequestException(ctx.response.status, ctx.response.statusText)
      }
    }
  }))

  test('should handle 200 status successfully', async () => {
    const fetchAPI = createMockFetch({
      response: {
        status: 200,
        statusText: 'Ok',
        body: '{}',
      },
    })

    await expect(
      request
        .get('https://example.com')
        .option('fetchAPI', fetchAPI)
        .retry(1, 0, (attempt, error) => {
          if (error) return true
          return false
        }),
    ).resolves.toEqual({})

    expect(fetchAPI).toHaveBeenCalledTimes(1)
  })

  test('should throw RequestException for 400 status and not retry', async () => {
    const fetchAPI = createMockFetch({
      response: {
        status: 400,
        statusText: 'Bad Request',
      },
    })

    await expect(
      request
        .get('https://example.com')
        .option('fetchAPI', fetchAPI)
        .retry(1, 0, (attempt, error) => {
          if (error) return true
          return false
        }),
    ).rejects.toThrow(RequestException)

    expect(fetchAPI).toHaveBeenCalledTimes(2)
  })

  test('should throw Error for 500 status and retry', async () => {
    const fetchAPI = createMockFetch({
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    })

    await expect(
      request
        .get('https://example.com')
        .option('fetchAPI', fetchAPI)
        .retry(1, 0, (attempt, error) => {
          if (error) return true
          return false
        }),
    ).rejects.toThrow(Error)

    expect(fetchAPI).toHaveBeenCalledTimes(2)
  })

  test('should throw Error for network errors and retry', async () => {
    const fetchAPI = createMockFetch({ error: new Error('Network Error') })

    await expect(
      request
        .get('https://example.com')
        .option('fetchAPI', fetchAPI)
        .retry(1, 0),
    ).rejects.toThrow(Error)

    expect(fetchAPI).toHaveBeenCalledTimes(2)
  })
})
