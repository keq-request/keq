import type { queueAsPromised } from 'fastq'
import * as fastq from 'fastq'
import { KeqMiddleware } from '~/middleware/types'

import type { KeqNext } from '~/middleware/types/keq-next.js'


export function keqSerialFlowControlMiddleware(): KeqMiddleware {
  return async function serialFlowControlMiddleware(ctx, next) {
    if (!ctx.options.flowControl || ctx.options.flowControl.mode !== 'serial') {
      await next()
      return
    }

    const { signal } = ctx.options.flowControl

    const key = typeof signal === 'string' ? signal : signal(ctx)

    if (!ctx.global.serialFlowControl) ctx.global.serialFlowControl = {}

    if (!ctx.global.serialFlowControl[key]) {
      ctx.global.serialFlowControl[key] = fastq.promise(async (next: KeqNext) => {
        await next()
      }, 1)
    }

    const queue: queueAsPromised<KeqNext> = ctx.global.serialFlowControl[key]
    await queue.push(next)
  }
}
