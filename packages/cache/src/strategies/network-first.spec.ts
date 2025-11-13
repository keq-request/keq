
import { expect, jest, test } from '@jest/globals'
import { networkFirst } from './network-first'
import { MemoryStorage } from '~/storage'
import { Eviction } from '~/constants/eviction.enum'
import { spyOn } from 'jest-mock'
import { createMockFetchMiddleware, createSharedContext } from '@keq-request/test'
import { KeqMiddlewareOrchestrator } from 'keq'


test('Strategies.NETWORK_FIRST', async () => {
  const onCacheSet = jest.fn()
  const storage = new MemoryStorage({
    size: 100,
    eviction: Eviction.TTL,
    onCacheSet,
  })

  spyOn(storage, 'set')

  // First request goes to network
  const sharedContext1 = createSharedContext()
  const cacheUpdateHandler1 = jest.fn()
  sharedContext1.emitter.on('cache:update', cacheUpdateHandler1)
  const fetchMiddleware1 = createMockFetchMiddleware({ response: { body: '1' } })
  const orchestrator1 = new KeqMiddlewareOrchestrator(sharedContext1, [
    networkFirst({ key: 'key1', storage }),
    fetchMiddleware1,
  ])
  await orchestrator1.execute()

  expect(fetchMiddleware1).toHaveBeenCalledTimes(1)
  expect(await sharedContext1.response?.text()).toEqual('1')
  expect(cacheUpdateHandler1).toHaveBeenCalledTimes(1)

  // Second request, network succeeds
  const sharedContext2 = createSharedContext()
  const cacheUpdateHandler2 = jest.fn()
  sharedContext2.emitter.on('cache:update', cacheUpdateHandler2)
  const fetchMiddleware2 = createMockFetchMiddleware({ response: { body: '2' } })
  const orchestrator2 = new KeqMiddlewareOrchestrator(sharedContext2, [
    networkFirst({ key: 'key1', storage }),
    fetchMiddleware2,
  ])
  await orchestrator2.execute()

  expect(fetchMiddleware2).toHaveBeenCalledTimes(1)
  expect(await sharedContext2.response?.text()).toEqual('2')
  expect(cacheUpdateHandler2).toHaveBeenCalledTimes(1)

  // Third request, network fails, should return cached response

  const sharedContext3 = createSharedContext()
  const cacheUpdateHandler3 = jest.fn()
  const cacheHitHandler3 = jest.fn()
  sharedContext3.emitter.on('cache:update', cacheUpdateHandler3)
  sharedContext3.emitter.on('cache:hit', cacheHitHandler3)
  const fetchMiddleware3 = createMockFetchMiddleware({ error: new Error('fetch failed') })
  const orchestrator3 = new KeqMiddlewareOrchestrator(sharedContext3, [
    networkFirst({ key: 'key1', storage }),
    fetchMiddleware3,
  ])
  await orchestrator3.execute()

  expect(fetchMiddleware3).toHaveBeenCalledTimes(1)
  expect(await sharedContext3.response?.text()).toEqual('2')
  expect(cacheUpdateHandler3).toHaveBeenCalledTimes(0)
  expect(cacheHitHandler3).toHaveBeenCalledTimes(1)

  // Fourth request, network fails, no cache available, should throw error

  const sharedContext = createSharedContext()
  const cacheMissHandler = jest.fn()
  sharedContext.emitter.on('cache:miss', cacheMissHandler)
  const fetchMiddleware4 = createMockFetchMiddleware({ error: new Error('fetch failed') })
  const orchestrator4 = new KeqMiddlewareOrchestrator(sharedContext, [
    networkFirst({ key: 'key2', storage }),
    fetchMiddleware4,
  ])

  await expect(orchestrator4.execute()).rejects.toThrow()
  expect(cacheMissHandler).toHaveBeenCalledTimes(1)


  // eslint-disable-next-line @typescript-eslint/unbound-method
  expect(storage.set).toHaveBeenCalledTimes(2)
  expect(onCacheSet).toHaveBeenCalledTimes(2)
})
