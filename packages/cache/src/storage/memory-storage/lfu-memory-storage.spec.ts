import * as R from 'ramda'
import { expect, test } from '@jest/globals'
import { createResponse, sleep } from '~~/__tests__/helpers'
import { LFUMemoryStorage } from './lfu-memory-storage'
import { CacheEntry } from '~/cache-entry'


test('new LFUMemoryStorage({ size: 100 })', async () => {
  const storage = new LFUMemoryStorage({ size: 100 })

  for (const i of R.range(0, 10)) {
    const response = createResponse({ size: 10 })
    const entry = await CacheEntry.build({
      key: `entry_${i}`,
      response,
    })
    storage.set(entry)
  }

  for (const i of R.range(0, 10)) {
    expect(storage.get(`entry_${i}`)).toBeDefined()
    await sleep(2)
  }

  for (const i of R.range(0, 9)) {
    storage.get(`entry_${i}`)
  }

  const entry = await CacheEntry.build({
    key: 'another',
    response: createResponse({ size: 10 }),
  })
  storage.set(entry)

  expect(storage.get('entry_0')).toBeDefined()
  expect(storage.get('entry_9')).toBeUndefined()
  expect(storage.get('another')).toBeDefined()
})
