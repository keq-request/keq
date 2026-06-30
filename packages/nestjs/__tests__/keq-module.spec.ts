import 'reflect-metadata'
import { expect, test } from '@jest/globals'
import type { KeqMiddleware } from 'keq'
import { KeqRequest } from 'keq'
import { KeqMiddlewareConsumer } from '../src/keq-middleware-consumer.js'
import { KeqConsumer } from '../src/keq-consumer.js'
import { KEQ_ROUTES } from '../src/constants.js'


test('applies global middleware via forRoutes(KEQ_ROUTES.ALL)', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const middleware: KeqMiddleware = async (_ctx, next) => { await next() }
  consumer.apply(middleware).forRoutes(KEQ_ROUTES.ALL)

  expect(keqRequest.middlewares.length).toBe(1)
})

test('applies global middleware when forRoutes receives no arguments', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const middleware: KeqMiddleware = async (_ctx, next) => { await next() }
  consumer.apply(middleware).forRoutes()

  expect(keqRequest.middlewares.length).toBe(1)
})

test('applies route-specific middleware via forRoutes with KeqRouteInfo', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const middleware: KeqMiddleware = async (_ctx, next) => { await next() }
  consumer.apply(middleware).forRoutes({ pathname: '/api/*' })

  expect(keqRequest.middlewares.length).toBe(1)
})

test('supports multiple middleware in single apply()', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const mw1: KeqMiddleware = async (_ctx, next) => { await next() }
  const mw2: KeqMiddleware = async (_ctx, next) => { await next() }
  consumer.apply(mw1, mw2).forRoutes(KEQ_ROUTES.ALL)

  expect(keqRequest.middlewares.length).toBe(2)
})

test('supports multiple apply() calls', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const mw1: KeqMiddleware = async (_ctx, next) => { await next() }
  const mw2: KeqMiddleware = async (_ctx, next) => { await next() }

  consumer.apply(mw1).forRoutes(KEQ_ROUTES.ALL)
  consumer.apply(mw2).forRoutes({ pathname: '/api/*' })

  expect(keqRequest.middlewares.length).toBe(2)
})

test('supports exclude().forRoutes() chaining', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const middleware: KeqMiddleware = async (_ctx, next) => { await next() }
  consumer.apply(middleware).exclude({ pathname: '/health' }).forRoutes(KEQ_ROUTES.ALL)

  expect(keqRequest.middlewares.length).toBe(1)
})

test('middleware is applied synchronously at forRoutes() call time', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const middleware: KeqMiddleware = async (_ctx, next) => { await next() }

  expect(keqRequest.middlewares.length).toBe(0)
  consumer.apply(middleware).forRoutes(KEQ_ROUTES.ALL)
  expect(keqRequest.middlewares.length).toBe(1)
})

test('supports chaining multiple apply() calls via forRoutes returning consumer', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const mw1: KeqMiddleware = async (_ctx, next) => { await next() }
  const mw2: KeqMiddleware = async (_ctx, next) => { await next() }
  const mw3: KeqMiddleware = async (_ctx, next) => { await next() }

  consumer
    .apply(mw1).forRoutes(KEQ_ROUTES.ALL)
    .apply(mw2).forRoutes({ pathname: '/api/*' })
    .apply(mw3).exclude({ pathname: '/health' }).forRoutes(KEQ_ROUTES.ALL)

  expect(keqRequest.middlewares.length).toBe(3)
})

// ─── KeqConsumer（模块绑定）测试 ──────────────────────────

test('KeqConsumer applies middleware to its own KeqRequest', () => {
  const scopedKeqRequest = new KeqRequest()
  const consumer = new KeqConsumer(scopedKeqRequest)

  const middleware: KeqMiddleware = async (_ctx, next) => { await next() }
  consumer.apply(middleware).forRoutes(KEQ_ROUTES.ALL)

  expect(scopedKeqRequest.middlewares.length).toBe(1)
})

test('KeqConsumer does not affect other KeqRequest instances', () => {
  const globalKeqRequest = new KeqRequest()
  const scopedKeqRequest = new KeqRequest()

  const globalConsumer = new KeqMiddlewareConsumer(globalKeqRequest)
  const scopedConsumer = new KeqConsumer(scopedKeqRequest)

  const middleware: KeqMiddleware = async (_ctx, next) => { await next() }
  scopedConsumer.apply(middleware).forRoutes(KEQ_ROUTES.ALL)

  expect(scopedKeqRequest.middlewares.length).toBe(1)
  expect(globalKeqRequest.middlewares.length).toBe(0)
})

// ─── KeqNestMiddleware 实例对象测试 ──────────────────────

test('applies KeqNestMiddleware instance via apply()', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const middleware = {
    use: async (_ctx: unknown, next: () => Promise<void>) => { await next() },
  }
  consumer.apply(middleware).forRoutes(KEQ_ROUTES.ALL)

  expect(keqRequest.middlewares.length).toBe(1)
})

test('applies KeqNestMiddleware instance to specific route', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const middleware = {
    use: async (_ctx: unknown, next: () => Promise<void>) => { await next() },
  }
  consumer.apply(middleware).forRoutes({ pathname: '/api/*' })

  expect(keqRequest.middlewares.length).toBe(1)
})

test('mixes KeqMiddleware function and KeqNestMiddleware instance', () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  const fnMw: KeqMiddleware = async (_ctx, next) => { await next() }
  const instanceMw = {
    use: async (_ctx: unknown, next: () => Promise<void>) => { await next() },
  }
  consumer.apply(fnMw, instanceMw).forRoutes(KEQ_ROUTES.ALL)

  expect(keqRequest.middlewares.length).toBe(2)
})

test('KeqNestMiddleware instance receives ctx and next in use()', async () => {
  const keqRequest = new KeqRequest()
  const consumer = new KeqMiddlewareConsumer(keqRequest)

  let capturedCtx: unknown = null
  let capturedNext: unknown = null

  const middleware = {
    use: async (ctx: unknown, next: () => Promise<void>) => {
      capturedCtx = ctx
      capturedNext = next
      await next()
    },
  }
  consumer.apply(middleware).forRoutes(KEQ_ROUTES.ALL)

  const middlewareFn = keqRequest.middlewares[0]
  const mockCtx = { request: { url: { host: 'example.com', pathname: '/' }, method: 'GET' } }
  const mockNext = async () => {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (middlewareFn as any)(mockCtx, mockNext)

  expect(capturedCtx).toBe(mockCtx)
  expect(typeof capturedNext).toBe('function')
})

test('KeqConsumer accepts KeqNestMiddleware instance', () => {
  const scopedKeqRequest = new KeqRequest()
  const consumer = new KeqConsumer(scopedKeqRequest)

  const middleware = {
    use: async (_ctx: unknown, next: () => Promise<void>) => { await next() },
  }
  consumer.apply(middleware).forRoutes(KEQ_ROUTES.ALL)

  expect(scopedKeqRequest.middlewares.length).toBe(1)
})
