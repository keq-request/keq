import { expect, jest, test } from '@jest/globals'
import { Mock } from 'jest-mock'
import { request } from './request.js'


test('derive creates independent request with different query', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const base = request
    .get('http://test.com')
    .query('a', '1')

  await base.derive().query('b', '2')
  await base.derive().query('c', '3')

  expect(mockedFetch.mock.calls).toHaveLength(2)
  expect(mockedFetch.mock.calls[0][0]).toBe('http://test.com/?a=1&b=2')
  expect(mockedFetch.mock.calls[1][0]).toBe('http://test.com/?a=1&c=3')
})

test('derive does not mutate original request URL', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const base = request
    .get('http://test.com')
    .query('a', '1')

  const derived = base.derive().query('b', '2')
  await derived

  await base.derive()

  expect(mockedFetch.mock.calls).toHaveLength(2)
  expect(mockedFetch.mock.calls[0][0]).toBe('http://test.com/?a=1&b=2')
  expect(mockedFetch.mock.calls[1][0]).toBe('http://test.com/?a=1')
})

test('derive preserves headers independently', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const base = request
    .get('http://test.com')
    .set('x-token', 'abc')

  await base.derive().set('x-extra', 'derived-only')
  await base.derive()

  expect(mockedFetch.mock.calls).toHaveLength(2)

  const headers1 = mockedFetch.mock.calls[0][1]?.headers as Headers
  expect(headers1.get('x-token')).toBe('abc')
  expect(headers1.get('x-extra')).toBe('derived-only')

  const headers2 = mockedFetch.mock.calls[1][1]?.headers as Headers
  expect(headers2.get('x-token')).toBe('abc')
  expect(headers2.get('x-extra')).toBeNull()
})

test('derive preserves body', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const base = request
    .post('http://test.com')
    .send({ name: 'base' })

  await base.derive()
  await base.derive().send({ extra: 'derived' })

  expect(mockedFetch.mock.calls).toHaveLength(2)
  expect(mockedFetch.mock.calls[0][1]?.body).toBe('{"name":"base"}')
  expect(mockedFetch.mock.calls[1][1]?.body).toBe('{"name":"base","extra":"derived"}')
})

test('derive preserves middlewares independently', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>
  const baseMw = jest.fn<any>((ctx, next) => next())
  const derivedMw = jest.fn<any>((ctx, next) => next())

  const base = request
    .get('http://test.com')
    .option('fetchAPI', mockedFetch)
    .use(baseMw)

  await base.derive()
  await base.derive().use(derivedMw)

  expect(baseMw).toHaveBeenCalledTimes(2)
  expect(derivedMw).toHaveBeenCalledTimes(1)
})

test('derive preserves options', async () => {
  const mockedFetch = jest.fn()
  const retryOn = jest.fn<any>(() => true)

  await request
    .get('http://test.com')
    .retry(1, 0, retryOn)
    .option('fetchAPI', mockedFetch)
    .derive()

  expect(mockedFetch).toHaveBeenCalledTimes(2)
  expect(retryOn).toHaveBeenCalledTimes(1)
})

test('derive shares __global__ reference', () => {
  const base = request.get('http://test.com')
  const derived = base.derive()

  expect((derived as any).__global__).toBe((base as any).__global__)
})

test('derive works after base has been awaited', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const base = request
    .get('http://test.com')
    .query('a', '1')

  await base

  const result = await base.derive().query('b', '2')

  expect(mockedFetch.mock.calls).toHaveLength(2)
  expect(mockedFetch.mock.calls[1][0]).toBe('http://test.com/?a=1&b=2')
  expect(result).toEqual({ code: '200' })
})

test('multiple derives from same base are independent', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const base = request
    .get('http://test.com')
    .query('base', 'true')

  const results = await Promise.all([
    base.derive().query('idx', '0'),
    base.derive().query('idx', '1'),
    base.derive().query('idx', '2'),
  ])

  expect(mockedFetch.mock.calls).toHaveLength(3)
  expect(mockedFetch.mock.calls[0][0]).toBe('http://test.com/?base=true&idx=0')
  expect(mockedFetch.mock.calls[1][0]).toBe('http://test.com/?base=true&idx=1')
  expect(mockedFetch.mock.calls[2][0]).toBe('http://test.com/?base=true&idx=2')
  expect(results).toEqual([{ code: '200' }, { code: '200' }, { code: '200' }])
})

test('derive preserves path parameters', async () => {
  const mockedFetch = global.fetch as Mock<typeof global.fetch>

  const base = request
    .get('http://test.com/users/{id}')
    .params('id', '42')

  await base.derive().query('fields', 'name')
  await base.derive().query('fields', 'email')

  expect(mockedFetch.mock.calls).toHaveLength(2)
  expect(mockedFetch.mock.calls[0][0]).toBe('http://test.com/users/42?fields=name')
  expect(mockedFetch.mock.calls[1][0]).toBe('http://test.com/users/42?fields=email')
})
