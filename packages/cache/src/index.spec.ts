import { expect, test } from '@jest/globals'
import { cache, MemoryStorage, Strategy } from './index'


test('cache()', async () => {
  const storage = new MemoryStorage({
    size: 2 * 1000 * 1000,
  })
  expect(cache({ storage })).toBeInstanceOf(Function)
})
