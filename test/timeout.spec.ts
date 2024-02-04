import { expect, jest, test } from '@jest/globals'
import { request } from '~/request'


test('send get request', async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const intervalHandle = setInterval(() => {
        const endTime = Date.now()
        if (init?.signal?.aborted) {
          reject('fetch failed')
          clearInterval(intervalHandle)
          return
        }

        if (endTime - startTime > 500) {
          resolve(new Response(
            JSON.stringify({ code: '200' }),
            {
              headers: {
                'content-type': 'application/json',
              },
            }
          ))

          clearInterval(intervalHandle)
          return
        }
      }, 10)
    })
  })

  try {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .timeout(100)
  } catch (e) {
    expect(e).toMatch('fetch failed')
  }
})
