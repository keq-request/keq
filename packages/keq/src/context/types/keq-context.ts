import { KeqRequestInit } from '~/request-init/index.js'
import { KeqContextEmitter } from './keq-context-emitter.js'
import { KeqContextOptions } from './keq-context-options/index.js'
import { KeqGlobal } from './keq-global.js'
import { KeqContextData } from './keq-context-data.js'


export interface KeqContext {
  locationId?: string
  request: KeqRequestInit
  response?: Response
  res?: Response
  output?: any
  global: KeqGlobal
  emitter: KeqContextEmitter
  options: KeqContextOptions
  data: KeqContextData
}
