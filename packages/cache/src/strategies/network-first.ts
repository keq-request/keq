import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'


export const networkFirst: KeqCacheStrategy = async function networkFirst(handler, context, next) {
  try {
    await next()

    const [,cache] = await handler.getCache(context)
    const [,entry] = await handler.setCache(context)
    if (entry) {
      context.emitter.emit('cache:update', {
        key: entry.key,
        oldResponse: cache?.response,
        newResponse: entry.response,
        context,
      })
    }
  } catch (err) {
    const [key, cache] = await handler.getCache(context)
    if (!cache) {
      context.emitter.emit('cache:miss', { key, context })
      throw err
    }

    context.emitter.emit('cache:hit', { key, response: cache.response, context })
    context.res = cache.response
  }
}
