import { expect, jest, test } from '@jest/globals'
import { request } from './request.js'
import { AbortException } from '~/exception/index.js'
import { createMockFetch, sleep } from '@keq-request/test'


test('abort flowController request', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  const abortListener = jest.fn()

  async function sendRequest(url: string): Promise<void> {
    await request
      .get(url)
      .option('fetchAPI', mockedFetch)
      .flowControl('abort', 'test')
      .on('abort', abortListener)
  }

  let error: unknown = undefined
  void sendRequest('http://test.com/1')
    .catch((err) => {
      error = err
    })

  await sleep(50)
  await new Promise((resolve) => setTimeout(resolve, 50))

  await sendRequest('http://test.com/2')

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(abortListener).toHaveBeenCalledTimes(1)
  expect(error).toBeInstanceOf(AbortException)
  expect(error).toBeInstanceOf(DOMException)
})

test('serial flowController request', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })

  async function sendRequest(): Promise<void> {
    await request
      .get('http://test.com')
      .option('fetchAPI', mockedFetch)
      .flowControl('serial', 'test')
  }

  const catchFn = jest.fn()
  void sendRequest()
    .catch(catchFn)

  await sleep(50)
  await sendRequest()

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(catchFn).not.toHaveBeenCalled()
})
