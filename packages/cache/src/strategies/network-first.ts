import { CacheEntry } from '~/cache-entry/index.js'
import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { StrategyOptions } from '~/types/strategies-options.js'


export const networkFirst: KeqCacheStrategy = function (opts: StrategyOptions) {
  const { key, storage } = opts

  return async function (context, next): Promise<void> {
    try {
      await next()

      if (context.response) {
        if (!opts.exclude || !(await opts.exclude(context.response))) {
          const entry = await CacheEntry.build({
            key: key,
            response: context.response,
            expiredAt: undefined,
            ttl: opts.ttl,
          })

          storage.set(entry)

          context.emitter.emit('cache:set', { key, response: entry.response, context })
        }

        // if (opts.onNetworkResponse) {
        //   const cache = await storage.get(key)
        //   opts.onNetworkResponse(ctx.response.clone(), cache?.response.clone())
        // }
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
