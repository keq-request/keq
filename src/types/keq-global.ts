import { queueAsPromised } from 'fastq'
import { KeqNext } from './keq-next.js'


export interface KeqGlobal {
  abortFlowControl?: Record<string, ((reason: any) => void) | undefined>
  serialFlowControl?: Record<string, queueAsPromised<KeqNext, void>>
}
