import { expect, jest, test } from '@jest/globals'
import { request } from './request.js'
import { AbortException, TypeException } from '~/exception/index.js'
import { createMockFetch, sleep } from '@keq-request/test'


test('abort() rejects the request with an AbortException', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  const abortListener = jest.fn()

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .on('abort', abortListener)

  keq.abort()

  await expect(keq).rejects.toBeInstanceOf(AbortException)
  expect(mockedFetch).toHaveBeenCalledTimes(1)
  expect(abortListener).toHaveBeenCalledTimes(1)
})

test('fire() returns the request instance so it can be aborted later', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  const abortListener = jest.fn()

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .on('abort', abortListener)
    .fire()

  await sleep(50)
  keq.abort()

  await expect(keq).rejects.toBeInstanceOf(AbortException)
  expect(mockedFetch).toHaveBeenCalledTimes(1)
  expect(abortListener).toHaveBeenCalledTimes(1)
})

test('abort() interrupts an in-flight request', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  const abortListener = jest.fn()
  const reason = new AbortException('manual abort')

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .on('abort', abortListener)

  const pending = keq.then(() => undefined, (err: unknown) => err)
  await sleep(50)
  keq.abort(reason)

  const error = await pending
  expect(error).toBe(reason)
  expect(mockedFetch).toHaveBeenCalledTimes(1)
  expect(abortListener).toHaveBeenCalledTimes(1)
})

test('abort() prevents pending retries', async () => {
  const mockedFetch = createMockFetch({ error: new Error('network error'), delay: 20 })

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .retry(3, 1000)

  const pending = keq.then(() => undefined, (err: unknown) => err)
  await sleep(100)
  keq.abort()

  const error = await pending
  expect(error).toBeInstanceOf(AbortException)
  expect(mockedFetch).toHaveBeenCalledTimes(1)
})

test('abort() after the request completed is a no-op', async () => {
  const keq = request
    .get('http://test.com')
    .option('fetchAPI', createMockFetch())

  await keq

  expect(() => keq.abort()).not.toThrow()
})

test('abortWhen() aborts when the given AbortSignal aborts', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  const controller = new AbortController()
  const reason = new AbortException('signal aborted')

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .abortWhen(controller.signal)

  const pending = keq.then(() => undefined, (err: unknown) => err)
  await sleep(50)
  controller.abort(reason)

  const error = await pending
  expect(error).toBe(reason)
  expect(mockedFetch).toHaveBeenCalledTimes(1)
})

test('abortWhen() aborts a request that has not been triggered yet', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  const controller = new AbortController()
  const reason = new AbortException('aborted before trigger')

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .abortWhen(controller.signal)

  controller.abort(reason)

  await expect(keq).rejects.toBe(reason)
  expect(mockedFetch).toHaveBeenCalledTimes(1)
})

test('abortWhen() aborts immediately when the given AbortSignal is already aborted', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  const controller = new AbortController()
  controller.abort()

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .abortWhen(controller.signal)

  const error = await keq.then(() => undefined, (err: unknown) => err)
  expect(error).toBeInstanceOf(DOMException)
  expect((error as DOMException).name).toBe('AbortError')
  expect(mockedFetch).toHaveBeenCalledTimes(1)
})

test('abortWhen() removes the signal listener after the request settles', async () => {
  const controller = new AbortController()
  const removeListenerSpy = jest.spyOn(controller.signal, 'removeEventListener')

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', createMockFetch())
    .abortWhen(controller.signal)

  await keq

  expect(removeListenerSpy).toHaveBeenCalled()

  removeListenerSpy.mockRestore()
})

test('abortWhen() aborts when the given Promise settles', async () => {
  const mockedFetch = createMockFetch({ delay: 500 })
  let settle!: () => void
  const when = new Promise<void>((resolve) => {
    settle = resolve
  })

  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .abortWhen(when)

  const pending = keq.then(() => undefined, (err: unknown) => err)
  await sleep(50)
  settle()

  const error = await pending
  expect(error).toBeInstanceOf(AbortException)
  expect(mockedFetch).toHaveBeenCalledTimes(1)
})

test('abortWhen() rejects invalid sources', () => {
  expect(() => request.get('http://test.com').abortWhen(1 as unknown as AbortSignal)).toThrow(TypeException)
})
