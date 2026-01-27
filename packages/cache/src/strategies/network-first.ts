import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { Logger } from '~/utils'


export const networkFirst: KeqCacheStrategy = async function networkFirst(handler, context, next) {
  try {
    await next()

    const [cacheKey, cache] = await handler.getCache()
    const [,entry] = await handler.setCache(context)

    if (handler.options.debug) {
      Logger.debug([
        '',
        `Request: ${context.request.method.toUpperCase()} ${context.request.__url__.href}`,
        'Strategy: Network First',
        `Cache Key: ${cacheKey}`,
        `ACTIONS: ${entry ? 'UPDATED' : 'EXCLUDED'}`,
      ].join('\n'))
    }

    if (entry) {
      context.emitter.emit('cache:update', {
        key: entry.key,
        oldResponse: cache?.response,
        newResponse: entry.response,
        context,
      })
    }
  } catch (err) {
    const [cacheKey, cache] = await handler.getCache()

    if (handler.options.debug) {
      Logger.debug([
        '',
        `Request: ${context.request.method.toUpperCase()} ${context.request.__url__.href}`,
        'Strategy: Network First',
        `Cache Key: ${cacheKey}`,
        `Cache Status: ${cache ? 'HIT' : 'MISS'}`,
      ].join('\n'))
    }

    if (!cache) {
      context.emitter.emit('cache:miss', { key: cacheKey, context })
      throw err
    }

    context.emitter.emit('cache:hit', { key: cacheKey, response: cache.response, context })
    context.res = cache.response
  }
}
