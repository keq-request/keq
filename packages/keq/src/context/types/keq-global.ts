import type { Semaphore } from '~/utils/index.js'


export interface KeqGlobalCore {
  abortFlowControl?: Record<string, ((reason: any) => void) | undefined>
  serialFlowControl?: Record<string, Semaphore>
  mutexFlowControl?: Set<string>
}

export interface KeqGlobal {
  core?: KeqGlobalCore
}
