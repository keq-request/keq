import { createResponseProxy } from 'keq'
import { CacheEntry } from '~/cache-entry/index.js'
import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { StrategyOptions } from '~/types/strategies-options.js'

export const staleWhileRevalidate: KeqCacheStrategy = function (opts: StrategyOptions) {
  const { key, storage } = opts

  return async function (ctx, next): Promise<void> {
    const cache = await storage.get(key)
    if (cache) {
      // Create a Response that can be consumed multiple time
      const cacheResponseProxy = createResponseProxy(cache.response)

      // Set the response in the context and return immediately
      // Then, the cache will be updated after the `next()` is called
      Object.defineProperty(ctx, 'res', {
        get() {
          return cache.response
        },
        async set(value) {
          if (!opts.exclude || !(await opts.exclude(value))) {
            storage.set(await CacheEntry.build({
              key: key,
              response: value,
              ttl: opts.ttl,
            }))
          }

          if (opts.onNetworkResponse) {
            opts.onNetworkResponse(value.clone(), cacheResponseProxy.clone())
          }
        },
      })

      Object.defineProperty(ctx, 'response', {
        get() {
          return cacheResponseProxy
        },
        set() {
        // ignore
        },
      })

      // Avoid next function not called warning
      ctx.metadata.entryNextTimes = 1
      ctx.metadata.outNextTimes = 1

      // --- middleware returned ---

      /**
       * After the middleware returned, keq@2 will prevent the `next()` from running again.
       * You can force `next()` to run by setting `ctx.metadata.finished` to `false`.
       */
      setTimeout(async () => {
        try {
          ctx.metadata.finished = false
          await next()
        } catch (err) {
        // ignore
        }
      }, 1)
    } else {
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
          opts.onNetworkResponse(ctx.response.clone())
        }
      }
    }
  }
}
