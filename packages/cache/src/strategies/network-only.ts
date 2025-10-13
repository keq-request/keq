import { KeqCacheStrategy } from '~/types/keq-cache-strategy.js'
import { StrategyOptions } from '~/types/strategies-options.js'


export const networkOnly: KeqCacheStrategy = function (opts: StrategyOptions) {
  return async function (ctx, next): Promise<void> {
    await next()

    if (ctx.response) {
      if (opts.onNetworkResponse) {
        opts.onNetworkResponse(ctx.response.clone())
      }
    }
  }
}
