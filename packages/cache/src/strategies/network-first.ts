import { createResponseProxy } from 'keq'
import { CacheEntry } from '~/cache-entry'
import { KeqCacheStrategy } from '~/types/keq-cache-strategy'
import { StrategyOptions } from '~/types/strategies-options.js'


export const networkFirst: KeqCacheStrategy = function (opts: StrategyOptions) {
  const { key, storage } = opts

  return async function (ctx, next): Promise<void> {
    try {
      await next()

      if (ctx.response) {
        if (!opts.exclude || !(await opts.exclude(ctx.response))) {
          storage.set(await CacheEntry.build({
            key: key,
            response: ctx.response,
            ttl: opts.ttl,
          }))
        }

        if (opts.onNetworkResponse) {
          const cache = await storage.get(key)
          opts.onNetworkResponse(ctx.response.clone(), cache?.response.clone())
        }
      }
    } catch (err) {
      const cache = await storage.get(key)
      if (!cache) throw err

      ctx.res = cache.response
      ctx.response = createResponseProxy(cache.response)
      ctx.metadata.entryNextTimes = 1
      ctx.metadata.outNextTimes = 1
    }
  }
}
