import type { queueAsPromised } from 'fastq'
import type { KeqNext } from './keq-next.js'


export interface KeqGlobal {
  abortFlowControl?: Record<string, ((reason: any) => void) | undefined>
  serialFlowControl?: Record<string, queueAsPromised<KeqNext, void>>
}
