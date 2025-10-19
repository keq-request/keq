import { expect, jest, test } from '@jest/globals'
import { request } from './request.js'
import { AbortException } from '~/exception/index.js'


function createMockedFetch(millisecond: number = 0): typeof fetch {
  return jest.fn<typeof fetch>((input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve, reject) => {
    let finished = false

    if (init?.signal) {
      if (init.signal.aborted) {
        console.log(`mockedFetch(${input.toString()}): already aborted`)
        reject(init.signal.reason || new DOMException('AbortError', 'AbortError'))
        return
      }

      const signal = init.signal
      signal.onabort = () => {
        if (finished) return
        finished = true
        reject(init.signal?.reason || new DOMException('AbortError', 'AbortError'))
      }
    }

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
          },
        ))
      },
      millisecond,
    )
  }))
}

test.only('abort flowController request', async () => {
  const mockedFetch = createMockedFetch(500)
  const abortListener = jest.fn()

  async function sendRequest(url: string): Promise<void> {
    await request
      .get(url)
      .option('fetchAPI', mockedFetch)
      .flowControl('abort', 'test')
      .on('abort', abortListener)
      .end()
  }

  let error: unknown = null
  void sendRequest('http://test.com/1')
    .catch((err) => error = err)

  await new Promise((resolve) => setTimeout(resolve, 50))
  await sendRequest('http://test.com/2')

  expect(error).toBeInstanceOf(AbortException)
  expect(error).toBeInstanceOf(DOMException)
  expect(mockedFetch).toBeCalledTimes(2)
  expect(abortListener).toBeCalledTimes(1)
})

test('serial flowController request', async () => {
  const mockedFetch = createMockedFetch(500)

  async function sendRequest(): Promise<void> {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('serial', 'test')
      .end()
  }

  const r1 = sendRequest()
  await new Promise((resolve) => setTimeout(resolve, 50))
  await sendRequest()

  expect(mockedFetch).toBeCalledTimes(2)
  await expect(r1).rejects.not.toThrow()
})
