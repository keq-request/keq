/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as R from 'ramda'
import { expect, test } from '@jest/globals'
import { createResponse } from '~~/__tests__/helpers'
import { RandomMemoryStorage } from './random-memory-storage'
import { CacheEntry } from '~/cache-entry'


class TestableRandomMemoryStorage extends RandomMemoryStorage {
  entries() {
    return this.storage.entries()
  }
}

test('new RandomMemoryStorage({ size: 100, eviction: Eviction.RANDOM })', async () => {
  const storage = new TestableRandomMemoryStorage({ size: 100 })

  for (const i of R.range(0, 10)) {
    const response = createResponse({ size: 11 })
    const entry = await CacheEntry.build({
      key: `temp_${i}`,
      response,
    })

    storage.set(entry)
  }
  const arr = [...storage.entries()]

  expect(arr.length).toBe(9)
})
