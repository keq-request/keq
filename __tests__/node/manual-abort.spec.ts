import { expect, jest, test } from '@jest/globals'
import { AbortException } from '~/exception/abort.exception.js'
import { InvalidArgumentsExceptions } from '~/exception/invalid-arguments.exception.js'
import { request } from './request.js'


function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function jsonResponse(): Response {
  return new Response(
    JSON.stringify({ code: '200' }),
    { headers: { 'content-type': 'application/json' } },
  )
}

/**
 * A mocked fetch that resolves after `delay` ms,
 * and rejects with `signal.reason` when the request is aborted.
 */
function createMockedFetch(delay = 300): ReturnType<typeof jest.fn> {
  return jest.fn((input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve, reject) => {
    let finished = false

    const finish = (fn: () => void): void => {
      if (finished) return
      finished = true
      fn()
    }

    if (init?.signal) {
      const signal = init.signal
      signal.addEventListener('abort', () => {
        finish(() => reject(signal.reason ?? new DOMException('AbortError', 'AbortError')))
      }, { once: true })
    }

    setTimeout(() => {
      finish(() => resolve(jsonResponse()))
    }, delay)
  }))
}

test('abort before the request is sent rejects with AbortException without fetching', async () => {
  const mockedFetch = createMockedFetch()
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)

  keq.abort()

  await expect(keq).rejects.toBeInstanceOf(AbortException)
  await expect(keq).rejects.toThrow('Request aborted')
  expect(mockedFetch).toBeCalledTimes(0)
})

test('end() sends the request and abort during flight rejects with the custom reason', async () => {
  const mockedFetch = createMockedFetch(300)
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)

  const pending = keq.end()
  await sleep(20)

  const reason = new DOMException('stop', 'AbortError')
  keq.abort(reason)

  await expect(pending).rejects.toBe(reason)
  expect(mockedFetch).toBeCalledTimes(1)
})

test('abort prevents retries', async () => {
  const mockedFetch = createMockedFetch(300)
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)
    .retry(3, 0)

  const pending = keq.end()
  await sleep(20)
  keq.abort()

  await expect(pending).rejects.toBeInstanceOf(AbortException)
  expect(mockedFetch).toBeCalledTimes(1)
})

test('abort interrupts the retry delay', async () => {
  const mockedFetch = jest.fn(() => Promise.reject(new TypeError('network fail')))
  const start = Date.now()
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)
    .retry(3, 5000)

  const pending = keq.end()
  await sleep(20)
  keq.abort()

  await expect(pending).rejects.toBeInstanceOf(AbortException)
  expect(Date.now() - start).toBeLessThan(1000)
  expect(mockedFetch).toBeCalledTimes(1)
})

test('abort after the request completed is a no-op', async () => {
  const mockedFetch = createMockedFetch(10)
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)

  const output = await keq
  keq.abort()

  expect(output).toEqual({ code: '200' })
  expect(await keq).toEqual({ code: '200' })
})

test('abortWhen(signal) aborts an in-flight request in the normal await flow', async () => {
  const controller = new AbortController()
  const mockedFetch = createMockedFetch(300)
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)
    .abortWhen(controller.signal)

  setTimeout(() => controller.abort(), 20)

  await expect(keq).rejects.toMatchObject({ name: 'AbortError' })
  expect(mockedFetch).toBeCalledTimes(1)
})

test('abortWhen(aborted signal) aborts before the request is sent', async () => {
  const controller = new AbortController()
  controller.abort()

  const mockedFetch = createMockedFetch()
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)
    .abortWhen(controller.signal)

  await expect(keq).rejects.toMatchObject({ name: 'AbortError' })
  expect(mockedFetch).toBeCalledTimes(0)
})

test('abortWhen(signal) rejects with the signal reason', async () => {
  const controller = new AbortController()
  const reason = new DOMException('user cancelled', 'AbortError')
  const mockedFetch = createMockedFetch(300)
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)
    .abortWhen(controller.signal)

  setTimeout(() => controller.abort(reason), 20)

  await expect(keq).rejects.toBe(reason)
})

test('abortWhen(promise) aborts when the promise settles', async () => {
  const mockedFetch = createMockedFetch(300)
  let resolvePromise!: () => void
  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve
  })

  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)
    .abortWhen(promise)

  setTimeout(() => resolvePromise(), 20)

  await expect(keq).rejects.toThrow('Request aborted by Promise passed to abortWhen()')
  expect(mockedFetch).toBeCalledTimes(1)
})

test('abortWhen() removes the signal listener after the request settled', async () => {
  const controller = new AbortController()
  const removeEventListener = jest.spyOn(controller.signal, 'removeEventListener')
  const mockedFetch = createMockedFetch(10)

  await request.get('http://test.com').option('fetchAPI', mockedFetch)
    .abortWhen(controller.signal)

  expect(removeEventListener).toBeCalled()
})

test('abortWhen() throws for an invalid source', () => {
  const keq = request.get('http://test.com')

  expect(() => keq.abortWhen(123 as unknown as AbortSignal)).toThrow(InvalidArgumentsExceptions)
  expect(() => keq.abortWhen(undefined as unknown as AbortSignal)).toThrow(InvalidArgumentsExceptions)
})

test('end() then catch() sends the request only once', async () => {
  const mockedFetch = createMockedFetch(10)
  const keq = request.get('http://test.com').option('fetchAPI', mockedFetch)

  void keq.end()
  const output = await keq.catch(() => null)

  expect(output).toEqual({ code: '200' })
  expect(mockedFetch).toBeCalledTimes(1)
})

test('context.abort() in middleware aborts the request and prevents retries', async () => {
  const mockedFetch = createMockedFetch(300)
  const keq = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .use(async (context, next) => {
      setTimeout(() => context.abort(new AbortException('aborted by middleware')), 20)
      await next()
    })
    .retry(3, 0)

  await expect(keq).rejects.toThrow('aborted by middleware')
  expect(mockedFetch).toBeCalledTimes(1)
})

test('timeout still can be retried', async () => {
  let calls = 0
  const mockedFetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((resolve, reject) => {
    calls += 1
    const delay = calls === 1 ? 300 : 10
    let finished = false

    if (init?.signal) {
      const signal = init.signal
      signal.addEventListener('abort', () => {
        if (finished) return
        finished = true
        reject(signal.reason ?? new DOMException('AbortError', 'AbortError'))
      }, { once: true })
    }

    setTimeout(() => {
      if (finished) return
      finished = true
      resolve(jsonResponse())
    }, delay)
  }))

  const output = await request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .timeout(50)
    .retry(1, 0)

  expect(output).toEqual({ code: '200' })
  expect(mockedFetch).toBeCalledTimes(2)
})

test('retry still works when the request is not aborted', async () => {
  let calls = 0
  const mockedFetch = jest.fn(() => {
    calls += 1
    return calls === 1 ? Promise.reject(new TypeError('network fail')) : Promise.resolve(jsonResponse())
  })

  const output = await request.get('http://test.com').option('fetchAPI', mockedFetch)
    .retry(1, 0)

  expect(output).toEqual({ code: '200' })
  expect(mockedFetch).toBeCalledTimes(2)
})
