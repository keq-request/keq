import { describe, expect, jest, test } from '@jest/globals'
import { composeMiddleware } from './compose-middleware.js'
import type { KeqMiddleware } from '../types/keq-middleware.js'
import { KeqSharedContext } from '../../context/shared-context.js'
import { KeqMiddlewareOrchestrator } from '../../orchestrator/orchestrator.js'


describe('composeMiddleware', () => {
  test('should throw error when middlewares array is empty', () => {
    expect(() => composeMiddleware([])).toThrow('At least one middleware')
  })

  test('should execute middlewares in correct order', async () => {
    const executionOrder: number[] = []

    const middleware1: KeqMiddleware = jest.fn<KeqMiddleware>(async (ctx, next) => {
      executionOrder.push(1)
      await next()
      executionOrder.push(5)
    })

    const middleware2: KeqMiddleware = jest.fn<KeqMiddleware>(async (ctx, next) => {
      executionOrder.push(2)
      await next()
      executionOrder.push(4)
    })

    const composedMiddleware = composeMiddleware([middleware1, middleware2])

    const next = jest.fn<KeqMiddleware>(async () => {
      executionOrder.push(3)
    })
    const sharedContext = new KeqSharedContext({
      global: {},
      request: {
        url: new URL('http://example.com'),
        routeParams: {},
        method: 'get',
        headers: new Headers(),
        body: undefined,
      },
    })

    const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [composedMiddleware, next])
    await orchestrator.execute()

    expect(executionOrder).toEqual([1, 2, 3, 4, 5])
    expect(next).toHaveBeenCalledTimes(1)
  })

  test('should stop execution when error is thrown', async () => {
    const executionOrder: number[] = []

    const middleware1: KeqMiddleware = async (ctx, next) => {
      executionOrder.push(1)
      await next()
      executionOrder.push(7)
    }

    const middleware2: KeqMiddleware = async () => {
      executionOrder.push(2)
      throw new Error('Test error')
    }

    const middleware3: KeqMiddleware = async (ctx, next) => {
      executionOrder.push(3)
      await next()
      executionOrder.push(5)
    }

    const composedMiddleware = composeMiddleware([middleware1, middleware2, middleware3])
    const next = jest.fn<KeqMiddleware>(async () => {
      executionOrder.push(4)
    })
    const sharedContext = new KeqSharedContext({
      global: {},
      request: {
        url: new URL('http://example.com'),
        routeParams: {},
        method: 'get',
        headers: new Headers(),
        body: undefined,
      },
    })
    const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [composedMiddleware, next])
    await expect(orchestrator.execute()).rejects.toThrow('Test error')

    expect(executionOrder).toEqual([1, 2])
    expect(next).not.toHaveBeenCalled()
  })


  test('should set custom name when name option is provided', async () => {
    const middleware1: KeqMiddleware = async (ctx, next) => {
      await next()
    }

    const middleware2: KeqMiddleware = async (ctx, next) => {
      await next()
    }

    const customName = 'custom-middleware-name'
    const composedMiddleware = composeMiddleware([middleware1, middleware2], { name: customName })

    expect(composedMiddleware.__keqMiddlewareName__).toBe(customName)
  })

  test('should not have name when name option is not provided', async () => {
    const middleware1: KeqMiddleware = async (ctx, next) => {
      await next()
    }

    const composedMiddleware = composeMiddleware([middleware1])

    expect(composedMiddleware.__keqMiddlewareName__).toBeUndefined()
  })

  test('should pass context correctly through middleware chain', async () => {
    const middleware1: KeqMiddleware = async (ctx, next) => {
      ctx.data.value = 1
      await next()
    }

    const middleware2: KeqMiddleware = async (ctx, next) => {
      ctx.data.value += 10
      await next()
    }

    const composedMiddleware = composeMiddleware([middleware1, middleware2])

    const sharedContext = new KeqSharedContext({
      request: {
        url: new URL('http://example.com'),
        routeParams: {},
        method: 'get',
        headers: new Headers(),
        body: undefined,
      },
      global: {},
    })
    const next = jest.fn<KeqMiddleware>(async () => {})
    const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [composedMiddleware, next])
    await orchestrator.execute()

    expect(sharedContext.data.value).toBe(11)
  })

  test('should work with single middleware', async () => {
    const executionOrder: string[] = []

    const middleware1: KeqMiddleware = async (ctx, next) => {
      executionOrder.push('before')
      await next()
      executionOrder.push('after')
    }

    const composedMiddleware = composeMiddleware([middleware1])
    const next = jest.fn(async () => {})
    const sharedContext = new KeqSharedContext({
      global: {},
      request: {
        url: new URL('http://example.com'),
        routeParams: {},
        method: 'get',
        headers: new Headers(),
        body: undefined,
      },
    })
    const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [composedMiddleware, next])
    await orchestrator.execute()

    expect(executionOrder).toEqual(['before', 'after'])
    expect(next).toHaveBeenCalledTimes(1)
  })
})
