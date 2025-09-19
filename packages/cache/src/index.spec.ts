import { expect, test } from '@jest/globals'
import { cache, MemoryStorage, Strategy } from './index'


test('cache()', async () => {
  const storage = new MemoryStorage({
    size: 2 * 1000 * 1000,
  })
  expect(cache({ storage })).toBeInstanceOf(Function)

  expect(cache({
    storage,
    keyFactory: (ctx) => ctx.request.__url__.href,

    rules: [{
      pattern: /\/cat/,
      strategy: Strategy.CATCH_FIRST,
      ttl: 1000,
    }],
  }))
})
