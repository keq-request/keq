import { expect, jest, test } from '@jest/globals'
import { request } from '~/request'


test('abort flowController request', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => new Promise((resolve, reject) => {
    let finished = false

    if (init?.signal) {
      const signal = init.signal
      signal.onabort = () => {
        if (finished) return
        finished = true
        if (signal.reason) reject(signal.reason)
        reject(new DOMException('AbortError', 'AbortError'))
      }
    }

    // sleet 500ms
    setTimeout(
      () => {
        if (finished) return
        finished = true

        resolve(new Response(
          JSON.stringify({ code: '200' }),
          {
            headers: {
              'content-type': 'application/json',
            },
          }
        ))
      },
      100,
    )
  }))

  async function abortRequest(): Promise<void> {
    try {
      await request
        .get('http://test.com')
        .option('fetchAPI', mockedFetch)
        .flowControl('abort', 'test')
    } catch (e) {
      expect(e).toBeInstanceOf(DOMException)
      expect((e as DOMException).name).toBe('AbortError')
    }
  }

  void abortRequest()

  await request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .flowControl('abort', 'test')

  expect(mockedFetch).toBeCalledTimes(2)
})

test('serial flowController request', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => new Promise((resolve, reject) => {
    let finished = false

    if (init?.signal) {
      const signal = init.signal
      signal.onabort = () => {
        if (finished) return
        finished = true
        if (signal.reason) reject(signal.reason)
        reject(new DOMException('AbortError', 'AbortError'))
      }
    }

    // sleet 500ms
    setTimeout(
      () => {
        if (finished) return
        finished = true

        resolve(new Response(
          JSON.stringify({ code: '200' }),
          {
            headers: {
              'content-type': 'application/json',
            },
          }
        ))
      },
      100,
    )
  }))

  async function serialRequest(): Promise<void> {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('serial', 'test')
  }

  void serialRequest()

  await request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .flowControl('abort', 'test')

  expect(mockedFetch).toBeCalledTimes(2)
})
