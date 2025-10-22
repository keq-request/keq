import type { Emitter } from 'mitt'
import { KeqExecutionContext } from '../execution-context'
import { KeqSharedContext } from '../shared-context'


export interface KeqEvents {
  retry: { context: KeqSharedContext }
  error: { context: KeqSharedContext }
  abort: {
    context: KeqSharedContext
    reason: any
  }

  timeout: { context: KeqExecutionContext }

  'fetch:before': { context: KeqExecutionContext }
  'fetch:after': { context: KeqExecutionContext }

  'middleware:before': { context: KeqExecutionContext }
  'middleware:after': { context: KeqExecutionContext }
}

export type KeqListeners = {
  [K in keyof KeqEvents]?: ((data: KeqEvents[K]) => void)[]
}


export type KeqContextEmitter = Emitter<Omit<KeqEvents, never>>
