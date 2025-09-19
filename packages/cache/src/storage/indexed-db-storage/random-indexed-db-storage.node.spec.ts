import * as R from 'ramda'
import { expect, test } from '@jest/globals'
import { beforeEach } from 'node:test'
import { openDB } from 'idb'
import { IndexedDBSchema } from './types/indexed-db-schema'
import { RandomIndexedDBStorage } from './random-indexed-db-storage'
import { createResponse } from '~~/__tests__/helpers'
import { CacheEntry } from '~/cache-entry'
import { DEFAULT_TABLE_NAME } from './constants/default-table-name'


beforeEach(async () => {
  const db = await openDB<IndexedDBSchema>(DEFAULT_TABLE_NAME)
  await db.deleteObjectStore('metadata')
  await db.deleteObjectStore('response')
  await db.deleteObjectStore('visits')
})

class TestableRandomIndexedDBStorage extends RandomIndexedDBStorage {
  async length(): Promise<number> {
    const db = await this.openDB()
    return db.count('metadata')
  }
}

test('new IndexedDBStorage(100, 20, Eviction.RANDOM)', async () => {
  const storage = new TestableRandomIndexedDBStorage({ size: 100 })

  for (const i of R.range(0, 10)) {
    const response = createResponse({ size: 10 })
    const entry = await CacheEntry.build({
      key: `temp_${i}`,
      response,
      ttl: 60 + i,
    })

    await storage.set(entry)
  }

  expect(await storage.length()).toBe(10)

  const anthor = await CacheEntry.build({
    key: 'another',
    response: createResponse({ size: 10 }),
  })

  await storage.set(anthor)
  expect(await storage.length()).toBe(10)
})
