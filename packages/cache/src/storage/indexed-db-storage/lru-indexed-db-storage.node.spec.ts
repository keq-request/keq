import * as R from 'ramda'
import { expect, test } from '@jest/globals'
import { beforeEach } from 'node:test'
import { openDB } from 'idb'
import { CacheEntry } from '~/cache-entry'
import { createResponse, sleep } from '~~/__tests__/helpers'
import { DEFAULT_TABLE_NAME } from './constants/default-table-name'
import { IndexedDBSchema } from './types/indexed-db-schema'
import { LRUIndexedDBStorage } from './lru-indexed-db-storage'


beforeEach(async () => {
  const db = await openDB<IndexedDBSchema>(DEFAULT_TABLE_NAME)
  await db.deleteObjectStore('metadata')
  await db.deleteObjectStore('response')
  await db.deleteObjectStore('visits')
})

test('new IndexedDBStorage(100, 20, Eviction.LRU)', async () => {
  const storage = new LRUIndexedDBStorage({ size: 100 })

  for (const i of R.range(0, 10)) {
    const response = createResponse({ size: 10 })
    const entry = await CacheEntry.build({
      key: `temp_${i}`,
      response,
    })
    await storage.set(entry)
  }

  for (const i of R.range(0, 10)) {
    expect(await storage.get(`temp_${i}`)).toBeDefined()
  }

  for (const i of R.range(0, 9)) {
    await storage.get(`temp_${i}`)
    await sleep(2)
  }

  const another = await CacheEntry.build({
    key: 'another',
    response: createResponse({ size: 10 }),
  })

  await storage.set(another)

  expect(await storage.get('another')).toBeDefined()
  expect(await storage.get('temp_9')).toBeUndefined()

  for (const i of R.range(0, 9)) {
    expect(await storage.get(`temp_${i}`)).toBeDefined()
  }
})
