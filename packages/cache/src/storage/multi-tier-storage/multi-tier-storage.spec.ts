import { expect, test } from '@jest/globals'
import { CacheEntry } from '~/cache-entry/cache-entry.js'
import { MemoryStorage } from '../memory-storage/memory-storage.js'
import { MultiTierStorage } from './multi-tier-storage.js'
import { createResponse } from '~~/__tests__/helpers.js'


test('new MultiTierStorage()', async () => {
  const memoryStorage1 = new MemoryStorage()
  const memoryStorage2 = new MemoryStorage()

  const multiTierStorage = new MultiTierStorage({
    tiers: [memoryStorage1, memoryStorage2],
  })

  const response = createResponse({ size: 10 })
  const entry = await CacheEntry.build({
    key: 'key',
    response,
  })

  await multiTierStorage.set(entry)
  expect(await multiTierStorage.get('key')).toBeDefined()
  expect(await memoryStorage1.get('key')).toBeDefined()
  expect(await memoryStorage2.get('key')).toBeDefined()

  await memoryStorage1.remove('key')
  expect(await memoryStorage1.get('key')).toBeUndefined()
  expect(await multiTierStorage.get('key')).toBeDefined()
  expect(await memoryStorage1.get('key')).toBeDefined()
  expect(await memoryStorage2.get('key')).toBeDefined()

  await memoryStorage2.remove('key')
  expect(await memoryStorage2.get('key')).toBeUndefined()
  expect(await multiTierStorage.get('key')).toBeDefined()
  expect(await memoryStorage1.get('key')).toBeDefined()
  expect(await memoryStorage2.get('key')).toBeUndefined()

  await multiTierStorage.remove('key')
  expect(await memoryStorage1.get('key')).toBeUndefined()
  expect(await memoryStorage2.get('key')).toBeUndefined()
  expect(await multiTierStorage.get('key')).toBeUndefined()
})

