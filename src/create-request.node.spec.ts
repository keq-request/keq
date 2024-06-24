import { expect, jest, test } from '@jest/globals'
import { createRequest } from './create-request'
import { KeqMiddleware } from './types/keq-middleware'


test('add middleware to request on specified host', async () => {
  const request = createRequest()


  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })
  const m2 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })
  const m3 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })
  const m4 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })
  const m5 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })
  const m6 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })
  const m7 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })
  const m8 = jest.fn<KeqMiddleware>(async (ctx, next) => {
    await next()
  })

  request
    .use(m1)

  request.useRouter()
    .host('example.com', m2)
    .host('test.com', m3)
    .method('get', m4)
    .location(m5)
    .module('m', m6)
    .pathname('/api', m7)


  await request
    .get('http://test.com/api')
    .use(m8)

  await request
    .post('http://other.com/api')

  expect(m1.mock.calls).toHaveLength(2)
  expect(m2.mock.calls).toHaveLength(0)
  expect(m3.mock.calls).toHaveLength(1)
  expect(m4.mock.calls).toHaveLength(1)
  expect(m5.mock.calls).toHaveLength(0)
  expect(m6.mock.calls).toHaveLength(0)
  expect(m7.mock.calls).toHaveLength(2)
  expect(m8.mock.calls).toHaveLength(1)
})
