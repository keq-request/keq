import { SESSION_ABORTED_PROPERTY, SESSION_ABORT_CONTROLLER_PROPERTY } from '../constant.js'

import type { KeqMiddleware } from '~/types/keq-middleware.js'
import type { KeqRetryDelay } from '~/types/keq-retry.js'

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.resolve()

  return new Promise((resolve) => {
    const timer = setTimeout(() => finish(), ms)

    function finish(): void {
      clearTimeout(timer)
      signal?.removeEventListener('abort', finish)
      resolve()
    }

    signal?.addEventListener('abort', finish, { once: true })
  })
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
      // The request has been aborted by user, stop retrying
      if (ctx[SESSION_ABORTED_PROPERTY]) throw ctx[SESSION_ABORTED_PROPERTY]

      let err: unknown | null = null

      try {
        ctx.fetchArguments = undefined
        ctx.response = undefined
        ctx.req = undefined
        ctx.metadata.entryNextTimes = 0
        ctx.metadata.outNextTimes = 0
        await next()
      } catch (e) {
        err = e
      }

      // The request has been aborted by user, stop retrying
      if (ctx[SESSION_ABORTED_PROPERTY]) throw ctx[SESSION_ABORTED_PROPERTY]

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

      if (delay > 0) await sleep(delay, ctx[SESSION_ABORT_CONTROLLER_PROPERTY]?.signal)
    }
  }
}
