import { KeqExecutionContext } from '~/context/index.js'


export interface KeqFlowControlOptions {
  mode: 'abort' | 'serial' | 'concurrent' | 'mutex'
  concurrencyLimit?: number
  signal: string | ((ctx: KeqExecutionContext) => string)
}

export type KeqFlowControlMode = KeqFlowControlOptions['mode']
export type KeqFlowControlSignal = KeqFlowControlOptions['signal']
