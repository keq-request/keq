import { keqSerialFlowControlMiddleware } from './serial-flow-control-middleware'
import { keqAbortFlowControlMiddleware } from './abort-flow-control-middleware'
import { keqMutexFlowControlMiddleware } from './mutex-flow-control-middleware'
import { KeqMiddleware } from '~/middleware/types'
import { composeMiddleware } from '~/middleware/utils'

export * from './types/keq-flow-control.js'


export function keqFlowControlMiddleware(): KeqMiddleware {
  return composeMiddleware(
    [keqMutexFlowControlMiddleware(), keqSerialFlowControlMiddleware(), keqAbortFlowControlMiddleware()],
    { name: 'flowControlMiddleware' },
  )
}
