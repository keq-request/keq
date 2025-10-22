import { KeqRequestInit } from "~/request-init"
import { KeqContextEmitter } from "./keq-context-emitter"
import { KeqContextOptions } from "./keq-context-options"
import { KeqGlobal } from "./keq-global"
import { KeqContextData } from "./keq-context-data"


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
