import type { queueAsPromised } from 'fastq'
import type { KeqNext } from '~/middleware/index.js'


export interface KeqGlobalCore {
  abortFlowControl?: Record<string, ((reason: any) => void) | undefined>
  serialFlowControl?: Record<string, queueAsPromised<{ next: KeqNext }, void>>
  mutexFlowControl?: Set<string>
}

export interface KeqGlobal {
  core?: KeqGlobalCore
}
