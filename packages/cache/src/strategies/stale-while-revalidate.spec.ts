/* eslint-disable @typescript-eslint/no-floating-promises */
import { expect, test } from '@jest/globals'
import { MemoryStorage } from '~/storage'
import { Eviction } from '~/constants/eviction.enum'
import { spyOn } from 'jest-mock'
import { createKeqNext, createKeqContext, sleep } from '~~/__tests__/helpers'
import { staleWhileRevalidate } from './stale-while-revalidate'


test('Strategies.StaleWhileRevalidate', async () => {
  const storage = new MemoryStorage({ size: 100, eviction: Eviction.TTL })

  spyOn(storage, 'set')

  const ctx1 = createKeqContext()
  const next1 = createKeqNext(ctx1, '1')
  await staleWhileRevalidate({
    key: 'key1',
    storage,
  })(ctx1, next1)

  expect(next1).toBeCalledTimes(1)
  expect(await ctx1.response?.text()).toEqual('1')

  const ctx2 = createKeqContext()
  const next2 = createKeqNext(ctx2, '2')
  await staleWhileRevalidate({
    key: 'key1',
    storage,
  })(ctx2, next2)

  expect(await ctx2.response?.text()).toEqual('1')
  // sleep 10ms
  await sleep(5)
  expect(next2).toBeCalledTimes(1)
  expect(await ctx2.response?.text()).toEqual('1')

  const ctx3 = createKeqContext()
  const next3 = createKeqNext(ctx3, new Error('hello world'))
  await staleWhileRevalidate({
    key: 'key1',
    storage,
  })(ctx3, next3)

  await sleep(5)
  expect(next3).toBeCalledTimes(1)
  expect(await ctx3.response?.text()).toEqual('2')

  const ctx4 = createKeqContext()
  const next4 = createKeqNext(ctx4, new Error())
  expect(staleWhileRevalidate({
    key: 'key2',
    storage,
  })(ctx4, next4)).rejects.toThrowError()

  expect(storage.set).toBeCalledTimes(2)
})
