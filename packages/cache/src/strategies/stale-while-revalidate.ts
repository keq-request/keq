import { CacheEntry } from '~/cache-entry/index.js'
import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { StrategyOptions } from '~/types/strategies-options.js'

export const staleWhileRevalidate: KeqCacheStrategy = function (opts: StrategyOptions) {
  const { key, storage } = opts

  return async function (context, next): Promise<void> {
    const cache = await storage.get(key)
    if (cache) {
      context.emitter.emit('cache:hit', { key, response: cache.response, context })
      // Create a Response that can be consumed multiple time
      // const cacheResponseProxy = createResponseProxy(cache.response)

      // context.res = new Proxy(cache.response, {
      // })
      const orchestrator = context.orchestration.fork()

      context.res = cache.response

      // // Set the response in the context and return immediately
      // // Then, the cache will be updated after the `next()` is called
      // Object.defineProperty(context, 'res', {
      //   get() {
      //     return cache.response
      //   },
      //   async set(value) {
      //     if (!opts.exclude || !(await opts.exclude(value))) {
      //       storage.set(await CacheEntry.build({
      //         key: key,
      //         response: value,
      //         ttl: opts.ttl,
      //       }))
      //     }
      //   },
      // })

      setTimeout(async () => {
        try {
          orchestrator.execute()
          await next()
        } catch (err) {
        // ignore
        }
      }, 1)
    } else {
      context.emitter.emit('cache:miss', { key, context })

      await next()

      if (context.response) {
        if (!opts.exclude || !(await opts.exclude(context.response))) {
          const entry = await CacheEntry.build({
            key: key,
            response: context.response,
            ttl: opts.ttl,
          })
          storage.set(entry)
          context.emitter.emit('cache:set', { key, response: entry.response, context })
        }
      }
    }
  }
}
