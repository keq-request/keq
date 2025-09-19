import * as R from 'ramda'
import { expect, test } from '@jest/globals'
import { createResponse } from '~~/__tests__/helpers'
import { CacheEntry } from '~/cache-entry'
import { TTLMemoryStorage } from './ttl-memory-storage'


test('new TTLMemoryStorage({ size: 100 })', async () => {
  const storage = new TTLMemoryStorage({ size: 100 })

  for (const i of R.range(0, 10)) {
    const response = createResponse({ size: 10 })
    const entry = await CacheEntry.build({
      key: `temp_${i}`,
      response,
      ttl: (100 + i) * 60,
    })
    storage.set(entry)
  }

  for (const i of R.range(0, 10)) {
    expect(storage.get(`temp_${i}`)).toBeDefined()
  }

  const entry = await CacheEntry.build({
    key: 'another',
    response: createResponse({ size: 10 }),
  })

  storage.set(entry)

  expect(storage.get('another')).toBeDefined()

  expect(storage.get('temp_0')).toBeUndefined()
  for (const i of R.range(1, 10)) {
    expect(storage.get(`temp_${i}`)).toBeDefined()
  }
})

test.only('new TTLMemoryStorage({ eviction: Eviction.TTL })', async () => {
  const storage = new TTLMemoryStorage()

  const response = createResponse({ size: 10 })
  const entry = await CacheEntry.build({
    key: 'temp',
    response,
    ttl: 1,
  })

  storage.set(entry)
  expect(storage.get('temp')).toBeDefined()
  await new Promise((resolve) => setTimeout(resolve, 2000))
  expect(storage.get('temp')).toBeUndefined()
})
