import * as R from 'ramda'
import type { Keq, KeqMiddleware, KeqContext } from 'keq'
import { KeqCacheStorage } from './storage/keq-cache-storage.js'
import { RequestCacheHandler } from './request-cache-handler/index.js'
import { KeqCacheKeyFactory, KeqCacheRule, RequestCacheOptions } from './types/index.js'


export interface KeqCacheOptions {
  storage: KeqCacheStorage

  /**
   * Cache Key Factory
   */
  keyFactory?: KeqCacheKeyFactory

  rules?: KeqCacheRule[]
}


declare module 'keq' {
  export interface KeqMiddlewareOptions<OP> {
    /**
     * [keq-cache](https://github.com/keq-request/keq-cache)
     */
    cache(option: RequestCacheOptions | false): Keq<OP>
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


export function cache(options: KeqCacheOptions): KeqMiddleware {
  const storage = options.storage

  const rules: KeqCacheRule[] = options?.rules || []

  return async function cache(ctx, next) {
    if (ctx.options.cache === false) {
      await next()
      return
    }

    let requestCacheOptions: RequestCacheOptions | undefined = ctx.options.cache
    // let requestOptions: KeqCacheRequestOptions | undefined = ctx.options.cache

    const rule = rules.find((rule) => {
      if (rule.pattern === undefined || rule.pattern === true) return true
      if (typeof rule.pattern === 'function') return rule.pattern(ctx)
      return rule.pattern.test(ctx.request.__url__.href)
    })

    if (rule) requestCacheOptions = R.mergeRight(rule, requestCacheOptions || ({} as any))

    if (!requestCacheOptions || R.isEmpty(requestCacheOptions)) {
      await next()
      return
    }

    if (!requestCacheOptions.key) requestCacheOptions.key = options.keyFactory

    if (!ctx.locationId && !requestCacheOptions.key) {
      console.warn('[@keq/cache] Warning: Cannot resolve Cache Key. Cache is skipped.')
      await next()
      return
    }

    const handler = new RequestCacheHandler(storage, requestCacheOptions)

    const strategy = requestCacheOptions.strategy
    await strategy(handler, ctx, next)
  }
}
