import { KeqMiddleware } from 'keq'
import { Promisable } from 'type-fest'


export function catchException(handler: (e: unknown) => Promisable<void>): KeqMiddleware {
  return async function catchException(ctx, next) {
    try {
      await next()
    } catch (err) {
      await handler(err)
    }
  }
}
