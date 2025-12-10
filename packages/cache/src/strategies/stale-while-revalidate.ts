import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'

export const staleWhileRevalidate: KeqCacheStrategy = async function (handler, context, next) {
  const [key, cache] = await handler.getCache(context)
  // await storage.get(key)

  if (cache) {
    context.emitter.emit('cache:hit', { key, response: cache.response, context })
    const orchestrator = context.orchestration.fork()

    context.res = cache.response

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
      try {
        await orchestrator.execute()
        const context = orchestrator.context
        const [,entry] = await handler.setCache(context)
        // await cacheContext(opts, context)

        if (entry) {
          context.emitter.emit('cache:update', {
            key,
            oldResponse: cache.response,
            newResponse: entry.response,
            context,
          })
        }
      } catch (err) {
        // ignore
      }
    }, 1)
  } else {
    context.emitter.emit('cache:miss', { key, context })
    await next()
    const [,entry] = await handler.setCache(context)

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
