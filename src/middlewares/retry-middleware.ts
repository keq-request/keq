import { NEXT_INVOKED_PROPERTY } from '~/constant.js'
import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRetryDelay } from '~/types/keq-retry-delay.js'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function retryMiddleware(): KeqMiddleware {
  return async function retryMiddleware(ctx, next) {
    const retryTimes = (Number(ctx.options.retryTimes) || 0) + 1

    const retryDelay: KeqRetryDelay = (attempt, error, ctx): number => {
      if (typeof ctx.options.retryDelay === 'function') {
        return ctx.options.retryDelay(attempt, error, ctx)
      } else if (typeof ctx.options.retryDelay === 'number') {
        return ctx.options.retryDelay
      }

      return 10
    }

    const retryOn = typeof ctx.options.retryOn === 'function' ? ctx.options.retryOn : undefined

    // Avoid multiple middleware from being added repeatedly
    ctx.options = {
      ...ctx.options,
      retryTimes: undefined,
      retryDelay: undefined,
      retryOn: undefined,
    }


    for (let i = 0; i < retryTimes; i++) {
      let err: unknown | null = null

      try {
        ctx[NEXT_INVOKED_PROPERTY].entryNextTimes = 0
        ctx[NEXT_INVOKED_PROPERTY].outNextTimes = 0
        await next()
      } catch (e) {
        err = e
      }

      if (i === retryTimes - 1) {
        if (err) throw err
        break
      }

      if (retryOn && retryOn(i, err, ctx) === false) {
        if (err) throw err
        break
      } else if (!retryOn && !err) {
        break
      }

      const delay = retryDelay(i, err, ctx)
      if (delay > 0) await sleep(delay)
    }
  }
}
