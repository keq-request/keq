import type { Emitter } from 'mitt'
import { KeqContext } from '../context'
import { KeqSharedContext } from '../shared-context'


export interface KeqEvents {
  fetch: KeqContext
  retry: KeqSharedContext
}

export type KeqListeners = {
  [K in keyof KeqEvents]?: ((data: KeqEvents[K]) => void)[]
}


export type KeqContextEmitter = Emitter<Omit<KeqEvents, never>>
