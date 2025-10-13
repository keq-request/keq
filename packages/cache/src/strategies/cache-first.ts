import { createResponseProxy } from 'keq'
import { CacheEntry } from '~/cache-entry/index.js'
import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'


export const cacheFirst: KeqCacheStrategy = function (opts) {
  const { storage, key, onNetworkResponse } = opts

  return async function (ctx, next): Promise<void> {
    const cache = await storage.get(key)
    let cacheResponseProxy: Response | undefined

    if (cache) {
      // hit cache

      // Create a Response that can be consumed multiple time
      cacheResponseProxy = createResponseProxy(cache?.response)

      ctx.res = cache.response
      ctx.response = cacheResponseProxy

      // Avoid next function not called warning
      ctx.metadata.entryNextTimes = 1
      ctx.metadata.outNextTimes = 1

      return
    }

    await next()

    if (ctx.response) {
      if (!opts.exclude || !(await opts.exclude(ctx.response))) {
        // Set cache if not excluded
        storage.set(await CacheEntry.build({
          key: key,
          response: ctx.response,
          expiredAt: undefined,
          ttl: opts.ttl,
        }))
      }

      if (onNetworkResponse) {
        onNetworkResponse(ctx.response.clone(), cacheResponseProxy?.clone())
      }
    }
  }
}
