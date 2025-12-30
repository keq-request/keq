import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { Logger } from '~/utils'

export const staleWhileRevalidate: KeqCacheStrategy = async function (handler, context, next) {
  const [cacheKey, cache] = await handler.getCache(context)

  if (handler.options.debug) {
    Logger.debug([
      '',
      `Request: ${context.request.method.toUpperCase()} ${context.request.__url__.href}`,
      'Strategy: Stale While Revalidate',
      `Cache Key: ${cacheKey}`,
      `Cache Status: ${cache ? 'HIT' : 'MISS'}`,
    ].join('\n'))
  }

  if (cache) {
    context.emitter.emit('cache:hit', { key: cacheKey, response: cache.response, context })
  } else {
    context.emitter.emit('cache:miss', { key: cacheKey, context })
  }


  if (cache) {
    const orchestrator = context.orchestration.fork()

    context.res = cache.response

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
      try {
        await orchestrator.execute()
        const context = orchestrator.context
        const [cacheKey, entry] = await handler.setCache(context)

        if (handler.options.debug) {
          Logger.debug([
            '',
            `Request: ${context.request.method.toUpperCase()} ${context.request.__url__.href}`,
            'Strategy: Stale While Revalidate',
            `Cache Key: ${cacheKey}`,
            `ACTIONS: ${entry ? 'UPDATED' : 'EXCLUDED'}`,
          ].join('\n'))
        }

        if (entry) {
          context.emitter.emit('cache:update', {
            key: cacheKey,
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
    await next()
    const [cacheKey, entry] = await handler.setCache(context)

    if (handler.options.debug) {
      Logger.debug([
        '',
        `Request: ${context.request.method.toUpperCase()} ${context.request.__url__.href}`,
        'Strategy: Stale While Revalidate',
        `Cache Key: ${cacheKey}`,
        `ACTIONS: ${entry ? 'UPDATED' : 'EXCLUDED'}`,
      ].join('\n'))
    }

    if (entry) {
      context.emitter.emit('cache:update', {
        key: cacheKey,
        oldResponse: undefined,
        newResponse: entry.response,
        context,
      })
    }
  }
}
