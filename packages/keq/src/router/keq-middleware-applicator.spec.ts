import { expect, jest, test } from '@jest/globals'
import { createRequest } from '../request/create-request.js'
import { KeqMiddleware } from '~/middleware/index.js'
import { KeqRoute } from '~/router/types/keq-route.js'


test('apply middleware forRoutes with single pattern', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .forRoutes({ host: 'api.example.com' })

  await request.get('http://api.example.com/users')
  await request.get('http://other.com/users')

  expect(m1).toHaveBeenCalledTimes(1)
})

test('apply middleware forRoutes with multiple patterns (OR)', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .forRoutes(
      { host: 'api.example.com', method: 'post' },
      { host: 'api.example.com', method: 'put' },
    )

  await request.get('http://api.example.com/users')
  await request.post('http://api.example.com/users')
  await request.put('http://api.example.com/users')

  expect(m1).toHaveBeenCalledTimes(2)
})

test('apply middleware with exclude', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .exclude({ pathname: '/health' })
    .forRoutes({ host: 'api.example.com' })

  await request.get('http://api.example.com/users')
  await request.get('http://api.example.com/health')

  expect(m1).toHaveBeenCalledTimes(1)
})

test('apply middleware with multiple excludes (OR)', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .exclude({ pathname: '/health' }, { pathname: '/ready' })
    .forRoutes({ pathname: '/**' })

  await request.get('http://example.com/users')
  await request.get('http://example.com/health')
  await request.get('http://example.com/ready')

  expect(m1).toHaveBeenCalledTimes(1)
})

test('apply with AND within a single pattern', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .forRoutes({ host: 'api.example.com', method: 'get', pathname: '/users/**' })

  await request.get('http://api.example.com/users/123')
  await request.post('http://api.example.com/users/123')
  await request.get('http://other.com/users/123')
  await request.get('http://api.example.com/posts/1')

  expect(m1).toHaveBeenCalledTimes(1)
})

test('apply with custom KeqRoute predicate', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  const customRoute: KeqRoute = (ctx) => ctx.request.url.searchParams.has('debug')

  request
    .apply(m1)
    .forRoutes(customRoute)

  await request.get('http://example.com/api?debug=1')
  await request.get('http://example.com/api')

  expect(m1).toHaveBeenCalledTimes(1)
})

test('apply returns KeqRequest for chaining', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })
  const m2 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1).forRoutes({ host: 'api.example.com' })
    .apply(m2).forRoutes({ host: 'cdn.example.com' })

  await request.get('http://api.example.com/data')
  await request.get('http://cdn.example.com/image.png')

  expect(m1).toHaveBeenCalledTimes(1)
  expect(m2).toHaveBeenCalledTimes(1)
})

test('apply multiple middlewares', async () => {
  const request = createRequest()

  const order: number[] = []
  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { order.push(1); await next() })
  const m2 = jest.fn<KeqMiddleware>(async (ctx, next) => { order.push(2); await next() })

  request
    .apply(m1, m2)
    .forRoutes({ host: 'api.example.com' })

  await request.get('http://api.example.com/users')

  expect(m1).toHaveBeenCalledTimes(1)
  expect(m2).toHaveBeenCalledTimes(1)
  expect(order).toEqual([1, 2])
})

test('apply with empty pattern matches all', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .forRoutes({})

  await request.get('http://any.com/anything')

  expect(m1).toHaveBeenCalledTimes(1)
})

test('apply with pathname glob pattern', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .exclude({ pathname: '/internal/**' })
    .forRoutes({ pathname: '/**' })

  await request.get('http://example.com/api/users')
  await request.get('http://example.com/internal/metrics')

  expect(m1).toHaveBeenCalledTimes(1)
})

test('forAllRoutes applies middleware to all requests', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .forAllRoutes()

  await request.get('http://any.com/anything')
  await request.post('http://other.com/data')

  expect(m1).toHaveBeenCalledTimes(2)
})

test('forAllRoutes with exclude', async () => {
  const request = createRequest()

  const m1 = jest.fn<KeqMiddleware>(async (ctx, next) => { await next() })

  request
    .apply(m1)
    .exclude({ pathname: '/health' }, { pathname: '/ready' })
    .forAllRoutes()

  await request.get('http://example.com/users')
  await request.get('http://example.com/health')
  await request.get('http://example.com/ready')
  await request.post('http://other.com/data')

  expect(m1).toHaveBeenCalledTimes(2)
})
