import { expect, test } from '@jest/globals'
import { MemoryStorage } from './memory-storage'
import { Eviction } from '~/constants/eviction.enum'
import { createResponse } from '~~/__tests__/helpers'
import { CacheEntry } from '~/cache-entry'


test('new MemoryStorage()', async () => {
  const storage = new MemoryStorage()

  const response = createResponse({ size: 10 })
  const entry = await CacheEntry.build({
    key: 'key',
    response,
  })

  await storage.set(entry)
  const cache1 = await storage.get('key')
  expect(cache1).toBeDefined()

  expect((await cache1?.response.text())?.length).toBe(10)

  // 验证多次使用 .get 获取同一个缓存的 Response 可以正常消费
  const cache2 = await storage.get('key')
  expect((await cache2?.response.text())?.length).toBe(10)

  storage.remove('key')
  expect(storage.get('key')).toBeUndefined()
})

test('new MemoryStorage({ eviction: "xxxx" })', async () => {
  // @ts-ignore
  expect(() => new MemoryStorage({ eviction: 'xxxx' })).toThrowError()
})


test('MemoryStorage Isolation', async () => {
  const s1 = new MemoryStorage({ eviction: Eviction.TTL })
  const s2 = new MemoryStorage({ eviction: Eviction.TTL })

  const entry1 = await CacheEntry.build({
    key: 'entry_1',
    response: createResponse({ size: 10 }),
  })
  const entry2 = await CacheEntry.build({
    key: 'entry_2',
    response: createResponse({ size: 10 }),
  })


  await s1.set(entry1)
  await s2.set(entry2)


  expect(await s1.get('entry_1')).toBeDefined()
  expect(await s2.get('entry_2')).toBeDefined()
  expect(await s1.get('entry_2')).toBeUndefined()
  expect(await s2.get('entry_1')).toBeUndefined()
})
