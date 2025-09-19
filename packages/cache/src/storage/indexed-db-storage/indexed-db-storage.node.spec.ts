import { expect, test } from '@jest/globals'
import { IndexedDBStorage } from './indexed-db-storage'
import { Eviction } from '~/constants/eviction.enum'
import { beforeEach } from 'node:test'
import { openDB } from 'idb'
import { CacheEntry } from '~/cache-entry'
import { createResponse } from '~~/__tests__/helpers'
import { DEFAULT_TABLE_NAME } from './constants/default-table-name'


beforeEach(async () => {
  const db = await openDB(DEFAULT_TABLE_NAME)
  await db.deleteObjectStore('metadata')
  await db.deleteObjectStore('response')
  await db.deleteObjectStore('visits')
})

test('new IndexedDBStorage(100, 20, Eviction.RANDOM)', async () => {
  const storage = new IndexedDBStorage({
    size: 100,
    eviction: Eviction.RANDOM,
  })

  const response = createResponse({ size: 10 })
  const entry = await CacheEntry.build({
    key: 'key',
    response,
  })

  await storage.set(entry)

  const cache = await storage.get('key')

  expect(cache).toBeDefined()
  expect(await cache?.response.text()).toBe(await response.clone().text())

  const notExistCache = await storage.get('not_exist_key')
  expect(notExistCache).toBeUndefined()
})
