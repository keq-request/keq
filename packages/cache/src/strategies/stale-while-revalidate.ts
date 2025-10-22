import { KeqExecutionContext } from 'keq'
import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { StrategyOptions } from '~/types/strategies-options.js'
import { cacheContext } from './utils/index.js'

export const staleWhileRevalidate: KeqCacheStrategy = function (opts: StrategyOptions) {
  const { key, storage } = opts

  return async function (context: KeqExecutionContext, next): Promise<void> {
    const cache = await storage.get(key)

    if (cache) {
      context.emitter.emit('cache:hit', { key, response: cache.response, context })
      const orchestrator = context.orchestration.fork()

      context.res = cache.response

      setTimeout(async () => {
        try {
          await orchestrator.execute()
          const context = orchestrator.context
          const entry = await cacheContext(opts, context)

          if (entry) {
            context.emitter.emit('cache:update', {
              key,
              oldResponse: cache.response,
              newResponse: entry.response,
              context,
            })
          }
        } catch (err) {
        // ignore
        }
      }, 1)
    } else {
      context.emitter.emit('cache:miss', { key, context })
      await next()
      const entry = await cacheContext(opts, context)

      if (entry) {
        context.emitter.emit('cache:update', {
          key,
          oldResponse: undefined,
          newResponse: entry.response,
          context,
        })
      }
    }
  }
}
