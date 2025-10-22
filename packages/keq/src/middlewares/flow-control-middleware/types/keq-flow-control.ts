import { KeqExecutionContext } from '~/context'


export interface KeqFlowControlOptions {
  mode: 'abort' | 'serial'
  signal: string | ((ctx: KeqExecutionContext) => string)
}

export type KeqFlowControlMode = KeqFlowControlOptions['mode']
export type KeqFlowControlSignal = KeqFlowControlOptions['signal']
