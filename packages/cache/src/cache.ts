import * as R from 'ramda'
import type { Keq, KeqMiddleware, KeqContext } from 'keq'
import { KeqCacheOption } from './types/keq-cache-option.js'
import { KeqCacheParameters } from './types/keq-cache-parameters.js'
import { KeqCacheRule } from './types/keq-cache-rule.js'
import { StrategyOptions } from './types/strategies-options.js'
import { Exception } from 'keq'


declare module 'keq' {
  export interface KeqMiddlewareOptions<OP> {
    /**
     * [keq-cache](https://github.com/keq-request/keq-cache)
     */
    cache(option: KeqCacheOption): Keq<OP>
  }

  export interface KeqEvents {
    'cache:hit': {
      key: string
      response: Response
      context: KeqContext
    }

    'cache:miss': {
      key: string
      context: KeqContext
    }

    'cache:update': {
      key: string
      oldResponse?: Response
      newResponse: Response
      context: KeqContext
    }
  }
}


export function cache(opts: KeqCacheParameters): KeqMiddleware {
  const storage = opts.storage

  const rules: KeqCacheRule[] = opts?.rules || []

  return async function cache(ctx, next) {
    let cOpt: KeqCacheOption | undefined = ctx.options.cache

    const rule = rules.find((rule) => {
      if (rule.pattern === undefined || rule.pattern === true) return true
      if (typeof rule.pattern === 'function') return rule.pattern(ctx)
      return rule.pattern.test(ctx.request.__url__.href)
    })

    if (rule) cOpt = R.mergeRight(rule, cOpt || {})

    if (!cOpt || R.isEmpty(cOpt)) {
      await next()
      return
    }

    let key = ctx.locationId
    if (cOpt.key) {
      if (typeof cOpt.key === 'function') key = cOpt.key(ctx)
      else key = cOpt.key
    } else if (opts?.keyFactory) {
      key = opts.keyFactory(ctx)
    }

    if (!key) throw new Exception('Cache key is required')

    const strategy = cOpt.strategy

    const opt: StrategyOptions = {
      key,
      storage,
      ttl: cOpt.ttl,
      exclude: cOpt.exclude,
    }

    await strategy(opt)(ctx, next)
  }
}
