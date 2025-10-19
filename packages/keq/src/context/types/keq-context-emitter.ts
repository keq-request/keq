import type { Emitter } from 'mitt'
import { KeqContext } from '../context'
import { KeqSharedContext } from '../shared-context'


export interface KeqEvents {
  retry: { context: KeqSharedContext }
  error: { context: KeqSharedContext }
  abort: {
    context: KeqSharedContext
    reason: any
  }

  timeout: { context: KeqContext }

  'fetch:before': { context: KeqContext }
  'fetch:after': { context: KeqContext }

  'middleware:before': { context: KeqContext }
  'middleware:after': { context: KeqContext }
}

export type KeqListeners = {
  [K in keyof KeqEvents]?: ((data: KeqEvents[K]) => void)[]
}


export type KeqContextEmitter = Emitter<Omit<KeqEvents, never>>
