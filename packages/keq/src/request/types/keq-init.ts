import { KeqGlobal } from '~/index.js'
import { KeqRequestInit } from '~/request-init/request-init.js'

export type KeqInit = Partial<Omit<KeqRequestInit, 'url' | '__url__' | 'signal' | 'abort' | 'clone'>> & {
  locationId?: string
  global?: KeqGlobal
}
