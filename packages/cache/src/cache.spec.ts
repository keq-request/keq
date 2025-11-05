import { expect, jest, test } from '@jest/globals'
import { Mock } from 'jest-mock'
import { KeqRequest } from 'keq'
import { cache } from './cache'
import { Strategy } from './constants/strategy.enum'
import { MemoryStorage } from './storage'
import { MockFetchResponse } from '~~/__tests__/helpers'


test('Strategies.NETWORK_ONLY', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>
  const request = new KeqRequest()

  request.use(cache({ storage: new MemoryStorage() }))

  const body1 = await request
    .get<MockFetchResponse>('/cat')

  expect(body1.code).toBe('200')

  const body2 = await request
    .get<MockFetchResponse>('/cat')

  expect(body2.code).toBe('200')

  expect(mockedFetch).toHaveBeenCalledTimes(2)
})

test('Strategies.CATCH_FIRST', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>
  const request = new KeqRequest()

  request.use(cache({
    storage: new MemoryStorage(),
    keyFactory: (ctx) => ctx.request.__url__.href,
    rules: [{
      pattern: /\/cat/,
      strategy: Strategy.CACHE_FIRST,
      key: 'Strategies.CATCH_FIRST',
    }],
  }))

  const body1 = await request
    .get<MockFetchResponse>('/cat')
  expect(body1.code).toBe('200')

  const body2 = await request
    .get<MockFetchResponse>('/cat')
  expect(body2.code).toBe('200')

  const body3 = await request
    .get<MockFetchResponse>('/dog')
  expect(body3.code).toBe('200')

  expect(mockedFetch).toHaveBeenCalledTimes(2)
})

test('Strategies.NETWORK_FIRST', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>
  const request = new KeqRequest()


  request.use(cache({
    keyFactory: (ctx) => ctx.request.__url__.href,
    storage: new MemoryStorage(),
    rules: [{
      pattern: /\/cat/,
      strategy: Strategy.NETWORK_FIRST,
      key: 'Strategies.NETWORK_FIRST',
    }],
  }))

  const body1 = await request
    .get<MockFetchResponse>('/cat')
  expect(body1.code).toBe('200')

  const body2 = await request
    .get<MockFetchResponse>('/cat')
  expect(body2.code).toBe('200')

  expect(mockedFetch).toHaveBeenCalledTimes(2)
})

test('Strategies.STALE_WHILE_REVALIDATE', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>
  const request = new KeqRequest()

  request.use(cache({
    keyFactory: (ctx) => ctx.request.__url__.href,
    storage: new MemoryStorage(),
    rules: [{
      pattern: /\/cat/,
      strategy: Strategy.STALE_WHILE_REVALIDATE,
      key: 'Strategies.STALE_WHILE_REVALIDATE',
    }],
  }))

  const body1 = await request
    .get<MockFetchResponse>('/cat')
    .option('debug')

  expect(mockedFetch).toHaveBeenCalledTimes(1)
  expect(body1.code).toBe('200')

  const body2 = await request
    .get<MockFetchResponse>('/cat')
  expect(body2.code).toBe('200')

  await new Promise((resolve) => setTimeout(resolve, 1000))

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  // expect(onNetworkResponse).toHaveBeenCalledTimes(2)
  // expect(onNetworkResponse.mock.calls[0][1]).toBeUndefined()
  // expect(onNetworkResponse.mock.calls[1][1]).toBeInstanceOf(Response)
})
