import { expect, jest, test } from '@jest/globals'
import { request } from './request.js'
import { MutexException } from '~/exception/index.js'
import { createMockFetch, sleep } from '@keq-request/test'


test('mutex flowControl rejects duplicate in-flight request', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })

  async function sendRequest(): Promise<void> {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('mutex', 'test')
  }

  let error: unknown = undefined
  void sendRequest()

  await sleep(50)

  await sendRequest()
    .catch((err) => {
      error = err
    })

  expect(mockedFetch).toHaveBeenCalledTimes(1)
  expect(error).toBeInstanceOf(MutexException)
})

test('mutex flowControl allows sequential requests with same key', async () => {
  const mockedFetch = createMockFetch({ delay: 100 })

  async function sendRequest(): Promise<void> {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('mutex', 'test-seq')
  }

  await sendRequest()
  await sendRequest()

  expect(mockedFetch).toHaveBeenCalledTimes(2)
})

test('mutex flowControl allows concurrent requests with different keys', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })

  const results = await Promise.allSettled([
    request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('mutex', 'key-a'),
    request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('mutex', 'key-b'),
  ])

  expect(results[0].status).toBe('fulfilled')
  expect(results[1].status).toBe('fulfilled')
  expect(mockedFetch).toHaveBeenCalledTimes(2)
})

test('mutex flowControl cleans up key after request failure', async () => {
  const failingFetch = jest.fn(async () => {
    await sleep(50)
    throw new Error('Network error')
  }) as any

  const catchFn = jest.fn()
  await request
    .get('http://test.com')
    .option('fetchAPI', failingFetch)
    .flowControl('mutex', 'test-cleanup')
    .catch(catchFn)

  expect(catchFn).toHaveBeenCalled()

  const successFetch = createMockFetch({ delay: 50 })
  await request
    .get('http://test.com')
    .option('fetchAPI', successFetch)
    .flowControl('mutex', 'test-cleanup')

  expect(successFetch).toHaveBeenCalledTimes(1)
})
