import { expect, jest, test } from '@jest/globals'
import { request, KeqRetryOn } from '../src/index'


test('send request retry twice', async () => {
  const mockedFetch = jest.fn()
  const retryOn = jest.fn<KeqRetryOn>(() => true)
  const mockedListener = jest.fn()

  await request
    .get('http://test.com')
    .retry(2, 0, retryOn)
    .option('fetchAPI', mockedFetch)
    .on('retry', mockedListener)

  expect(mockedFetch.mock.calls).toHaveLength(3)
  expect(mockedListener.mock.calls).toHaveLength(2)

  expect(retryOn.mock.calls.length).toBe(2)
  expect(retryOn.mock.calls[0][0]).toBe(0)
  expect(retryOn.mock.calls[1][0]).toBe(1)
})

test('send request retry once', async () => {
  const mockedFetch = jest.fn()

  await request
    .get('http://test.com')
    .retry(2, 0)
    .option('fetchAPI', mockedFetch)

  expect(mockedFetch.mock.calls).toHaveLength(1)
})
