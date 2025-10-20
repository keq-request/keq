import { CacheEntry } from '~/cache-entry/index.js'
import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'


export const cacheFirst: KeqCacheStrategy = function (opts) {
  const { storage, key } = opts

  return async function (context, next): Promise<void> {
    const cache = await storage.get(key)

    if (cache) {
      // hit cache
      context.emitter.emit('cache:hit', { key, response: cache.response, context })
      context.res = cache.response
      return
    }

    context.emitter.emit('cache:miss', { key, context })

    await next()

    if (context.response) {
      if (!opts.exclude || !(await opts.exclude(context.response))) {
        const entry = await CacheEntry.build({
          key: key,
          response: context.response,
          expiredAt: undefined,
          ttl: opts.ttl,
        })

        // Set cache if not excluded
        storage.set(entry)

        context.emitter.emit('cache:set', { key, response: entry.response, context })
      }
    }
  }
}
