/* eslint-disable @typescript-eslint/unbound-method */

import { expect, jest, test } from '@jest/globals'
import { MemoryStorage } from '~/storage'
import { Eviction } from '~/constants/eviction.enum'
import { spyOn } from 'jest-mock'
import { sleep, createMockFetchMiddleware, createSharedContext } from '@keq-request/test'
import { staleWhileRevalidate } from './stale-while-revalidate'
import { KeqMiddlewareOrchestrator } from 'keq'
import { RequestCacheHandler } from '~/request-cache-handler'

test('Strategies.StaleWhileRevalidate', async () => {
  const storage = new MemoryStorage({ size: 100, eviction: Eviction.TTL })

  function createRequestHandler(key: string): RequestCacheHandler {
    return new RequestCacheHandler(key, storage, { key })
  }

  spyOn(storage, 'set')

  // First request, cache miss

  const sharedContext1 = createSharedContext()
  const cacheUpdateHandler1 = jest.fn()
  const cacheMissHandler1 = jest.fn()
  const cacheHitHandler1 = jest.fn()
  sharedContext1.emitter.on('cache:update', cacheUpdateHandler1)
  sharedContext1.emitter.on('cache:miss', cacheMissHandler1)
  sharedContext1.emitter.on('cache:hit', cacheHitHandler1)
  const fetchMiddleware1 = createMockFetchMiddleware({ response: { body: '1' } })
  const orchestrator1 = new KeqMiddlewareOrchestrator(sharedContext1, [
    (context, next) => staleWhileRevalidate(createRequestHandler('key1'), context, next),
    fetchMiddleware1,
  ])
  await orchestrator1.execute()
  expect(fetchMiddleware1).toHaveBeenCalledTimes(1)
  expect(await sharedContext1.response?.text()).toEqual('1')
  expect(cacheUpdateHandler1).toHaveBeenCalledTimes(1)
  expect(cacheMissHandler1).toHaveBeenCalledTimes(1)
  expect(cacheHitHandler1).toHaveBeenCalledTimes(0)

  // Second request, cache hit, should return cached response immediately and revalidate in background

  const sharedContext2 = createSharedContext()
  const cacheUpdateHandler2 = jest.fn()
  const cacheMissHandler2 = jest.fn()
  const cacheHitHandler2 = jest.fn()
  sharedContext2.emitter.on('cache:update', cacheUpdateHandler2)
  sharedContext2.emitter.on('cache:miss', cacheMissHandler2)
  sharedContext2.emitter.on('cache:hit', cacheHitHandler2)
  const fetchMiddleware2 = createMockFetchMiddleware({ response: { body: '2' }, delay: 10 })
  const orchestrator2 = new KeqMiddlewareOrchestrator(sharedContext2, [
    (context, next) => staleWhileRevalidate(createRequestHandler('key1'), context, next),
    fetchMiddleware2,
  ])
  await orchestrator2.execute()

  expect(await sharedContext2.response?.text()).toEqual('1')
  expect(fetchMiddleware2).toHaveBeenCalledTimes(0)
  await sleep(100)
  expect(await sharedContext2.response?.text()).toEqual('1')
  expect(fetchMiddleware2).toHaveBeenCalledTimes(1)
  expect(cacheUpdateHandler2).toHaveBeenCalledTimes(1)
  expect(cacheMissHandler2).toHaveBeenCalledTimes(0)
  expect(cacheHitHandler2).toHaveBeenCalledTimes(1)

  // Third request, fetch fails, should return stale cache

  const sharedContext3 = createSharedContext()
  const cacheUpdateHandler3 = jest.fn()
  const cacheMissHandler3 = jest.fn()
  const cacheHitHandler3 = jest.fn()
  sharedContext3.emitter.on('cache:update', cacheUpdateHandler3)
  sharedContext3.emitter.on('cache:miss', cacheMissHandler3)
  sharedContext3.emitter.on('cache:hit', cacheHitHandler3)
  const fetchMiddleware3 = createMockFetchMiddleware({ error: new Error('fetch failed') })
  const orchestrator3 = new KeqMiddlewareOrchestrator(sharedContext3, [
    (context, next) => staleWhileRevalidate(createRequestHandler('key1'), context, next),
    fetchMiddleware3,
  ])
  await orchestrator3.execute()

  await sleep(5)
  expect(fetchMiddleware3).toHaveBeenCalledTimes(1)
  expect(await sharedContext3.response?.text()).toEqual('2')
  expect(cacheUpdateHandler3).toHaveBeenCalledTimes(0)
  expect(cacheMissHandler3).toHaveBeenCalledTimes(0)
  expect(cacheHitHandler3).toHaveBeenCalledTimes(1)


  // Fourth request, fetch fails, no cache available, should throw error

  const sharedContext4 = createSharedContext()
  const cacheMissHandler4 = jest.fn()
  const cacheUpdateHandler4 = jest.fn()
  const cacheHitHandler4 = jest.fn()
  sharedContext4.emitter.on('cache:miss', cacheMissHandler4)
  sharedContext4.emitter.on('cache:update', cacheUpdateHandler4)
  sharedContext4.emitter.on('cache:hit', cacheHitHandler4)
  const fetchMiddleware4 = createMockFetchMiddleware({ error: new Error('fetch failed') })
  const orchestrator4 = new KeqMiddlewareOrchestrator(sharedContext4, [
    (context, next) => staleWhileRevalidate(createRequestHandler('key2'), context, next),
    fetchMiddleware4,
  ])

  await expect(orchestrator4.execute()).rejects.toThrow()
  expect(cacheHitHandler4).toHaveBeenCalledTimes(0)
  expect(cacheUpdateHandler4).toHaveBeenCalledTimes(0)
  expect(cacheMissHandler4).toHaveBeenCalledTimes(1)


  expect(storage.set).toHaveBeenCalledTimes(2)
})
