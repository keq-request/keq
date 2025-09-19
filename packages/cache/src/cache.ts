import type { Keq, KeqMiddleware } from 'keq'
import { KeqCacheOption } from './types/keq-cache-option.js'
import { KeqCacheParameters } from './types/keq-cache-parameters.js'
import { KeqCacheRule } from './types/keq-cache-rule.js'
import { StrategyOptions } from './types/strategies-options.js'


declare module 'keq' {
  export interface KeqOptions<T> {
    /**
     * [keq-cache](https://github.com/keq-request/keq-cache)
     */
    cache(option: KeqCacheOption): Keq<T>
  }
}


export function cache(opts: KeqCacheParameters): KeqMiddleware {
  const storage = opts.storage

  const rules: KeqCacheRule[] = opts?.rules || []

  return async function cache(ctx, next) {
    let cOpt: KeqCacheOption | undefined = ctx.options.cache

    if (!cOpt) {
      const rule = rules.find((rule) => {
        if (typeof rule.pattern === 'function') return rule.pattern(ctx)
        return rule.pattern.test(ctx.request.__url__.href)
      })

      if (rule) cOpt = rule
    }

    if (!cOpt) {
      await next()
      return
    }

    let key = ctx.identifier
    if (cOpt.key) {
      if (typeof cOpt.key === 'function') key = cOpt.key(ctx)
      else key = cOpt.key
    } else if (opts?.keyFactory) {
      key = opts.keyFactory(ctx)
    }

    const strategy = cOpt.strategy

    const opt: StrategyOptions = {
      key,
      storage,
      ttl: cOpt.ttl,
      exclude: cOpt.exclude,
      onNetworkResponse: cOpt.onNetworkResponse,
    }

    await strategy(opt)(ctx, next)

    // if (strategy === Strategy.NETWORK_FIRST) {
    //   await networkFirst(opt)(ctx, next)
    // } else if (strategy === Strategy.CATCH_FIRST) {
    //   await cacheFirst(opt)(ctx, next)
    // } else if (strategy === Strategy.STALE_WHILE_REVALIDATE) {
    //   await staleWhileRevalidate(opt)(ctx, next)
    // } else if (strategy === Strategy.NETWORK_ONLY) {
    //   await networkOnly(opt)(ctx, next)
    // } else {
    //   throw new TypeError(`Unsupported strategy: ${String(strategy)}`)
    // }
  }
}
