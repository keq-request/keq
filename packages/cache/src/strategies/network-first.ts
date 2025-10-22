import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { StrategyOptions } from '~/types/strategies-options.js'
import { cacheContext } from './utils'


export const networkFirst: KeqCacheStrategy = function (opts: StrategyOptions) {
  const { key, storage } = opts

  return async function (context, next): Promise<void> {
    try {
      await next()

      const cache = await storage.get(key)
      const entry = await cacheContext(opts, context)
      if (entry) {
        context.emitter.emit('cache:update', {
          key,
          oldResponse: cache?.response,
          newResponse: entry.response,
          context,
        })
      }
    } catch (err) {
      const cache = await storage.get(key)
      if (!cache) {
        context.emitter.emit('cache:miss', { key, context })
        throw err
      }

      context.emitter.emit('cache:hit', { key, response: cache.response, context })
      context.res = cache.response
    }
  }
}
