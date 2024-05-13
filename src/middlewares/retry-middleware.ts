import { KeqMiddleware } from '~/types/keq-middleware'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function retryMiddleware(): KeqMiddleware {
  return async function retryMiddleware(ctx, next) {
    const retryTimes = (Number(ctx.options.retryTimes) || 0) + 1

    const retryDelay = ctx.options.retryDelay || 10
    const retryOn = ctx.options.retryOn

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

      const delay = typeof retryDelay === 'function' ? retryDelay(i, err, ctx) : retryDelay
      if (delay > 0) await sleep(delay)
    }
  }
}
