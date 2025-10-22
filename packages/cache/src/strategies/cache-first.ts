import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { cacheContext } from './utils'


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
