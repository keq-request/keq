import { describe, expect, jest, test } from '@jest/globals'
import { KeqMiddlewareOrchestrator } from './orchestrator.js'
import { KeqExecutionContext } from '~/context/execution-context.js'
import { createSharedContext } from '@keq-request/test'
import type { KeqMiddleware } from '~/middleware/index.js'


describe('KeqMiddlewareOrchestrator', () => {
  describe('execute', () => {
    test('should execute middlewares in correct order', async () => {
      const executionOrder: number[] = []

      const middleware1 = jest.fn<KeqMiddleware>(async (ctx, next) => {
        executionOrder.push(1)
        await next()
        executionOrder.push(4)
      })

      const middleware2 = jest.fn<KeqMiddleware>(async (ctx, next) => {
        executionOrder.push(2)
        await next()
        executionOrder.push(3)
      })

      const sharedContext = createSharedContext()
      const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [middleware1, middleware2])
      await orchestrator.execute()

      expect(executionOrder).toEqual([1, 2, 3, 4])
      expect(orchestrator.status).toBe('fulfilled')

      for (const executor of orchestrator.executors) {
        expect(executor.status).toBe('fulfilled')
      }

      expect(middleware1).toHaveBeenCalledTimes(1)
      expect(middleware2).toHaveBeenCalledTimes(1)

      expect(middleware1.mock.calls[0][0]).toBeInstanceOf(KeqExecutionContext)
    })

    test('should change status to rejected on error', async () => {
      const error = new Error('Test error')
      const middleware: KeqMiddleware = jest.fn<KeqMiddleware>(() => {
        throw error
      })

      const sharedContext = createSharedContext()
      const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [middleware])

      await expect(orchestrator.execute()).rejects.toThrow('Test error')
      expect(orchestrator.status).toBe('rejected')
      expect(orchestrator.executors[0].status).toBe('rejected')
    })

    test('should throw error if executed twice', async () => {
      const sharedContext = createSharedContext()
      const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [])
      await orchestrator.execute()

      await expect(orchestrator.execute()).rejects.toThrow(
        'Orchestrator has already been executed.',
      )
    })


    test('should stop execution when middleware does not call next', async () => {
      const middleware1: KeqMiddleware = jest.fn<KeqMiddleware>(async (ctx, next) => {
      })

      const middleware2: KeqMiddleware = jest.fn<KeqMiddleware>(async (ctx, next) => {
        await next()
      })

      const sharedContext = createSharedContext()
      const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [middleware1, middleware2])
      await orchestrator.execute()

      expect(orchestrator.status).toBe('fulfilled')
      expect(orchestrator.executors[0].status).toBe('fulfilled')
      expect(orchestrator.executors[1].status).toBe('idle')

      expect(middleware1).toHaveBeenCalledTimes(1)
      expect(middleware2).toHaveBeenCalledTimes(0)
    })
  })

  describe('fork', () => {
    test('should clone shared context', () => {
      const sharedContext = createSharedContext()
      const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [])
      const forked = orchestrator.fork()

      console.log(forked.context === sharedContext)
      expect(forked.context).not.toBe(sharedContext)
      expect(forked.context.request).not.toBe(sharedContext.request)
      expect(forked.context.data).not.toBe(sharedContext.data)
      expect(forked.context.options).not.toBe(sharedContext.options)

      expect(forked.context.global).toBe(sharedContext.global)

      expect(forked.context.request).toEqual(sharedContext.request)
      expect(forked.context.global).toEqual(sharedContext.global)
      expect(forked.context.data).toEqual(sharedContext.data)
      expect(forked.context.options).toEqual(sharedContext.options)
    })

    test('should fork and merge orchestrator correctly within middleware', async () => {
      let forked: KeqMiddlewareOrchestrator | undefined

      const middleware1 = jest.fn<KeqMiddleware>(async (ctx, next) => await next())
      const middleware2 = jest.fn<KeqMiddleware>(async (ctx, next) => {
        forked = ctx.orchestration.fork()
        forked.context.data.forked = true
        await forked.execute()

        await next()
        expect(ctx.data.result).toBe('main')

        ctx.orchestration.merge(forked)
      })
      const middleware3 = jest.fn<KeqMiddleware>((ctx, next) => {
        if (ctx.data.forked) {
          ctx.data.result = 'forked'
        } else {
          ctx.data.result = 'main'
        }
      })

      const sharedContext = createSharedContext()
      const orchestrator = new KeqMiddlewareOrchestrator(sharedContext, [middleware1, middleware2, middleware3])
      await orchestrator.execute()

      expect(forked?.main).toBeDefined()
      expect(forked?.main?.orchestrator).toBe(orchestrator)
      expect(forked?.main?.index).toBe(2)

      expect(sharedContext.data.forked).toBeTruthy()
      expect(sharedContext.data.result).toBe('forked')
    })
  })
})
