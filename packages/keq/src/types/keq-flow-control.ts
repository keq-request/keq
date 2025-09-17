import type { KeqContext } from './keq-context.js'


export interface KeqFlowControl {
  mode: 'abort' | 'serial'
  signal: string | ((ctx: KeqContext) => string)
}

export type KeqFlowControlMode = KeqFlowControl['mode']
export type KeqFlowControlSignal = KeqFlowControl['signal']
