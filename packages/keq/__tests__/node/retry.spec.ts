import { expect, jest, test } from '@jest/globals'
import { KeqRetryOn } from '~~/src/index.js'
import { request } from './request.js'


test('send request retry twice', async () => {
  const mockedFetch = jest.fn()
  const retryOn = jest.fn<KeqRetryOn>(() => true)
  const mockedListener = jest.fn()

  await request
    .get('http://test.com')
    .retry(2, 10, retryOn)
    .option('fetchAPI', mockedFetch)
    .on('retry', mockedListener)

  expect(mockedFetch.mock.calls).toHaveLength(3)
  expect(mockedListener.mock.calls).toHaveLength(2)

  expect(retryOn.mock.calls.length).toBe(2)
  expect(retryOn.mock.calls[0][0]).toBe(0)
  expect(retryOn.mock.calls[1][0]).toBe(1)
  expect((retryOn.mock.calls[1][2] as any).retry?.delay).toBe(10)
})

test('send request retry once', async () => {
  const mockedFetch = jest.fn()

  await request
    .get('http://test.com')
    .retry(2, 0)
    .option('fetchAPI', mockedFetch)

  expect(mockedFetch.mock.calls).toHaveLength(1)
})
