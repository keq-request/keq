import * as R from 'ramda'
import { expect, test } from '@jest/globals'
import { beforeEach } from 'node:test'
import { openDB } from 'idb'
import { createResponse } from '~~/__tests__/helpers'
import { CacheEntry } from '~/cache-entry'
import { LFUIndexedDBStorage } from './lfu-indexed-db-storage'


beforeEach(async () => {
  const db = await openDB('keq_cache_indexed_db_storage')
  await db.deleteObjectStore('entries')
  await db.deleteObjectStore('responses')
})

test('new LFUIndexedDBStorage({ size: 100 })', async () => {
  const storage = new LFUIndexedDBStorage({ size: 100 })

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
