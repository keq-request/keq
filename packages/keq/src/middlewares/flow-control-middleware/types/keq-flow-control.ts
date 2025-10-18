import { KeqContext } from '~/context'


export interface KeqFlowControlOptions {
  mode: 'abort' | 'serial'
  signal: string | ((ctx: KeqContext) => string)
}

export type KeqFlowControlMode = KeqFlowControlOptions['mode']
export type KeqFlowControlSignal = KeqFlowControlOptions['signal']
