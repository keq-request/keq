import { KeqContext, KeqMiddleware } from 'keq'
import { Promisable } from 'type-fest'


export type Check = (ctx: KeqContext) => Promisable<void>

export function throwException(check: Check): KeqMiddleware {
  return async function throwException(ctx, next) {
    await next()

    await check(ctx)
  }
}
