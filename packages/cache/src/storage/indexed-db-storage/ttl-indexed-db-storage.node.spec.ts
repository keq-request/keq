import * as R from 'ramda'
import { expect, test } from '@jest/globals'
import { beforeEach } from 'node:test'
import { openDB } from 'idb'
import { DEFAULT_TABLE_NAME } from './constants/default-table-name'
import { TTLIndexedDBStorage } from './ttl-indexed-db-storage'
import { CacheEntry } from '~/cache-entry'
import { createResponse } from '~~/__tests__/helpers'


beforeEach(async () => {
  const db = await openDB(DEFAULT_TABLE_NAME)
  await db.deleteObjectStore('entries')
  await db.deleteObjectStore('responses')
})

test.only('new TTLIndexedDBStorage({ size: 100 })', async () => {
  const storage = new TTLIndexedDBStorage({ size: 100 })

  for (const i of R.range(0, 10)) {
    const response = createResponse({ size: 10 })
    const entry = await CacheEntry.build({
      key: `temp_${i}`,
      response,
      ttl: 60 + i,
    })
    await storage.set(entry)
  }

  for (const i of R.range(0, 10)) {
    expect(await storage.get(`temp_${i}`)).toBeDefined()
  }

  const entry1 = await CacheEntry.build({
    key: 'entry_1',
    response: createResponse({ size: 10 }),
  })

  await storage.set(entry1)
  expect(await storage.get('entry_1')).toBeDefined()
  expect(await storage.get('temp_0')).toBeUndefined()
})
