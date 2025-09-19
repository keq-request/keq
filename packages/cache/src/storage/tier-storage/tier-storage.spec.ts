import { expect, test } from '@jest/globals'
import { TierStorage } from './tier-storage.js'
import { CacheEntry } from '~/cache-entry/cache-entry.js'
import { Eviction } from '~/constants/eviction.enum.js'
import { MemoryStorage } from '~/storage/memory-storage/memory-storage.js'
import { IndexedDBStorage } from '~/storage/indexed-db-storage/indexed-db-storage.js'
import { createResponse } from '~~/__tests__/helpers.js'

test('TierStorage should create with default options', () => {
  const storage = new TierStorage()
  expect(storage).toBeInstanceOf(TierStorage)
})

test('TierStorage should create with custom options', () => {
  const storage = new TierStorage({
    memory: {
      eviction: Eviction.LFU,
      size: 100,
    },
    indexedDB: {
      eviction: Eviction.LRU,
      size: 1000,
      tableName: 'custom-cache',
    },
  })

  expect(storage).toBeInstanceOf(TierStorage)
})

test('TierStorage should create with existing storage instances', () => {
  const memoryStorage = new MemoryStorage({ eviction: Eviction.LFU })
  const indexedDBStorage = new IndexedDBStorage({ tableName: 'existing-cache' })

  const storage = new TierStorage({
    memory: memoryStorage,
    indexedDB: indexedDBStorage,
  })

  expect(storage).toBeInstanceOf(TierStorage)
})

test('TierStorage should create with mixed instance and options', () => {
  const memoryStorage = new MemoryStorage({ eviction: Eviction.LRU })

  const storage = new TierStorage({
    // existing instance
    memory: memoryStorage,
    // options
    indexedDB: {
      eviction: Eviction.LFU,
      tableName: 'mixed-cache',
    },
  })

  expect(storage).toBeInstanceOf(TierStorage)
})

test('TierStorage should store and retrieve cache entries', async () => {
  const storage = new TierStorage()
  const response = createResponse({ size: 10 })
  const entry = await CacheEntry.build({
    key: 'test-key',
    response,
  })

  await storage.set(entry)
  const retrieved = await storage.get('test-key')

  expect(retrieved).toBeDefined()
  expect(retrieved?.key).toBe('test-key')
})

test('TierStorage should remove cache entries from both tiers', async () => {
  const storage = new TierStorage()
  const response = createResponse({ size: 10 })
  const entry = await CacheEntry.build({
    key: 'test-key',
    response,
  })

  await storage.set(entry)
  await storage.remove('test-key')
  const retrieved = await storage.get('test-key')

  expect(retrieved).toBeUndefined()
})
