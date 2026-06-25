import type { queueAsPromised } from 'fastq'
import type { KeqNext } from './keq-next.js'


export interface KeqGlobal {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abortFlowControl?: Record<string, ((reason: any) => void) | undefined>
  serialFlowControl?: Record<string, queueAsPromised<KeqNext, void>>
}
