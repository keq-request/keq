import * as fastq from 'fastq'
import { KeqGlobal } from '~/context'
import type { KeqMiddleware } from '~/middleware/types/index.js'


export function keqSerialFlowControlMiddleware(): KeqMiddleware {
  return async function serialFlowControlMiddleware(ctx, next) {
    if (!ctx.options.flowControl || !['serial', 'concurrent'].includes(ctx.options.flowControl.mode)) {
      await next()
      return
    }

    const { signal } = ctx.options.flowControl
    const concurrent = ctx.options.flowControl.mode === 'serial'
      ? 1
      : !ctx.options.flowControl.concurrencyLimit || ctx.options.flowControl.concurrencyLimit < 1
        ? 1
        : Math.floor(ctx.options.flowControl.concurrencyLimit)

    const key = typeof signal === 'string' ? signal : signal(ctx)

    if (!ctx.global.core) ctx.global.core = {}
    if (!ctx.global.core.serialFlowControl) ctx.global.core.serialFlowControl = {}

    if (!ctx.global.core.serialFlowControl[key]) {
      ctx.global.core.serialFlowControl[key] = fastq.promise(async ({ next }) => {
        await next()
      }, concurrent)
    }

    const queue: Required<Required<KeqGlobal>['core']>['serialFlowControl'][string] = ctx.global.core.serialFlowControl[key]

    await queue.push({ next })
  }
}
