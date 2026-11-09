import { AsyncLocalStorage } from 'node:async_hooks'
import { expect, test } from '@jest/globals'
import { KeqRequest } from 'keq'
import { cache } from './cache'
import { Strategy } from './constants/strategy.enum'
import { MemoryStorage } from './storage'


interface Store {
  id: string
}

/**
 * The default (non-`concurrent`) cache path serialises same-key requests
 * through a queue. Requests waiting in that queue must not inherit the
 * previous request's async context.
 *
 * @description
 * 缓存中间件在未设置 `concurrent: true` 时会按 cacheKey 串行化请求。
 * 排队中的请求不应继承上一个请求的 ALS 上下文。
 */
test('the default cache path preserves the AsyncLocalStorage context of each request', async () => {
  const als = new AsyncLocalStorage<Store>()
  const observed: Record<string, string | undefined> = {}

  const request = new KeqRequest()
  request.use(cache({
    storage: new MemoryStorage(),
    keyFactory: () => 'als-cache-key',
    rules: [{
      pattern: /\/cat/,
      // NETWORK_ONLY keeps every request going through the queue to fetchAPI,
      // so all of them are observable.
      strategy: Strategy.NETWORK_ONLY,
      key: 'als-cache-key',
    }],
  }))

  const ids = Array.from({ length: 4 }, (_, index) => `req-${index}`)

  await Promise.all(ids.map((id) => als.run({ id }, async () => {
    await request
      .get('/cat')
      .option('fetchAPI', async () => {
        // Read the context downstream of the cache queue
        observed[id] = als.getStore()?.id
        await new Promise((resolve) => setTimeout(resolve, 20))
        return new Response(JSON.stringify({ code: '200' }), {
          headers: { 'content-type': 'application/json' },
        })
      })
  })))

  const expected: Record<string, string> = {}
  for (const id of ids) expected[id] = id

  expect(observed).toEqual(expected)
})
