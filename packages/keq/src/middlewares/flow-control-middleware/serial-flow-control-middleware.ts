import type { queueAsPromised } from 'fastq'
import * as fastq from 'fastq'
import type { KeqMiddleware, KeqNext } from '~/middleware/types/index.js'


export function keqSerialFlowControlMiddleware(): KeqMiddleware {
  return async function serialFlowControlMiddleware(ctx, next) {
    if (!ctx.options.flowControl || !['serial', 'concurrent'].includes(ctx.options.flowControl.mode)) {
      await next()
      return
    }

    const { signal } = ctx.options.flowControl
    const concurrent = ctx.options.flowControl.mode === 'serial'
      ? 1
      : !ctx.options.flowControl.concurrencyLimit
        ? 1
        : ctx.options.flowControl.concurrencyLimit < 1
          ? 1
          : parseInt(ctx.options.flowControl.concurrencyLimit as any, 10)

    const key = typeof signal === 'string' ? signal : signal(ctx)

    if (!ctx.global.serialFlowControl) ctx.global.serialFlowControl = {}

    if (!ctx.global.serialFlowControl[key]) {
      ctx.global.serialFlowControl[key] = fastq.promise(async (next: KeqNext) => {
        await next()
      }, concurrent)
    }

    const queue: queueAsPromised<KeqNext> = ctx.global.serialFlowControl[key]
    await queue.push(next)
  }
}
