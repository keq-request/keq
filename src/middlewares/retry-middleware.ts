import { NEXT_INVOKED_PROPERTY } from '~/constant.js'
import { KeqMiddleware } from '~/types/keq-middleware'
import { KeqRetryDelay } from '~/types/keq-retry.js'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function retryMiddleware(): KeqMiddleware {
  return async function retryMiddleware(ctx, next) {
    const retryTimes = Number.isInteger(ctx.options.retryTimes)
      ? ctx.options.retryTimes! + 1
      : 1

    const delayOptions = ctx.options.retryDelay
    const retryDelay: KeqRetryDelay = async (attempt, error, ctx): Promise<number> => {
      if (typeof delayOptions === 'function') {
        return delayOptions(attempt, error, ctx)
      } else if (typeof delayOptions === 'number') {
        return delayOptions
      }

      return 0
    }

    const retryOn = typeof ctx.options.retryOn === 'function'
      ? ctx.options.retryOn
      : (attempt, error) => !!error

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
        ctx.fetchArguments = undefined
        ctx.response = undefined
        ctx.req = undefined
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

      if (await retryOn(i, err, ctx) === false) {
        if (err) throw err
        break
      }

      const delay = await retryDelay(i, err, ctx)

      ctx.retry = { attempt: i, error: err, delay }
      ctx.emitter.emit('retry', ctx)

      if (delay > 0) await sleep(delay)
    }
  }
}
