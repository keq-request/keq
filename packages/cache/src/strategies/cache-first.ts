import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'


export const cacheFirst: KeqCacheStrategy = async function cacheFirst(handler, context, next): Promise<void> {
  // return async function (context, next): Promise<void> {
  const [cacheKey, cacheValue] = await handler.getCache(context)

  if (cacheValue) {
    // hit cache
    context.emitter.emit('cache:hit', { key: cacheKey, response: cacheValue.response, context })
    context.res = cacheValue.response
    return
  }

  context.emitter.emit('cache:miss', { key: cacheKey, context })

  await next()

  const [, entry] = await handler.setCache(context)
  if (entry) {
    context.emitter.emit('cache:update', {
      key: entry.key,
      oldResponse: undefined,
      newResponse: entry.response,
      context,
    })
  }
}
